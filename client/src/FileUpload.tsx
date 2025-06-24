import './FileUpload.css';
import {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import logoUrl from './assets/react.svg';

interface FileUploadProps {
    setAudioFile: (file: FileWithPath) => void;
    setTranscription: (content: string) => void;
}

function FileUpload({setAudioFile, setTranscription}: FileUploadProps) {
    const onDrop = useCallback((acceptedFiles: readonly FileWithPath[]) => {
        acceptedFiles.forEach((file: FileWithPath) => {
            if (file.type.startsWith('audio')) {
                setAudioFile(file);
            } else if (file.type.startsWith('text')) {
                const reader = new FileReader();

                reader.onabort = () => console.error('file reading was aborted');
                reader.onerror = () => console.error('file reading was aborted');
                reader.onload = () => {
                    const content = reader.result;
                    setTranscription(content);
                };

                reader.readAsText(file);
            }
        });
    }, [setAudioFile, setTranscription]);

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