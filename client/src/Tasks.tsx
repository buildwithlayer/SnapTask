import type {CreateSnapTask} from '../../src/schemas/snapTask';
import Button from './components/Button';
import {useTasksContext} from './contexts/TasksContext';

const Tasks = () => {
    const {createTasks} = useTasksContext();

    return (
        <div className="flex justify-center w-full h-full p-4">
            <div className="max-w-content-max-width flex flex-col gap-4 items-center w-full h-full py-12">
                {createTasks.map((task, idx) => (
                    <Task
                        key={idx}
                        task={task}
                    />
                ))}
            </div>
        </div>
    );
};

interface TaskProps {
    task: CreateSnapTask
}

const Task = ({task}: TaskProps) => {
    const {deleteTask, approveTask, approveLoading} = useTasksContext();
    return <div className='w-full flex flex-col gap-2 p-4 border border-gray-700 rounded-md bg-gray-900'>
        {Object.entries(task).map(([key, value]) => (
            <div key={key} className='flex gap-2'>
                <span className='font-bold w-[200px]'>{key}:</span>
                <span>{JSON.stringify(value)}</span>
            </div>
        ))}
        <Button onClick={() => deleteTask(task.title)}>Reject</Button>
        <Button onClick={() => approveTask(task.title)} loading={approveLoading.includes(task.title)}>Approve</Button>
    </div>;
};

export default Tasks;
