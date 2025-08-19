import {createContext, useContext, useEffect, useState} from 'react';
import LinearIcon from '../assets/linear.svg?react';
import AsanaIcon from '../assets/asana.svg?react';
import {useLocalStorageContext} from './LocalStorageContext';
import {useProgressContext} from './ProgressContext';

export interface Integration {
    authProvider: string;
    color: string;
    icon: React.ReactNode;
    name: string;
}

export const integrations: Integration[] = [
    {
        authProvider: 'linear',
        color: 'blue',
        icon: <LinearIcon className='fill-white h-6 w-6' />,
        name: 'Linear',
    },
    {
        authProvider: 'asana',
        color: 'orange',
        icon: <AsanaIcon className='fill-white h-6 w-6' />,
        name: 'Asana',
    },
    {
        authProvider: 'mock',
        color: 'green',
        icon: <div className='h-6 w-6 bg-green-500 rounded-md'></div>,
        name: 'Mock',
    },
];


type IntegrationContextType = {
    authToken?: string;
    integration?: Integration;
    setAuthToken: (token: string | undefined) => void;
    setIntegration: (integration: Integration | undefined) => void;
};

const IntegrationContext = createContext<IntegrationContextType>({
    setAuthToken: () => {},
    setIntegration: () => {},
});

export const IntegrationProvider = ({children}: { children: React.ReactNode }) => {
    const {getLocalAuthToken, getLocalIntegration, setLocalAuthToken, setLocalIntegration, resetLocalStorage} = useLocalStorageContext();
    const {setStep, step} = useProgressContext();

    const [integration, setIntegration] = useState<Integration | undefined>(undefined);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);

    function updateIntegration(newIntegration: Integration | undefined) {
        resetLocalStorage();
        switch (newIntegration?.authProvider) {
        case 'linear':
            window.location.href = (`https://linear.app/oauth/authorize?client_id=${import.meta.env.VITE_LINEAR_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_LINEAR_REDIRECT_URI}&response_type=code&scope=read,write`);
            break;
        case 'asana':
            window.location.href = (`https://app.asana.com/-/oauth_authorize?client_id=${import.meta.env.VITE_ASANA_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_ASANA_REDIRECT_URI}&response_type=code&scope=projects:read%20tasks:read%20custom_fields:read%20tasks:write%20teams:read%20users:read`);
            break;
        case 'mock':
            updateAuthToken('');
            break;
        default:
            break;
        }
        setIntegration(newIntegration);
        setLocalIntegration(newIntegration);
    }

    function updateAuthToken(token: string | undefined) {
        setAuthToken(token);
        setLocalAuthToken(token);
    }

    useEffect(() => {
        const localIntegration = getLocalIntegration();
        setIntegration(localIntegration);

        const localAuthToken = getLocalAuthToken();
        setAuthToken(localAuthToken);
    }, []);

    useEffect(() => {
        if (authToken !== undefined && step === 'select-integration') {
            setStep('upload');
        }
    }, [authToken, step]);

    return (
        <IntegrationContext.Provider value={{authToken, integration, setAuthToken: updateAuthToken, setIntegration: updateIntegration}}>
            {children}
        </IntegrationContext.Provider>
    );
};

export const useIntegrationContext = () => useContext(IntegrationContext);