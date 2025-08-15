import {
    createContext,
    type ReactNode,
    useContext,
} from 'react';
// TODO: Duplicate these types/schemas if doesn't work in prod
import {CreateSnapTask as CreateSnapTaskZodSchema, CreateSnapTask} from '../../../src/schemas/snapTask';
import type {Integration} from '../Content';
import {integrations} from '../LandingPage';
import type { ProgressStep } from './ProgressContext';

interface LocalStorageContextType {
    getLocalProgressStep: () => ProgressStep;
    getLocalIntegration: () => Integration | undefined;
    getLocalTasks: () => CreateSnapTask[] | undefined;
    getLocalTranscript: () => string | undefined;
    setLocalProgressStep: (step: ProgressStep) => void;
    setLocalIntegration: (integration: Integration | undefined) => void;
    setLocalTasks: (tasks: CreateSnapTask[]) => void;
    setLocalTranscript: (transcript: string) => void;
    resetLocalStorage: () => void;
}

const LocalStorageContext = createContext<LocalStorageContextType>({
    getLocalProgressStep: () => 'select-integration',
    getLocalIntegration: () => undefined,
    getLocalTasks: () => undefined,
    getLocalTranscript: () => undefined,
    setLocalProgressStep: (step: ProgressStep) => {
        localStorage.setItem('progressStep', step);
    },
    setLocalIntegration: (integration: Integration | undefined) => {
        if (integration) {
            localStorage.setItem('integration', integration.name);
        } else {
            localStorage.removeItem('integration');
        }
    },
    setLocalTasks: (tasks: CreateSnapTask[]) => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },
    setLocalTranscript: (transcript: string) => {
        localStorage.setItem('transcript', transcript);
    },
        resetLocalStorage: () => {
        localStorage.clear();
        window.location.pathname = '/';
    },
});

export const LocalStorageProvider = ({children}: { children: ReactNode }) => {

    const getLocalProgressStep = () => {
        const step = localStorage.getItem('progressStep') as ProgressStep | null;
        return step || 'select-integration';
    }

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

    const getLocalTranscript = () => {
        return localStorage.getItem('transcript') || undefined;
    };

    const setLocalTranscript = (transcript: string) => {
        localStorage.setItem('transcript', transcript);
    };

    const getLocalTasks = () => {
        const tasks = localStorage.getItem('tasks');
        if (!tasks) return undefined;

        try {
            const jsonTasks = JSON.parse(tasks);
            return CreateSnapTaskZodSchema.array().parse(jsonTasks);
        } catch (e) {
            console.error('Error parsing tasks from localStorage', e);
            return undefined;
        }
    };

    const setLocalTasks = (tasks: CreateSnapTask[]) => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const resetLocalStorage = () => {
        localStorage.clear();
        window.location.pathname = '/';
    };

    return (
        <LocalStorageContext.Provider
            value={{
                getLocalProgressStep,
                getLocalIntegration,
                getLocalTasks,
                getLocalTranscript,
                resetLocalStorage,
                setLocalProgressStep,
                setLocalIntegration,
                setLocalTasks,
                setLocalTranscript,
            }}
        >
            {children}
        </LocalStorageContext.Provider>
    );
};

export const useLocalStorageContext = () => useContext(LocalStorageContext);
