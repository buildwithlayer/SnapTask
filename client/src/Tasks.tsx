import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {CreateSnapTask, UpdateSnapTask} from '../../src/schemas/snapTask';
import CheckIcon from './assets/check.svg?react';
import DeleteIcon from './assets/delete.svg?react';
import Button from './components/Button';
import ResetButton from './components/ResetButton';
import ToolTypeBadge from './components/ToolTypeBadge';
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
                {updateTasks.length === 0 && createTasks.length === 0 &&
                    <div className='w-full h-full flex flex-col gap-4 items-center justify-center'>
                        <p>No tasks detected.</p>
                        <ResetButton />
                    </div>
                }
            </div>
        </div>
    );
};

interface TaskProps {
    task: CreateSnapTask
    updates?: UpdateSnapTask;
}

const Task = ({task, updates}: TaskProps) => {
    const {approveCreateTask, approveCreateTaskLoading, approveUpdateTask, approveUpdateTaskLoading, deleteCreateTask, deleteUpdateTask} = useTasksContext();
    return <div className='w-full flex flex-col gap-4 p-4 border border-gray-700 rounded-md bg-gray-900'>
        <div className="flex justify-between items-center gap-4 w-full">
            <ToolTypeBadge type={updates ? 'Updated' : 'New'} />
            <div className="flex items-center gap-2">
                <Button onClick={() => updates ? deleteUpdateTask(updates.id) : deleteCreateTask(task.title)} additionalClasses='bg-red-500 hover:bg-red-600 !p-2'><DeleteIcon className='w-6 h-6 fill-white' /></Button>
                <Button onClick={() => updates ? approveUpdateTask(updates.id) : approveCreateTask(task.title)} loading={updates ? approveUpdateTaskLoading.includes(updates.id) : approveCreateTaskLoading.includes(task.title)} additionalClasses='!p-2'><CheckIcon className='w-6 h-6 fill-white' /></Button>
            </div>
        </div>
        <div className="flex flex-col">
            {task.title && !updates?.title && <h3 className={'font-medium text-xl'}>{task.title}</h3>}
            {updates?.title && <h3 className={'font-medium text-xl text-amber-500'}><span className='line-through text-white'>{task.title}</span> {updates.title}</h3>}
            {task.description && !updates?.description && <Markdown remarkPlugins={[remarkGfm]}>{task.description}</Markdown>}
            {updates?.description && <><span className='line-through text-white'>{task.description} </span><Markdown remarkPlugins={[remarkGfm]}>{updates.description}</Markdown></>}
        </div>
        {(task.assignee || task.project || task.due_date || task.priority || task.status || updates?.assignee || updates?.project || updates?.due_date || updates?.priority || updates?.status) &&
        <div className="flex gap-2 flex-wrap">
            <PropertyBadge icon={<span className='text-gray-400'>👤 Assignee</span>} value={task.assignee?.name} updatedValue={updates?.assignee?.name} />
            <PropertyBadge icon={<span className='text-gray-400'>📁 Project</span>} value={task.project?.name} updatedValue={updates?.project?.name} />
            <PropertyBadge icon={<span className='text-gray-400'>📅 Due Date</span>} value={task.due_date} updatedValue={updates?.due_date} />
            <PropertyBadge icon={<span className='text-gray-400'>⚡ Priority</span>} value={task.priority?.toString()} updatedValue={updates?.priority?.toString()} />
            <PropertyBadge icon={<span className='text-gray-400'>🚦 Status</span>} value={task.status} updatedValue={updates?.status} />
        </div>}
    </div>;
};

interface PropertyBadgeProps {
    icon: React.ReactNode
    updatedValue?: string
    value?: string
}

const PropertyBadge = ({icon, updatedValue, value}: PropertyBadgeProps) => {
    return (
        <>
            {(updatedValue || value) && <div className={`flex flex-wrap items-center gap-2 px-2 py-1 border rounded-md w-fit ${updatedValue ? 'border-amber-500' : 'border-gray-700'}`}>
                {icon}
                <span className={`text-white ${updatedValue ? 'line-through' : ''}`}>{value}</span>
                {updatedValue && <span className='text-amber-500'>{updatedValue}</span>}
            </div>}
        </>
    );
};

export default Tasks;
