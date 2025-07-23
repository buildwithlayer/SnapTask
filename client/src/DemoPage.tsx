import * as amplitude from '@amplitude/analytics-browser';
import demoHero from './assets/demo-hero.png';
import Logo from './assets/snaplinear.svg?react';
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
                    className="w-full h-full flex flex-col justify-center items-center px-4 text-center md:text-left">
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default DemoPage;