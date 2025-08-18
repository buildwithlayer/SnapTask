import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import toast from 'react-hot-toast';
import {useFileContext} from './FileContext';
import {useLocalStorageContext} from './LocalStorageContext';
import {useProgressContext} from './ProgressContext';

interface TranscriptContextType {
    error?: Error;
    loading: boolean;
    transcribeFile: () => Promise<void>;
    transcript?: string;
}

const TranscriptContext = createContext<TranscriptContextType>({
    loading: false,
    transcribeFile: async () => {
    },
});

export const TranscriptProvider = ({children}: { children: ReactNode }) => {
    const {file} = useFileContext();
    const {setStep} = useProgressContext();
    const {getLocalTranscript, setLocalTranscript} = useLocalStorageContext();

    const [transcript, setTranscript] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        setTranscript(getLocalTranscript() || undefined);
    }, [getLocalTranscript]);

    async function transcribeFile(): Promise<void> {
        if (!file) {
            setStep('upload');
            return;
        }

        setTranscript(undefined);
        setLoading(true);

        if (file.type.startsWith('audio')) {
            const formData = new FormData();
            formData.append('file', file);

            fetch(`${import.meta.env.VITE_API_URL}/api/transcribe`, {
                body: formData,
                method: 'POST',
            })
                .then(async (response) => {
                    if (response.ok) {
                        const data = (await response.json()) as string;
                        setLocalTranscript(data);
                        setTranscript(data);
                        setStep('generating');
                    } else {
                        console.error(await response.text());
                        toast.error('Could not transcribe audio');
                        setError(new Error('Could not transcribe audio'));
                    }
                })
                .catch((err) => {
                    console.error(err);
                    toast.error(err.message);
                    setError(err);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (file.type.startsWith('text')) {
            const reader = new FileReader();

            reader.onabort = () => {
                console.error('File reading was aborted');
                toast.error('File reading was aborted');
            };
            reader.onerror = () => {
                console.error('File reading was aborted');
                toast.error('File reading was aborted');
            };
            reader.onload = () => {
                const content = reader.result;
                if (typeof content === 'string') {
                    setLocalTranscript(content);
                    setTranscript(content);
                }
            };

            reader.readAsText(file);

            setLoading(false);
            setStep('generating');
        }
    }

    return (
        <TranscriptContext.Provider
            value={{
                error,
                loading,
                transcribeFile,
                transcript,
            }}
        >
            {children}
        </TranscriptContext.Provider>
    );
};

export const useTranscriptContext = () => useContext(TranscriptContext);
