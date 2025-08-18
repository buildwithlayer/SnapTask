import {useState} from 'react';
import ExpandIcon from '../assets/expand.svg?react';
import {integrations, useIntegrationContext} from '../contexts/IntegrationContext';
import {useLocalStorageContext} from '../contexts/LocalStorageContext';

export const IntegrationDropdown = () => {
    const {resetLocalStorage} = useLocalStorageContext();
    const {integration, setIntegration} = useIntegrationContext();
    const [focused, setFocused] = useState(false);

    return (
        <>
            {integration && <div className='bg-gray-800 rounded-md px-2 py-1 flex items-center gap-2 relative cursor-pointer hover:bg-gray-850' onClick={() => setFocused(!focused)}>
                <div className='flex items-center gap-2'>{integration.icon}{integration.name}</div>
                <ExpandIcon className={`fill-white w-6 h-6 ${focused ? 'rotate-180' : ''}`} />
                {focused && (
                    <div className='absolute top-full right-0 mt-2 bg-gray-800 shadow-lg z-10 flex flex-col rounded-md overflow-hidden'>
                        <button className='p-2 text-center text-white hover:bg-gray-850 border-b border-gray-700 cursor-pointer' onClick={() => {setFocused(false); resetLocalStorage();}}>
                            <span className='text-nowrap'>See All Integrations</span>
                        </button>
                        {integrations.map((intg) => (
                            <button key={intg.name} className={'flex items-center justify-start p-2 gap-6 bg-transparent text-left text-white disabled:text-gray-500 not-disabled:hover:bg-gray-850 not-disabled:cursor-pointer not-last:border-b border-gray-700 disabled:bg-gray-200'} onClick={() => {setIntegration(intg); setFocused(false);}}>
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