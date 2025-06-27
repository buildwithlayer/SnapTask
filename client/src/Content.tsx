import { useFileContext } from "./contexts/FileContext";
import { IssuesContext, IssuesProvider } from "./contexts/IssuesContext";
import { McpProvider } from "./contexts/McpContext";
import { MessagesProvider } from "./contexts/MessagesContext";
import { useSummaryContext } from "./contexts/SummaryContext";
import { useTranscriptContext } from "./contexts/TranscriptContext";
import FileUpload from "./FileUpload";
import Issues from "./Issues";
import Progress from "./Progress";

const Content = () => {
  const { file } = useFileContext();
  const { transcript } = useTranscriptContext();
  const { summary } = useSummaryContext();

  return (
    <div className="w-full h-full flex justify-center px-4 bg-gray-900 text-white">
      <div className="w-full h-full max-w-content-max-width">
        {!file && !transcript && !summary && <FileUpload />}
        {(file || transcript || summary) && (
          <McpProvider>
            <MessagesProvider>
              <IssuesProvider>
                <IssuesContext.Consumer>
                  {({ issues }) => (
                    <>
                      {Object.entries(issues).length > 0 ? (
                        <Issues />
                      ) : (
                        <Progress />
                      )}
                    </>
                  )}
                </IssuesContext.Consumer>
              </IssuesProvider>
            </MessagesProvider>
          </McpProvider>
        )}
      </div>
    </div>
  );
};

export default Content;
