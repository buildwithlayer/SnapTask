import { createContext, useContext, useState, type ReactNode } from "react";
import type { FileWithPath } from "react-dropzone";

interface FileContextType {
  file?: FileWithPath;
  setFile: (file: FileWithPath) => void;
}

const FileContext = createContext<FileContextType>({
  setFile: () => {},
});

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [file, setFile] = useState<FileWithPath | undefined>(undefined);

  return (
    <FileContext.Provider
      value={{
        file,
        setFile,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => useContext(FileContext);
