import * as amplitude from '@amplitude/analytics-browser';
import type React from 'react';
import {useState} from 'react';
import toast from 'react-hot-toast';
import AsanaIcon from './assets/asana.svg?react';
import ClickupIcon from './assets/clickup.svg?react';
import CloseIcon from './assets/close.svg?react';
import demoHero from './assets/demo-hero.png';
import JiraIcon from './assets/jira.svg?react';
import MondayIcon from './assets/monday.svg?react';
import Logo from './assets/snaplinear.svg?react';
import TrelloIcon from './assets/trello.svg?react';
import Button from './components/Button';
import FileUpload from './FileUpload';

const DemoPage = () => {
    let splitTestVersion: string | undefined;
    if (!localStorage.getItem('splitTestVersion')) {
        splitTestVersion = Math.random() < 0.5 ? 'Demo_CTA_Try' : 'DEMO_CTA_Record';
        localStorage.setItem('splitTestVersion', splitTestVersion);
        const identify = new amplitude.Identify();
        identify.set('split_test_version', splitTestVersion);
        amplitude.identify(identify);
    } else {
        splitTestVersion = localStorage.getItem('splitTestVersion') || undefined;
    }

    return (
        <>
            <div className="w-full h-full flex flex-col justify-start items-center overflow-auto bg-linear-to-b from-primary/30 to-black">
                <div
                    className="w-full h-full flex flex-col justify-start items-center px-4 text-center md:text-left">
                    <div className="max-w-content-max-width w-full flex flex-col items-center gap-12 py-[72px]">
                        <div className="flex items-center gap-4">
                            <Logo className="w-8 h-8 fill-white"/>
                            <h1 className='font-bold text-4xl'>SnapLinear</h1>
                        </div>
                        <h1 className='text-center font-bold text-4xl/tight md:text-6xl/tight max-w-[900px]'>
                            Turn your meetings into actionable tasks in Linear
                        </h1>
                        <img src={demoHero} alt="Meeting being converted to Linear tasks" className="w-full max-w-[800px]" />
                        <FileUpload demo={true} splitTestVersion={splitTestVersion} />
                        <div className="flex flex-col gap-2">
                            <p>Don't use Linear? Let us know which service you want us to expand to!</p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <OtherServiceOption serviceName='Jira' serviceIcon={<JiraIcon className='w-6 h-6' />} />
                                <OtherServiceOption serviceName='ClickUp' serviceIcon={<ClickupIcon className='w-6 h-6' />} />
                                <OtherServiceOption serviceName='Trello' serviceIcon={<TrelloIcon className='w-6 h-6' />} />
                                <OtherServiceOption serviceName='Monday' serviceIcon={<MondayIcon className='w-6 h-6' />} />
                                <OtherServiceOption serviceName='Asana' serviceIcon={<AsanaIcon className='w-6 h-6' />} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const OtherServiceOption = ({serviceIcon, serviceName}: {serviceIcon: React.ReactNode, serviceName: string}) => {
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [email, setEmail] = useState('');

    function handleSubmit() {
        const identify = new amplitude.Identify();
        identify.set('email', email);
        identify.set('linear_user_id', email);
        amplitude.identify(identify);
        amplitude.track('Other Integration Requested', {
            email: email,
            service: serviceName,
        });
        setEmailModalOpen(false);
        toast.success(`Thank you! We'll notify you with updates about our upcoming ${serviceName} integration.`);
    }

    return (
        <>
            <div className="flex items-center gap-3 justify-center pl-2 pr-3 py-2 bg-gray-850 border border-gray-700 rounded-sm hover:bg-gray-900 cursor-pointer" onClick={() => setEmailModalOpen(true)}>
                {serviceIcon}
                <span>{serviceName}</span>
            </div>
            {emailModalOpen &&
            <div className='absolute top-0 left-0 w-full h-full bg-white/20 backdrop-blur-md flex items-center justify-center p-4'>
                <div className="flex flex-col gap-4 bg-black text-white p-4 rounded-md max-w-lg w-full">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {serviceIcon}
                            <h2 className="text-lg font-bold">Interested in a {serviceName} integration?</h2>
                        </div>
                        <div className="p-2 cursor-pointer hover:bg-white/20 rounded-full" onClick={() => setEmailModalOpen(false)}>
                            <CloseIcon className="w-6 h-6 fill-white" />
                        </div>
                    </div>
                    <p className='text-gray-200'>Please provide your email below for updates.</p>
                    <form className='flex flex-col gap-4' onSubmit={(e) => {e.preventDefault(); handleSubmit();}}>
                        <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="outline-none border border-gray-600 p-2 rounded-md focus:border-primary" placeholder="you@example.com" />
                        <Button disabled={!email} type="submit">Submit</Button>
                    </form>
                </div>
            </div>
            }
        </>
    );
};

export default DemoPage;