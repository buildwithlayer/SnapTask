import * as amplitude from '@amplitude/analytics-browser';
import {sessionReplayPlugin} from '@amplitude/plugin-session-replay-browser';
import {Toaster} from 'react-hot-toast';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Content from './Content.tsx';
import {FileProvider} from './contexts/FileContext.tsx';
import {IntegrationProvider} from './contexts/IntegrationContext.tsx';
import {LocalStorageProvider} from './contexts/LocalStorageContext.tsx';
import {ProgressProvider} from './contexts/ProgressContext.tsx';
import {TasksProvider} from './contexts/TasksContext.tsx';
import {TranscriptProvider} from './contexts/TranscriptContext.tsx';
import MenuBar from './MenuBar.tsx';
import {OAuthAsanaCallback, OAuthJiraCallback, OAuthLinearCallback} from './OAuthCallback.tsx';

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
            <LocalStorageProvider>
                <ProgressProvider>
                    <IntegrationProvider>
                        <Router>
                            <Routes>
                                <Route path={'/oauth/asana/callback'} element={<OAuthAsanaCallback/>}/>
                                <Route path={'/oauth/jira/callback'} element={<OAuthJiraCallback/>}/>
                                <Route path={'/oauth/linear/callback'} element={<OAuthLinearCallback/>}/>
                                <Route
                                    path={'/'}
                                    element={
                                        <FileProvider>
                                            <TranscriptProvider>
                                                <TasksProvider>
                                                    <MenuBar/>
                                                    <Content />
                                                </TasksProvider>
                                            </TranscriptProvider>
                                        </FileProvider>
                                    }
                                />
                            </Routes>
                        </Router>
                    </IntegrationProvider>
                </ProgressProvider>
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
