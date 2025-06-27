import Button from "./components/Button";
import ToolTypeBadge from "./components/ToolTypeBadge";
import { useIssuesContext } from "./contexts/IssuesContext";
import {
  isUpdateIssue,
  type CreateIssue,
  type UpdateIssue,
} from "./linearTypes";
import DeleteIcon from "./assets/delete.svg?react";
import CheckIcon from "./assets/check.svg?react";

const Issues = () => {
  const { unreviewedIssues } = useIssuesContext();

  return (
    <div className="flex flex-col gap-4 items-center w-full h-full">
      {Object.entries(unreviewedIssues).length > 0 ? (
        Object.entries(unreviewedIssues).map(([toolCallId, issue]) => (
          <Issue key={toolCallId} toolCallId={toolCallId} issue={issue} />
        ))
      ) : (
        <div className="flex flex-col gap-8 items-center justify-center w-full h-full">
          <p>All issues reviewed</p>
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
    <div className="bg-gray-900 border border-gray-850 p-4 rounded-lg w-full overflow-x-auto flex flex-col gap-4">
      <div className="flex justify-between items-center">
        {isUpdateIssue(issue) ? (
          <ToolTypeBadge type="Update" />
        ) : (
          <ToolTypeBadge type="Create" />
        )}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              rejectIssue(toolCallId);
            }}
            style="outlined"
            additionalClasses="border-red-500 hover:bg-red-500/10 text-red-500 !p-2"
          >
            <DeleteIcon className="w-5 h-5 fill-red-500" />
          </Button>
          <Button
            onClick={() => {
              approveIssue(toolCallId);
            }}
            loading={approveLoading.includes(toolCallId)}
            additionalClasses="!p-2"
          >
            <CheckIcon className="w-5 h-5 fill-white" />
          </Button>
        </div>
      </div>
      {Object.entries(issue).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <p className="font-bold">{key}</p>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
};

export default Issues;
