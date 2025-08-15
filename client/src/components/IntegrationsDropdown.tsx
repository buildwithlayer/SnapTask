import {useState} from 'react';
import ExpandIcon from '../assets/expand.svg?react';
import {useIntegrationContext} from '../contexts/IntegrationContext';
import {useLocalStorageContext} from '../contexts/LocalStorageContext';
import {integrations} from '../LandingPage';

export const IntegrationDropdown = () => {
    const {resetLocalStorage} = useLocalStorageContext();
    const {integration, setIntegration} = useIntegrationContext();
    const [focused, setFocused] = useState(false);

    return (
        <>
            {integration && <div className='bg-white rounded-md px-2 py-1 flex items-center gap-2 relative cursor-pointer hover:bg-gray-100' onClick={() => setFocused(!focused)}>
                <div className='flex items-center gap-2' style={{color: integration.color}}>{integration.icon}{integration.name}</div>
                <ExpandIcon className='fill-gray-800 w-6 h-6' />
                {focused && (
                    <div className='absolute top-full right-0 mt-2 bg-white shadow-lg z-10 flex flex-col rounded-md overflow-hidden'>
                        <button className='p-2 text-center text-gray-600 hover:bg-gray-100 border-b border-gray-300 cursor-pointer' onClick={() => {setFocused(false); resetLocalStorage();}}>
                            <span>See All Integrations</span>
                        </button>
                        {integrations.map((intg) => (
                            <button key={intg.name} className={'flex items-center justify-start p-2 gap-6 bg-transparent text-left text-gray-800 disabled:text-gray-500 not-disabled:hover:bg-gray-100 not-disabled:cursor-pointer border-b border-gray-300 disabled:bg-gray-200'} onClick={() => {setIntegration(intg); setFocused(false);}} style={{color: intg.color}}>
                                <div className="flex items-center gap-3">
                                    {intg.icon}
                                    <span>{intg.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>}
        </>
    );
};   