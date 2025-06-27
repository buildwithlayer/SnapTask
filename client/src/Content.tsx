import { useFileContext } from "./contexts/FileContext";
import { IssuesProvider } from "./contexts/IssuesContext";
import { McpProvider } from "./contexts/McpContext";
import { MessagesContext, MessagesProvider } from "./contexts/MessagesContext";
import { useSummaryContext } from "./contexts/SummaryContext";
import { useTranscriptContext } from "./contexts/TranscriptContext";
import FileUpload from "./FileUpload";
import Progress from "./Progress";
import Review from "./Review";

const Content = () => {
  const { file } = useFileContext();
  const { transcript } = useTranscriptContext();
  const { summary } = useSummaryContext();

  return (
    <div className="w-full h-full flex justify-center bg-gray-950 text-white">
      {!file && !transcript && !summary && <FileUpload />}
      {(file || transcript || summary) && (
        <McpProvider>
          <MessagesProvider>
            <MessagesContext.Consumer>
              {({ incompleteToolCalls }) => (
                <>
                  {incompleteToolCalls.length > 0 ? (
                    <IssuesProvider>
                      <Review />
                    </IssuesProvider>
                  ) : (
                    <Progress />
                  )}
                </>
              )}
            </MessagesContext.Consumer>
          </MessagesProvider>
        </McpProvider>
      )}
    </div>
  );
};

export default Content;
