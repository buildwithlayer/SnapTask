import {createContext, useContext, useEffect, useState} from 'react';
import type {Integration} from '../Content';
import {useLocalStorageContext} from './LocalStorageContext';
import { useProgressContext } from './ProgressContext';

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