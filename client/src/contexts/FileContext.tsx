import {createContext, type ReactNode, useContext, useState} from 'react';
import type {FileWithPath} from 'react-dropzone';
import {useProgressContext} from './ProgressContext';

interface FileContextType {
    file?: FileWithPath;
    setFile: (file: FileWithPath) => void;
}

const FileContext = createContext<FileContextType>({
    setFile: () => {
    },
});

export const FileProvider = ({children}: { children: ReactNode }) => {
    const {setStep} = useProgressContext();

    const [file, setFile] = useState<FileWithPath | undefined>(undefined);

    function updateFile(newFile: FileWithPath) {
        setFile(newFile);
        setStep('transcribing');
    }

    return (
        <FileContext.Provider
            value={{
                file,
                setFile: updateFile,
            }}
        >
            {children}
        </FileContext.Provider>
    );
};

export const useFileContext = () => useContext(FileContext);
