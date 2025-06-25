import './App.css';
import {type ReactNode, useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Chat from './Chat.tsx';
import FileUpload from './FileUpload.tsx';
import MenuBar from './MenuBar.tsx';
import OAuthCallback from './OAuthCallback.tsx';


function App() {
    const [error, setError] = useState<unknown>(undefined);
    const [summary, setSummary] = useState<string | undefined>(undefined);
    const [transcript, setTranscript] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (error === undefined) return;

        console.error(error);
        setSummary(undefined);
        setTranscript(undefined);
    }, [error]);

    useEffect(() => {
        console.log(`transcript = ${transcript}`);
        if (transcript === undefined) return;

        setError(undefined);

        fetch(
            `${import.meta.env.VITE_API_URL}/api/extract`,
            {
                body: JSON.stringify({transcript}),
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            },
        ).then(async response => {
            if (response.ok) {
                const data = await response.json();
                setSummary(data.summary);
            } else {
                console.error(await response.text());
                setError('could not summarize transcript');
            }
        }).catch(err => setError(err));
    }, [transcript]);

    let active: ReactNode;
    if (summary !== undefined) {
        active = <Chat summary={summary}/>;
    } else if (transcript !== undefined) {
        active = <h2>Processing transcript...</h2>;
    } else {
        active = <FileUpload setError={setError} setTranscript={setTranscript}/>;
    }

    return (
        <div id={'app'}>
            <MenuBar/>
            <Router>
                <Routes>
                    <Route path={'/oauth/callback'} element={<OAuthCallback/>}/>
                    <Route path={'/'} element={
                        <div className={'content'}>
                            <h1>Convert a meeting into tasks with AI</h1>
                            {error !== undefined &&
                                <h2 className={'error'}>{typeof error === 'string' ? error : JSON.stringify(error, null, 2)}</h2>}
                            {active}
                        </div>
                    }/>
                </Routes>
            </Router>
        </div>
    );
}

export default App;