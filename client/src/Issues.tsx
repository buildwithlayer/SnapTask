import Button from "./components/Button";
import ResetButton from "./components/ResetButton";
import { useIssuesContext } from "./contexts/IssuesContext";
import type { CreateIssue, UpdateIssue } from "./linearTypes";

const Issues = () => {
  const { unreviewedIssues } = useIssuesContext();

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-full py-10">
      {Object.entries(unreviewedIssues).length > 0 ? (
        Object.entries(unreviewedIssues).map(([toolCallId, issue]) => (
          <Issue key={toolCallId} toolCallId={toolCallId} issue={issue} />
        ))
      ) : (
        <div className="flex flex-col gap-8 items-center">
          <p>All issues reviewed</p>
          <ResetButton />
        </div>
      )}
    </div>
  );
};

interface IssueProps {
  toolCallId: string;
  issue: CreateIssue | UpdateIssue;
}

const Issue = ({ toolCallId, issue }: IssueProps) => {
  const { approveIssue, rejectIssue, approveLoading } = useIssuesContext();

  return (
    <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md overflow-x-auto flex flex-col gap-4">
      {Object.entries(issue).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <p className="font-bold">{key}</p>
          <p>{value}</p>
        </div>
      ))}
      <div className="flex gap-4">
        <Button
          onClick={() => {
            rejectIssue(toolCallId);
          }}
          additionalClasses="bg-red-500 hover:bg-red-600 w-full"
        >
          Delete
        </Button>
        <Button
          onClick={() => {
            approveIssue(toolCallId);
          }}
          additionalClasses="w-full"
          loading={approveLoading.includes(toolCallId)}
        >
          Add to Linear
        </Button>
      </div>
    </div>
  );
};

export default Issues;
