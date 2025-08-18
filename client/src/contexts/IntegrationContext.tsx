import {createContext, useContext, useEffect, useState} from 'react';
import {useLocalStorageContext} from './LocalStorageContext';
import {useProgressContext} from './ProgressContext';
import LinearIcon from '../assets/linear.svg?react';

export interface Integration {
    color: string;
    icon: React.ReactNode;
    name: 'Linear' | 'Mock';
    authProvider: string;
    authToken?: string;
}

export const integrations: Integration[] = [
    {
        color: 'blue',
        icon: <LinearIcon className='fill-white h-6 w-6' />,
        name: 'Linear',
        authProvider: 'linear',
    },
    {
        color: 'green',
        icon: <div className='h-6 w-6 bg-green-500 rounded-md'></div>,
        name: 'Mock',
        authProvider: 'mock',
    },
];


type IntegrationContextType = {
    integration?: Integration;
    setIntegration: (integration: Integration | undefined) => void;
};

const IntegrationContext = createContext<IntegrationContextType>({
    integration: undefined,
    setIntegration: () => {},
});

export const IntegrationProvider = ({children}: { children: React.ReactNode }) => {
    const {getLocalIntegration, setLocalIntegration} = useLocalStorageContext();
    const {setStep} = useProgressContext();
    
    const [integration, setIntegration] = useState<Integration | undefined>(undefined);

    function updateIntegration(newIntegration: Integration | undefined) {
        if (newIntegration && !(newIntegration === integration)) {
            setStep('upload');
        }
        setIntegration(newIntegration);
        setLocalIntegration(newIntegration);
    }

    useEffect(() => {
        const localIntegration = getLocalIntegration();
        setIntegration(localIntegration);
    }, []);

    return (
        <IntegrationContext.Provider value={{integration, setIntegration: updateIntegration}}>
            {children}
        </IntegrationContext.Provider>
    );
};

export const useIntegrationContext = () => useContext(IntegrationContext);