import { useState } from "react";
import {
  type FileRejection,
  type FileWithPath,
  useDropzone,
} from "react-dropzone";
import Button from "./components/Button";
import toast from "react-hot-toast";
import { useFileContext } from "./contexts/FileContext";
import UploadIcon from "./assets/upload.svg?react";
import CloseIcon from "./assets/close.svg?react";

function FileUpload() {
  const { setFile } = useFileContext();

  const [localFile, setLocalFile] = useState<FileWithPath>();

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "audio/aac": [".aac"],
      "audio/mpeg": [".mp3"],
      "audio/ogg": [".oga", ".opus"],
      "audio/wav": [".wav"],
      "audio/webm": [".weba"],
      "text/markdown": [".md"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    onDrop: (
      acceptedFiles: readonly FileWithPath[],
      fileRejections: FileRejection[]
    ) => {
      if (fileRejections.length > 0) {
        toast.error(`Unsupported file type`);
        return;
      }
      setLocalFile(acceptedFiles[0]);
    },
    disabled: localFile !== undefined,
  });

  function handleSubmitTranscript() {
    if (!localFile) return;
    setFile(localFile);
  }

  return (
    <div className="w-full h-full flex justify-center items-center px-4">
      <div className="max-w-content-max-width w-full h-full flex flex-col items-center justify-center gap-15 text-center">
        <h1 className="text-4xl underline decoration-primary">
          Convert a meeting into tasks with AI
        </h1>
        <div className="w-full flex flex-col gap-4">
          <div
            {...getRootProps()}
            className={`w-full p-10 flex flex-col items-center gap-10 border-2 border-dashed border-gray-300 rounded-md transition-all duration-100 ${
              !localFile && "hover:bg-gray-800 cursor-pointer"
            }`}
          >
            <input {...getInputProps()} />
            {/* TODO: Add upload icon */}
            <UploadIcon fill="white" scale={72} />
            {!localFile && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xl text-gray-200">
                  {isDragActive
                    ? "Drop the file here"
                    : "Upload Audio or Transcription file"}
                </h3>
                <p className="text-gray-400 text-sm">
                  Supported file types: .aac, .mp3, .oga, .opus, .wav, .weba,
                  .md, .txt
                </p>
              </div>
            )}
            {localFile && (
              <div className="flex gap-5 items-center rounded-full bg-gray-700 pl-4 pr-3 py-2 text-sm">
                {localFile.name}
                <button
                  onClick={() => setLocalFile(undefined)}
                  className="rounded-full bg-white cursor-pointer hover:bg-gray-200 p-0.5"
                >
                  <CloseIcon className="fill-gray-800 w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <Button
            disabled={!localFile}
            additionalClasses="w-full py-3"
            onClick={handleSubmitTranscript}
          >
            Generate Linear Action Items
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
