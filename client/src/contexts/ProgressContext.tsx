import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorageContext } from "./LocalStorageContext";

export type ProgressStep = 'select-integration' | 'upload' | 'transcribing' | 'generating' | 'reviewing' | 'done';

interface ProgressContextType {
    step: ProgressStep;
    setStep: (step: ProgressStep) => void;
}

const ProgressContext = createContext<ProgressContextType>({
    step: 'select-integration',
    setStep: () => {},
});

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
    const {getLocalProgressStep, setLocalProgressStep} = useLocalStorageContext();
    const [step, setStep] = useState<ProgressStep>('select-integration');

    function updateStep(newStep: ProgressStep) {
        setStep(newStep);
        setLocalProgressStep(newStep);
    }

    useEffect(() => {
        setStep(getLocalProgressStep());
    }, []);

    return (
        <ProgressContext.Provider value={{ step, setStep: updateStep }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgressContext = () => useContext(ProgressContext);
