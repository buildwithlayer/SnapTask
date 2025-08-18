import type {CreateSnapTask, UpdateSnapTask} from '../../src/schemas/snapTask';
import Button from './components/Button';
import {useTasksContext} from './contexts/TasksContext';

const Tasks = () => {
    const {createTasks, updateTasks} = useTasksContext();

    return (
        <div className="flex justify-center w-full h-full p-4 overflow-y-auto">
            <div className="max-w-content-max-width flex flex-col gap-4 items-center w-full h-full py-12">
                {createTasks.map((task, idx) => (
                    <Task
                        key={idx}
                        task={task}
                    />
                ))}
                {updateTasks.map((task, idx) => (
                    <Task
                        key={idx}
                        task={task.original}
                        updates={task.updates}
                    />
                ))}
            </div>
        </div>
    );
};

interface TaskProps {
    task: CreateSnapTask
    updates?: UpdateSnapTask;
}

const Task = ({task, updates}: TaskProps) => {
    const {approveCreateTaskLoading, approveCreateTask, deleteCreateTask, approveUpdateTask, deleteUpdateTask} = useTasksContext();
    return <div className='w-full flex flex-col gap-4 p-4 border border-gray-700 rounded-md bg-gray-900'>
        <div className="flex flex-col">
            {task.title && !updates?.title && <h3 className={`font-medium text-xl`}>{task.title}</h3>}
            {updates?.title && <h3 className={`font-medium text-xl text-amber-500`}><span className='line-through text-white'>{task.title}</span> {updates.title}</h3>}
            {task.description && !updates?.description && <p>{task.description}</p>}
            {updates?.description && <p className='text-amber-500'><span className='line-through text-white'>{task.description}</span> {updates.description}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
            <PropertyBadge icon={<span>👤</span>} value={task.assignee?.name} updatedValue={updates?.assignee?.name} />
            <PropertyBadge icon={<span>📁</span>} value={task.project?.name} updatedValue={updates?.project?.name} />
            <PropertyBadge icon={<span>📅</span>} value={task.due_date} updatedValue={updates?.due_date} />
            <PropertyBadge icon={<span>⚡</span>} value={task.priority?.toString()} updatedValue={updates?.priority?.toString()} />
            <PropertyBadge icon={<span>🚦</span>} value={task.status} updatedValue={updates?.status} />
        </div>
        <Button onClick={() => updates ? deleteUpdateTask(updates.id) : deleteCreateTask(task.title)}>Reject</Button>
        <Button onClick={() => updates ? approveUpdateTask(updates.id) : approveCreateTask(task.title)} loading={approveCreateTaskLoading.includes(task.title)}>Approve</Button>
    </div>;
};

interface PropertyBadgeProps {
    icon: React.ReactNode
    value?: string
    updatedValue?: string
}

const PropertyBadge = ({icon, value, updatedValue}: PropertyBadgeProps) => {
    return (
        <>
            {(updatedValue || value) && <div className={`flex items-center gap-2 px-2 py-1 border rounded-md w-fit ${updatedValue ? 'border-amber-500' : 'border-gray-700'}`}>
                {icon}
                <span className={`text-white ${updatedValue ? 'line-through' : ''}`}>{value}</span>
                {updatedValue && <span className='text-amber-500'>{updatedValue}</span>}
            </div>}
        </>
    );
}

export default Tasks;
