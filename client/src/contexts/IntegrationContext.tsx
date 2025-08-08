import {createContext, useContext, useState} from 'react';
import type {Integration} from '../components/IntegrationOption';
import {useLocalStorageContext} from './LocalStorageContext';

interface IntegrationContextType {
    integration: Integration | null;
    setIntegration: (integration: Integration | null) => void;
}

const IntegrationContext = createContext<IntegrationContextType>({
    integration: null,
    setIntegration: () => {},
});

export const IntegrationProvider = ({children}: {children: React.ReactNode}) => {
    const {getLocalIntegration, setLocalIntegration} = useLocalStorageContext();

    const [integration, setIntegration] = useState<Integration | null>(getLocalIntegration());

    return <IntegrationContext.Provider value={{
        integration,
        setIntegration: (integration: Integration | null) => {
            setIntegration(integration);
            if (integration) {
                setLocalIntegration(integration);
            } else {
                localStorage.removeItem('selectedIntegration');
            }
        },
    }}>{children}</IntegrationContext.Provider>;
};

export const useIntegrationContext = () => useContext(IntegrationContext)!;