import {createContext, useContext, useEffect, useState} from 'react';
import {useLocalStorageContext} from './LocalStorageContext';

export type ProgressStep = 'done' | 'generating' | 'reviewing' | 'select-integration' | 'transcribing' | 'upload';

interface ProgressContextType {
    setStep: (step: ProgressStep) => void;
    step: ProgressStep;
}

const ProgressContext = createContext<ProgressContextType>({
    setStep: () => {},
    step: 'select-integration',
});

export const ProgressProvider = ({children}: { children: React.ReactNode }) => {
    const {getLocalProgressStep, setLocalProgressStep} = useLocalStorageContext();
    const [step, setStep] = useState<ProgressStep>('select-integration');

    function updateStep(newStep: ProgressStep) {
        setStep(newStep);
        setLocalProgressStep(newStep);
    }

    useEffect(() => {
        setStep(getLocalProgressStep());
    }, [getLocalProgressStep]);

    return (
        <ProgressContext.Provider value={{setStep: updateStep, step}}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgressContext = () => useContext(ProgressContext);
