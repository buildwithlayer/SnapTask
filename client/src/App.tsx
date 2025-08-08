import * as amplitude from '@amplitude/analytics-browser';
import {sessionReplayPlugin} from '@amplitude/plugin-session-replay-browser';
import {Toaster} from 'react-hot-toast';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Content from './Content.tsx';
import {FileProvider} from './contexts/FileContext.tsx';
import {LocalStorageProvider} from './contexts/LocalStorageContext.tsx';
import {TranscriptProvider} from './contexts/TranscriptContext.tsx';
import MenuBar from './MenuBar.tsx';
import OAuthCallback from './OAuthCallback.tsx';

function App() {
    const sessionReplayTracking = sessionReplayPlugin({sampleRate: 1});
    amplitude.add(sessionReplayTracking);

    amplitude.init('fc93ad6d63a825b3acfb0aae93ea926f', {
        autocapture: {
            elementInteractions: true,
        },
        serverUrl: `${import.meta.env.VITE_API_URL}/api/amplitude`,
    });

    return (
        <div className="flex flex-col h-screen w-screen">
            <LocalStorageProvider>
                <Router>
                    <Routes>
                        <Route path={'/oauth/callback'} element={<OAuthCallback/>}/>
                        <Route
                            path={'/'}
                            element={
                                <FileProvider>
                                    <TranscriptProvider>
                                        <MenuBar/>
                                        <Content />
                                    </TranscriptProvider>
                                </FileProvider>
                            }
                        />
                    </Routes>
                </Router>
            </LocalStorageProvider>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                }}
            />
        </div>
    );
}

export default App;
