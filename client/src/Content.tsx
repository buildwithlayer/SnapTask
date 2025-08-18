import {useProgressContext} from './contexts/ProgressContext';
import IntegrationPage from './IntegrationPage';
import LandingPage from './LandingPage';
import Progress from './Progress';
import Survey from './Survey';
import Tasks from './Tasks';

const Content = () => {
    const {step} = useProgressContext();
    
    return (
        <div className="w-full h-full flex justify-center bg-gray-950 text-white overflow-hidden">
            {step === 'select-integration' && <LandingPage />}
            {step === 'upload' && <IntegrationPage />}
            {(step === 'transcribing' || step === 'generating') && <Progress />}
            {step === 'reviewing' && <Tasks />}
            {step === 'done' && <Survey />}
        </div>
    );
};

export default Content;
