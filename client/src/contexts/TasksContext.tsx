import {createContext, useContext, useEffect, useState} from 'react';
import {type CreateSnapTask} from '../../../src/schemas/snapTask';
import {useLocalStorageContext} from './LocalStorageContext';
import {useTranscriptContext} from './TranscriptContext';
import { useProgressContext } from './ProgressContext';

type TasksContextType = {
    approveTask: (taskTitle: string) => void;
    approveError?: Error;
    approveLoading: string[];
    deleteTask: (taskTitle: string) => void;
    generateError?: Error;
    generateLoading: boolean;
    generateTasks: () => void;
    setCreateTasks: (createTasks: CreateSnapTask[]) => void;
    createTasks: CreateSnapTask[];
};

const TasksContext = createContext<TasksContextType>({
    approveTask: () => {},
    approveLoading: [],
    deleteTask: () => {},
    generateLoading: false,
    generateTasks: () => {},
    setCreateTasks: () => {},
    createTasks: [],
});

export const TasksProvider = ({children}: { children: React.ReactNode }) => {
    // TODO: Handle createTasks & updateTasks

    const {transcript} = useTranscriptContext();
    const {setStep} = useProgressContext();

    const {getLocalTasks, setLocalTasks} = useLocalStorageContext();

    const [createTasks, setCreateTasks] = useState<CreateSnapTask[]>([]);

    const [approveLoading, setApproveLoading] = useState<string[]>([]);
    const [approveError, setApproveError] = useState<Error | undefined>(undefined);

    const [generateLoading, setGenerateLoading] = useState<boolean>(false);
    const [generateError, setGenerateError] = useState<Error | undefined>(undefined);

    function updateTasks(newTasks: CreateSnapTask[]) {
        setCreateTasks(newTasks);
        setLocalTasks(newTasks);
    }

    function deleteTask(taskTitle: string) {
        const newTasks = (createTasks.filter(task => task.title !== taskTitle));
        updateTasks(newTasks);
        if (newTasks.length === 0) {
            setStep('done');
        }
    }

    function approveTask(taskTitle: string) {
        // TODO: API Call
        setApproveLoading((prev) => [...prev, taskTitle]);
        try {
            console.log('Approving task:', taskTitle);
            const newTasks = (createTasks.filter(task => task.title !== taskTitle));
            updateTasks(newTasks);
            if (newTasks.length === 0) {
                setStep('done');
            }
        } catch (error) {
            setApproveError(error instanceof Error ? error : new Error('Unknown error'));
        } finally {
            setApproveLoading((prev) => prev.filter((id) => id !== taskTitle));
        }
    }

    function generateTasks() {
        // TODO: Replace Mock stuff
        setGenerateLoading(true);
        try {
            fetch(`${import.meta.env.VITE_API_URL}/api/extract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transcript, authProvider: 'mock', authToken: '<mock_token>' }),
            }).then((response) => {
                // Returns createTasks and updateTasks
                console.log('Response:', response);
            })
            console.log('Generating createTasks from transcript:', transcript);
            // Placeholder
            const placeholderTasks = [
                {
                    description: 'Description for Task 1',
                    status: 'pending',
                    title: 'Task 1',
                },
                {
                    description: 'Description for Task 2',
                    status: 'pending',
                    title: 'Task 2',
                },
            ];
            setCreateTasks(placeholderTasks);
            setLocalTasks(placeholderTasks);
            setStep('reviewing');
        } catch (error) {
            console.error('Error generating createTasks:', error);
            setGenerateError(error instanceof Error ? error : new Error('Unknown error'));
        } finally {
            setGenerateLoading(false);
        }
    }

    useEffect(() => {
        const localTasks = getLocalTasks();
        setCreateTasks(localTasks || []);
    }, []);

    return (
        <TasksContext.Provider value={{approveTask, approveLoading, approveError, deleteTask, generateError, generateLoading, generateTasks, setCreateTasks: updateTasks, createTasks}}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasksContext = () => useContext(TasksContext);