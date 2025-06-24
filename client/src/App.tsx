import './App.css';
import {type ReactNode, useEffect, useState} from 'react';
import FileUpload from './FileUpload.tsx';
import MenuBar from './MenuBar.tsx';


function App() {
    const [audioFile, setAudioFile] = useState<FileWithPath | undefined>(undefined);
    const [transcription, setTranscription] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (audioFile === undefined) return;

        const formData = new FormData();
        formData.append('file', audioFile);

        fetch(
            `${import.meta.env.VITE_API_URL}/api/transcribe`,
            {
                body: formData,
                method: 'POST',
            },
        ).then(response => {
            return response.json().then(data => setTranscription(JSON.stringify(data, null, 2)));
        }).catch(err => console.error(err));
    }, [audioFile]);

    let active: ReactNode;
    if (audioFile === undefined && transcription === undefined) {
        active = <FileUpload setAudioFile={setAudioFile} setTranscription={setTranscription}/>;
    } else if (transcription !== undefined) {
        active = <p>{transcription}</p>;
    } else {
        active = <h2>Processing audio file...</h2>;
    }

    return (
        <div id={'app'}>
            <MenuBar/>
            <div className={'content'}>
                <h1>Convert a meeting into tasks with AI</h1>
                {active}
            </div>
        </div>
    );
}

export default App;