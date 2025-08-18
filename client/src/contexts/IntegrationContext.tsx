import {createContext, useContext, useEffect, useState} from 'react';
import LinearIcon from '../assets/linear.svg?react';
import {useLocalStorageContext} from './LocalStorageContext';
import {useProgressContext} from './ProgressContext';

export interface Integration {
    authProvider: string;
    color: string;
    icon: React.ReactNode;
    name: 'Linear' | 'Mock';
}

export const integrations: Integration[] = [
    {
        authProvider: 'linear',
        color: 'blue',
        icon: <LinearIcon className='fill-white h-6 w-6' />,
        name: 'Linear',
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
    const {getLocalAuthToken, getLocalIntegration, setLocalAuthToken, setLocalIntegration} = useLocalStorageContext();
    const {setStep, step} = useProgressContext();
    
    const [integration, setIntegration] = useState<Integration | undefined>(undefined);
    const [authToken, setAuthToken] = useState<string | undefined>(undefined);

    function updateIntegration(newIntegration: Integration | undefined) {
        switch (newIntegration?.authProvider) {
        case 'linear':
            const clientId = '93f267ac74cd3d021d8b119586d04842';
            const redirectUrl = 'http://localhost:5174/oauth/linear/callback';
            window.location.href = (`https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=read,write`);
            break;
        case 'mock':
            // Handle Mock integration
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
        if (authToken && step === 'select-integration') {
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