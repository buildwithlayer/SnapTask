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
import PersonIcon from "./assets/person.svg?react";
import GroupIcon from "./assets/group.svg?react";
import ProjectIcon from "./assets/project.svg?react";
import { useLinearContext } from "./contexts/LinearContext";

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
  const { users, projects, teams } = useLinearContext();

  const assignee = users?.find((user) => user.id === issue.assigneeId);
  const project = projects?.find((proj) => proj.id === issue.projectId);
  const team = isUpdateIssue(issue)
    ? undefined
    : teams?.find((team) => team.id === issue.teamId);

  const state =
    team && team.issueStatuses
      ? team.issueStatuses.find((status) => status.id === issue.stateId)
      : undefined;
  const labels =
    team && team.issueLabels
      ? team.issueLabels.filter((label) => issue.labelIds?.includes(label.id))
      : [];

  return (
    <div className="bg-gray-900 border border-gray-850 p-4 rounded-lg w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        {isUpdateIssue(issue) ? (
          <ToolTypeBadge type="Updated" />
        ) : (
          <ToolTypeBadge type="New" />
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
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-medium">{issue.title}</h3>
        {issue.description && (
          <p className="text-gray-300">{issue.description}</p>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {team && (
          <AttributeTag
            label={team.name}
            icon={<GroupIcon className="fill-gray-300 w-4 h-4" />}
          />
        )}
        {assignee && (
          <AttributeTag
            label={assignee.name}
            icon={<PersonIcon className="fill-gray-300 w-4 h-4" />}
          />
        )}
        {project && (
          <AttributeTag
            label={project.name}
            icon={<ProjectIcon className="fill-gray-300 w-4 h-4" />}
          />
        )}
        {state && <AttributeTag label={state.name} icon={<></>} />}
      </div>
      {labels.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="font-bold">Labels</p>
          <div className="flex gap-2">
            {labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-1 bg-gray-800 rounded-full text-sm"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AttributeTag = ({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 border border-gray-700 text-gray-300 rounded-md text-sm">
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default Issues;
