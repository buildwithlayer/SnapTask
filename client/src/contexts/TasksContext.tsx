import {createContext, useContext, useEffect, useState} from 'react';
import {type CreateSnapTask} from '../../../src/schemas/snapTask';
import {UpdateWithOriginal} from '../../../src/utils/taskManagerClient';
import {useIntegrationContext} from './IntegrationContext';
import {useLocalStorageContext} from './LocalStorageContext';
import {useProgressContext} from './ProgressContext';
import {useTranscriptContext} from './TranscriptContext';
import toast from 'react-hot-toast';

type TasksContextType = {
    approveCreateTask: (taskTitle: string) => void;
    approveCreateTaskError?: Error;
    approveCreateTaskLoading: string[];
    approveUpdateTask: (taskId: string) => void;
    approveUpdateTaskError?: Error;
    approveUpdateTaskLoading: string[];
    createTasks: CreateSnapTask[];
    deleteCreateTask: (taskTitle: string) => void;
    deleteUpdateTask: (taskId: string) => void;
    generateError?: Error;
    generateLoading: boolean;
    generateTasks: () => void;
    setCreateTasks: (createTasks: CreateSnapTask[]) => void;
    setUpdateTasks: (createTasks: UpdateWithOriginal[]) => void;
    updateTasks: UpdateWithOriginal[];
};

const TasksContext = createContext<TasksContextType>({
    approveCreateTask: () => {},
    approveCreateTaskLoading: [],
    approveUpdateTask: () => {},
    approveUpdateTaskLoading: [],
    createTasks: [],
    deleteCreateTask: () => {},
    deleteUpdateTask: () => {},
    generateLoading: false,
    generateTasks: () => {},
    setCreateTasks: () => {},
    setUpdateTasks: () => {},
    updateTasks: [],
});

export const TasksProvider = ({children}: { children: React.ReactNode }) => {
    const {authToken, integration} = useIntegrationContext();
    const {transcript} = useTranscriptContext();
    const {setStep} = useProgressContext();

    const {getLocalCreateTasks, getLocalUpdateTasks, setLocalCreateTasks, setLocalUpdateTasks} = useLocalStorageContext();

    const [createTasks, setCreateTasks] = useState<CreateSnapTask[]>([]);
    const [updateTasks, setUpdateTasks] = useState<UpdateWithOriginal[]>([]);

    const [approveCreateTaskLoading, setApproveCreateTaskLoading] = useState<string[]>([]);
    const [approveCreateTaskError, setApproveCreateTaskError] = useState<Error | undefined>(undefined);
    const [approveUpdateTaskLoading, setApproveUpdateTaskLoading] = useState<string[]>([]);
    const [approveUpdateTaskError, setApproveUpdateTaskError] = useState<Error | undefined>(undefined);

    const [generateLoading, setGenerateLoading] = useState<boolean>(false);
    const [generateError, setGenerateError] = useState<Error | undefined>(undefined);

    function updateCreateTasks(newTasks: CreateSnapTask[]) {
        setCreateTasks(newTasks);
        setLocalCreateTasks(newTasks);
    }

    function updateUpdateTasks(newTasks: UpdateWithOriginal[]) {
        setUpdateTasks(newTasks);
        setLocalUpdateTasks(newTasks);
    }

    function deleteCreateTask(taskTitle: string) {
        const newTasks = (createTasks.filter(task => task.title !== taskTitle));
        updateCreateTasks(newTasks);
        if (newTasks.length + updateTasks.length === 0) {
            setStep('done');
        }
    }

    function deleteUpdateTask(taskId: string) {
        const newTasks = (updateTasks.filter(task => task.updates.id !== taskId));
        updateUpdateTasks(newTasks);
        if (newTasks.length + createTasks.length === 0) {
            setStep('done');
        }
    }

    async function approveCreateTask(taskTitle: string) {
        setApproveCreateTaskLoading((prev) => [...prev, taskTitle]);
        try {
            const task = createTasks.find(task => task.title === taskTitle);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/create`, {
                body: JSON.stringify({
                    authProvider: integration?.authProvider,
                    authToken: authToken,
                    createTask: {
                        ...task,
                    },
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })
            if (!response.ok) {
                if (response.status === 500) {
                    throw new Error('Internal server error. Please try again later.');
                }
                const data = await response.json();
                console.error('Error approving create task:', data);
                throw new Error(data.message || 'Unknown error');
            }
            const newTasks = (createTasks.filter(task => task.title !== taskTitle));
            updateCreateTasks(newTasks);
            if (newTasks.length + updateTasks.length === 0) {
                setStep('done');
            }
        } catch (error) {
            setApproveCreateTaskError(error instanceof Error ? error : new Error('Unknown error'));
            toast.error(error instanceof Error ? error.message : JSON.stringify(error));
        } finally {
            setApproveCreateTaskLoading((prev) => prev.filter((id) => id !== taskTitle));
        }
    }

    async function approveUpdateTask(taskId: string) {
        setApproveUpdateTaskLoading((prev) => [...prev, taskId]);
        try {
            const task = updateTasks.find(task => task.updates.id === taskId);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/update`, {
                body: JSON.stringify({
                    authProvider: integration?.authProvider,
                    authToken: authToken,
                    updateTask: {
                        ...task?.updates,
                    },
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })
            if (!response.ok) {
                if (response.status === 500) {
                    throw new Error('Internal server error. Please try again later.');
                }
                const data = await response.json();
                console.error('Error approving update task:', data);
                throw new Error(data.message || 'Unknown error');
            }
            const newTasks = (updateTasks.filter(task => task.updates.id !== taskId));
            updateUpdateTasks(newTasks);
            if (newTasks.length + createTasks.length === 0) {
                setStep('done');
            }
        } catch (error) {
            setApproveUpdateTaskError(error instanceof Error ? error : new Error('Unknown error'));
            toast.error(error instanceof Error ? error.message : JSON.stringify(error));
        } finally {
            setApproveUpdateTaskLoading((prev) => prev.filter((id) => id !== taskId));
        }
    }

    async function generateTasks() {
        setGenerateLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/extract`, {
                body: JSON.stringify({
                    authProvider: integration?.authProvider,
                    authToken: authToken,
                    transcript,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })

            if (response.ok) {
                const data = await response.json();
                setCreateTasks(data.createTasks);
                setLocalCreateTasks(data.createTasks);
                setUpdateTasks(data.updateTasks);
                setLocalUpdateTasks(data.updateTasks);
                setStep('reviewing');
            } else {
                const data = await response.json();
                console.error('Error generating createTasks:', data);
                throw new Error(data.message || 'Unknown error');
            }

        } catch (error) {
            console.error('Error generating createTasks:', error);
            setGenerateError(error instanceof Error ? error : new Error('Unknown error'));
        } finally {
            setGenerateLoading(false);
        }
    }

    useEffect(() => {
        const localCreateTasks = getLocalCreateTasks();
        setCreateTasks(localCreateTasks || []);

        const localUpdateTasks = getLocalUpdateTasks();
        setUpdateTasks(localUpdateTasks || []);
    }, []);

    return (
        <TasksContext.Provider value={{
            approveCreateTask,
            approveCreateTaskError, 
            approveCreateTaskLoading,
            approveUpdateTask,
            approveUpdateTaskError,
            approveUpdateTaskLoading,
            createTasks,
            deleteCreateTask,
            deleteUpdateTask,
            generateError,
            generateLoading,
            generateTasks,
            setCreateTasks: updateCreateTasks,
            setUpdateTasks: updateUpdateTasks,
            updateTasks,
        }}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasksContext = () => useContext(TasksContext);