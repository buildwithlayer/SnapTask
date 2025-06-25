import './FileUpload.css';
import {useCallback} from 'react';
import {type FileWithPath, useDropzone} from 'react-dropzone';
import logoUrl from './assets/react.svg';

interface FileUploadProps {
    setError: (error: unknown) => void;
    setTranscript: (content: string) => void;
}

function FileUpload({setError, setTranscript}: FileUploadProps) {
    const onDrop = useCallback((acceptedFiles: readonly FileWithPath[]) => {
        setError(undefined);

        acceptedFiles.forEach((file: FileWithPath) => {
            if (file.type.startsWith('audio')) {
                const formData = new FormData();
                formData.append('file', file);

                fetch(
                    `${import.meta.env.VITE_API_URL}/api/transcribe`,
                    {
                        body: formData,
                        method: 'POST',
                    },
                ).then(async response => {
                    if (response.ok) {
                        const data = await response.json() as string;
                        setTranscript(data);
                    } else {
                        console.error(await response.text());
                        setError('could not transcribe audio');
                    }
                }).catch(err => {
                    setError(err);
                });
            } else if (file.type.startsWith('text')) {
                const reader = new FileReader();

                reader.onabort = () => setError('file reading was aborted');
                reader.onerror = () => setError('file reading was aborted');
                reader.onload = () => {
                    const content = reader.result;
                    if (typeof content === 'string') setTranscript(content);
                };

                reader.readAsText(file);
            }
        });
    }, [setError, setTranscript]);

    const {getInputProps, getRootProps, isDragActive} = useDropzone({
        accept: {
            'audio/aac': ['.aac'],
            'audio/mpeg': ['.mp3'],
            'audio/ogg': ['.oga', '.opus'],
            'audio/wav': ['.wav'],
            'audio/webm': ['.weba'],
            'text/markdown': ['.md'],
            'text/plain': ['.txt'],
        },
        maxFiles: 1,
        onDrop,
    });

    return (
        <div id={'file-upload'} {...getRootProps()}>
            <input {...getInputProps()} />
            <img alt={'Upload icon'} src={logoUrl}/>
            <h3>{isDragActive ? 'Drop the file here' : 'Drag \'n\' drop transcript or audio file here, or click to select file'}</h3>
        </div>
    );
}

export default FileUpload;