import {
    createContext,
    type ReactNode,
    useContext,
} from 'react';
// TODO: Duplicate these types/schemas if doesn't work in prod
import {CreateSnapTask as CreateSnapTaskZodSchema, CreateSnapTask} from '../../../src/schemas/snapTask';
import {UpdateWithOriginal as UpdateWithOriginalZodSchema, UpdateWithOriginal} from '../../../src/utils/taskManagerClient';
import {type Integration, integrations} from './IntegrationContext';
import type {ProgressStep} from './ProgressContext';

interface LocalStorageContextType {
    getLocalAuthToken: () => string | undefined;
    getLocalCreateTasks: () => CreateSnapTask[] | undefined;
    getLocalIntegration: () => Integration | undefined;
    getLocalProgressStep: () => ProgressStep;
    getLocalTranscript: () => string | undefined;
    getLocalUpdateTasks: () => UpdateWithOriginal[] | undefined;
    resetLocalStorage: () => void;
    setLocalAuthToken: (token: string | undefined) => void;
    setLocalCreateTasks: (tasks: CreateSnapTask[]) => void;
    setLocalIntegration: (integration: Integration | undefined) => void;
    setLocalProgressStep: (step: ProgressStep) => void;
    setLocalTranscript: (transcript: string) => void;
    setLocalUpdateTasks: (tasks: UpdateWithOriginal[]) => void;
}

const LocalStorageContext = createContext<LocalStorageContextType>({
    getLocalAuthToken: () => undefined,
    getLocalCreateTasks: () => undefined,
    getLocalIntegration: () => undefined,
    getLocalProgressStep: () => 'select-integration',
    getLocalTranscript: () => undefined,
    getLocalUpdateTasks: () => undefined,
    resetLocalStorage: () => {
        localStorage.clear();
        window.location.pathname = '/';
    },
    setLocalAuthToken: (token: string | undefined) => {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    },
    setLocalCreateTasks: (tasks: CreateSnapTask[]) => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },
    setLocalIntegration: (integration: Integration | undefined) => {
        if (integration) {
            localStorage.setItem('integration', integration.name);
        } else {
            localStorage.removeItem('integration');
        }
    },
    setLocalProgressStep: (step: ProgressStep) => {
        localStorage.setItem('progressStep', step);
    },
    setLocalTranscript: (transcript: string) => {
        localStorage.setItem('transcript', transcript);
    },
    setLocalUpdateTasks: (tasks: UpdateWithOriginal[]) => {
        localStorage.setItem('updateTasks', JSON.stringify(tasks));
    },
});

export const LocalStorageProvider = ({children}: { children: ReactNode }) => {

    const getLocalProgressStep = () => {
        const step = localStorage.getItem('progressStep') as ProgressStep | null;
        return step || 'select-integration';
    };

    const setLocalProgressStep = (step: ProgressStep) => {
        localStorage.setItem('progressStep', step);
    };

    const getLocalIntegration = () => {
        const integrationName = localStorage.getItem('integration');
        return integrations.find((integration) => integration.name === integrationName) || undefined;
    };

    const setLocalIntegration = (integration: Integration | undefined) => {
        if (integration) {
            localStorage.setItem('integration', integration.name);
        } else {
            localStorage.removeItem('integration');
        }
    };

    const getLocalAuthToken = () => {
        return localStorage.getItem('authToken') || undefined;
    };

    const setLocalAuthToken = (token: string | undefined) => {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    };

    const getLocalTranscript = () => {
        return localStorage.getItem('transcript') || undefined;
    };

    const setLocalTranscript = (transcript: string) => {
        localStorage.setItem('transcript', transcript);
    };

    const getLocalCreateTasks = () => {
        const tasks = localStorage.getItem('tasks');
        if (!tasks) return undefined;

        try {
            const jsonCreateTasks = JSON.parse(tasks);
            return CreateSnapTaskZodSchema.array().parse(jsonCreateTasks);
        } catch (e) {
            console.error('Error parsing tasks from localStorage', e);
            return undefined;
        }
    };

    const setLocalCreateTasks = (tasks: CreateSnapTask[]) => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const getLocalUpdateTasks = () => {
        const tasks = localStorage.getItem('updateTasks');
        if (!tasks) return undefined;

        try {
            const jsonUpdateTasks = JSON.parse(tasks);
            return UpdateWithOriginalZodSchema.array().parse(jsonUpdateTasks);
        } catch (e) {
            console.error('Error parsing updateTasks from localStorage', e);
            return undefined;
        }
    };

    const setLocalUpdateTasks = (tasks: UpdateWithOriginal[]) => {
        localStorage.setItem('updateTasks', JSON.stringify(tasks));
    };

    const resetLocalStorage = () => {
        localStorage.clear();
        window.location.pathname = '/';
    };

    return (
        <LocalStorageContext.Provider
            value={{
                getLocalAuthToken,
                getLocalCreateTasks,
                getLocalIntegration,
                getLocalProgressStep,
                getLocalTranscript,
                getLocalUpdateTasks,
                resetLocalStorage,
                setLocalAuthToken,
                setLocalCreateTasks,
                setLocalIntegration,
                setLocalProgressStep,
                setLocalTranscript,
                setLocalUpdateTasks,
            }}
        >
            {children}
        </LocalStorageContext.Provider>
    );
};

export const useLocalStorageContext = () => useContext(LocalStorageContext);
