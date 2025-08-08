import React from 'react';
import AsanaIcon from '../assets/asana.svg?react';
import ExpandIcon from '../assets/expand.svg?react';
import JiraIcon from '../assets/jira.svg?react';
import LinearIcon from '../assets/linear.svg?react';
import {useIntegrationContext} from '../contexts/IntegrationContext';
import {useLocalStorageContext} from '../contexts/LocalStorageContext';

export interface Integration {
    available: boolean;
    color: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    name: string;
}

export const integrations: Integration[] = [
    {available: true, color: '#000', icon: <LinearIcon className='w-6 h-6' />, name: 'Linear'},
    {available: false, color: '#2684FF', icon: <JiraIcon className='w-6 h-6' />, name: 'Jira'},
    {available: false, color: '#F06A6A', icon: <AsanaIcon className='w-6 h-6' />, name: 'Asana'},
];

const IntegrationOption = ({integration}: {integration: Integration}) => {
    const {setIntegration} = useIntegrationContext();

    return (
        <button disabled={!integration.available} className={'flex items-center justify-center p-4 gap-4 w-full bg-white disabled:bg-gray-200 rounded-md not-disabled:hover:bg-gray-100 not-disabled:cursor-pointer'} onClick={() => setIntegration(integration)} style={{color: integration.color}}>
            <div className="flex items-center gap-2">
                {integration.icon}
                <span>{integration.name}</span>
            </div>
            {!integration.available && <span className={'px-1 py-0.5 border rounded-md text-sm'} style={{borderColor: integration.color, color: integration.color}}>Coming soon</span>}
        </button>
    );
};

export const IntegrationDropdown = () => {
    const {resetLocalStorage} = useLocalStorageContext();
    const {integration, setIntegration} = useIntegrationContext();
    const [focused, setFocused] = React.useState(false);

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
                            <button key={intg.name} disabled={!intg.available} className={'flex items-center justify-start p-2 gap-6 bg-transparent text-left text-gray-800 disabled:text-gray-500 not-disabled:hover:bg-gray-100 not-disabled:cursor-pointer border-b border-gray-300 disabled:bg-gray-200'} onClick={() => {setIntegration(intg); setFocused(false);}} style={{color: intg.color}}>
                                <div className="flex items-center gap-3">
                                    {intg.icon}
                                    <span>{intg.name}</span>
                                </div>
                                {!intg.available && <span className={'whitespace-nowrap w-fit px-1 py-0.5 border rounded-md text-sm ml-auto'} style={{borderColor: intg.color, color: intg.color}}>Coming soon</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>}
        </>
    );
};   

export default IntegrationOption;