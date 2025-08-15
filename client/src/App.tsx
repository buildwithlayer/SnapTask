import * as amplitude from '@amplitude/analytics-browser';
import {sessionReplayPlugin} from '@amplitude/plugin-session-replay-browser';
import {Toaster} from 'react-hot-toast';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Content from './Content.tsx';
import {FileProvider} from './contexts/FileContext.tsx';
import {IntegrationProvider} from './contexts/IntegrationContext.tsx';
import {LocalStorageProvider} from './contexts/LocalStorageContext.tsx';
import {TasksProvider} from './contexts/TasksContext.tsx';
import {TranscriptProvider} from './contexts/TranscriptContext.tsx';
import MenuBar from './MenuBar.tsx';
import OAuthCallback from './OAuthCallback.tsx';
import { ProgressProvider } from './contexts/ProgressContext.tsx';

function App() {
    const sessionReplayTracking = sessionReplayPlugin({sampleRate: 1});
    amplitude.add(sessionReplayTracking);

    // amplitude.init('5cc5c6e8863745ef94f222901951ead6', {
    //     autocapture: {
    //         elementInteractions: true,
    //     },
    //     serverUrl: `${import.meta.env.VITE_API_URL}/api/amplitude`,
    // });

    return (
        <div className="flex flex-col h-screen w-screen">
            <Router>
                <Routes>
                    <Route path={'/oauth/callback'} element={<OAuthCallback/>}/>
                    <Route
                        path={'/'}
                        element={
                            <LocalStorageProvider>
                                <ProgressProvider>
                                    <IntegrationProvider>
                                        <FileProvider>
                                            <TranscriptProvider>
                                                <TasksProvider>
                                                    <MenuBar/>
                                                    <Content />
                                                </TasksProvider>
                                            </TranscriptProvider>
                                        </FileProvider>
                                    </IntegrationProvider>
                                </ProgressProvider>
                            </LocalStorageProvider>
                        }
                    />
                </Routes>
            </Router>
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
