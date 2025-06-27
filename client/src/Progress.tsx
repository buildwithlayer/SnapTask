import { useEffect, useState } from "react";
import { useFileContext } from "./contexts/FileContext";
import { ClipLoader } from "react-spinners";
import { useSummaryContext } from "./contexts/SummaryContext";
import { useTranscriptContext } from "./contexts/TranscriptContext";
import { useMessagesContext } from "./contexts/MessagesContext";
import Button from "./components/Button";

interface Step {
  label: string;
  start: boolean;
  loading: boolean;
  fn: () => void;
  error?: Error;
  complete: boolean;
}

const Progress = () => {
  const { file } = useFileContext();
  const {
    transcribeFile,
    transcript,
    loading: transcriptLoading,
    error: transcriptError,
  } = useTranscriptContext();
  const {
    summarizeTranscript,
    summary,
    loading: summaryLoading,
    error: summaryError,
  } = useSummaryContext();
  const {
    messages,
    getResponse,
    loading: messagesLoading,
    error: messagesError,
    awaitingResponse,
  } = useMessagesContext();

  const [userMessage, setUserMessage] = useState<string>("");

  return (
    <div className="w-full h-full max-w-content-max-width px-4">
      <div className="flex flex-col gap-4 items-center justify-center w-full h-full py-10">
        <Step
          label={"Transcribing File"}
          loading={transcriptLoading}
          start={
            file !== undefined &&
            !transcript &&
            !localStorage.getItem("transcript")
          }
          error={transcriptError}
          fn={transcribeFile}
          complete={transcript !== undefined && !transcriptError}
        />
        <Step
          label={"Summarizing Transcript"}
          loading={summaryLoading}
          start={
            transcript !== undefined &&
            !summary &&
            !localStorage.getItem("summary")
          }
          error={summaryError}
          fn={summarizeTranscript}
          complete={summary !== undefined && !summaryError}
        />
        <Step
          label={"Generating Linear Action Items"}
          loading={messagesLoading}
          start={summary !== undefined && messages.length === 1}
          error={messagesError}
          fn={getResponse}
          complete={messages.length > 1 && !messagesError}
        />
        {awaitingResponse && (
          // TODO: Style this
          <div className="flex flex-col h-full w-full justify-between">
            <pre className="max-w-full max-h-[400px] overflow-y-auto bg-gray-800">
              {JSON.stringify(messages[messages.length - 1].content, null, 2)}
            </pre>
            <div className="flex items-center">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white"
              />
              <Button
                onClick={() => {
                  getResponse(userMessage);
                  setUserMessage("");
                }}
              >
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Step = ({ label, start, loading, fn, error, complete }: Step) => {
  useEffect(() => {
    if (start && !loading && !error) {
      fn();
    }
  }, [start, loading, error]);

  return (
    <>
      {(loading || complete || error) && (
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="flex gap-2 items-center">
            {loading && <ClipLoader color="white" size={16} />}
            {/* TODO: Switch to icons */}
            {complete && <p className="text-gray-500">✓</p>}
            {error && <p className="text-red-500">❌</p>}
            <p className={`${complete ? "text-gray-500" : "text-white"}`}>
              {label}
            </p>
          </div>
          {error && <p className="text-red-500">{error.message}</p>}
        </div>
      )}
    </>
  );
};

export default Progress;
