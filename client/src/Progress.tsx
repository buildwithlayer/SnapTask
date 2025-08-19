import {useEffect} from 'react';
import {ClipLoader} from 'react-spinners';
import ResetButton from './components/ResetButton';
import {useFileContext} from './contexts/FileContext';
import {useProgressContext} from './contexts/ProgressContext';
import {useTasksContext} from './contexts/TasksContext';
import {useTranscriptContext} from './contexts/TranscriptContext';

interface Step {
    additionalMessage?: string;
    complete: boolean;
    error?: Error;
    fn: () => void;
    label: string;
    loading: boolean;
    start: boolean;
}

const Progress = () => {
    const {step} = useProgressContext();
    const {file} = useFileContext();
    const {
        error: transcriptError,
        loading: transcriptLoading,
        transcribeFile,
        transcript,
    } = useTranscriptContext();
    const {
        createTasks,
        generateError: tasksGenerateError,
        generateLoading: tasksGenerateLoading,
        generateTasks,
        updateTasks,
    } = useTasksContext();

    return (
        <div className="w-full h-full max-w-content-max-width px-4">
            <div className="flex flex-col gap-4 items-center justify-center w-full h-full py-10">
                <ResetButton/>
                <Step
                    label={'Transcribing File'}
                    loading={transcriptLoading}
                    start={
                        file !== undefined &&
                        !transcript
                    }
                    error={transcriptError}
                    fn={transcribeFile}
                    complete={transcript !== undefined && !transcriptError}
                />
                <Step
                    label={'Generating Tasks'}
                    loading={tasksGenerateLoading}
                    start={
                        transcript !== undefined &&
                        createTasks.length === 0 &&
                        updateTasks.length === 0
                    }
                    error={tasksGenerateError}
                    fn={generateTasks}
                    complete={step === 'reviewing'}
                />
            </div>
        </div>
    );
};

const Step = ({
    additionalMessage,
    complete,
    error,
    fn,
    label,
    loading,
    start,
}: Step) => {
    useEffect(() => {
        if (start && !loading && !error && !complete) {
            fn();
        }
    }, [start, loading, error, complete, fn]);

    return (
        <>
            {(loading || complete || error) && (
                <div className="flex flex-col gap-2 items-center text-center">
                    <div className="flex gap-2 items-center">
                        {loading && <ClipLoader color="white" size={16}/>}
                        {/* TODO: Switch to icons */}
                        {complete && <p className="text-gray-500">✓</p>}
                        {error && <p className="text-red-500">❌</p>}
                        <p className={`${complete ? 'text-gray-500' : 'text-white'}`}>
                            {label}
                        </p>
                    </div>
                    {error && <p className="text-red-500">{error.message}</p>}
                    {additionalMessage && (
                        <p className="text-gray-500">{additionalMessage}</p>
                    )}
                </div>
            )}
        </>
    );
};

export default Progress;
