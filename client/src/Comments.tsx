import Button from "./components/Button";
import ToolTypeBadge from "./components/ToolTypeBadge";
import { useCommentsContext } from "./contexts/CommentsContext";
import { type CreateComment } from "./linearTypes";
import DeleteIcon from "./assets/delete.svg?react";
import CheckIcon from "./assets/check.svg?react";
import IssuesIcon from "./assets/issues.svg?react";

const Comments = () => {
  const { unreviewedComments } = useCommentsContext();

  return (
    <div className="flex flex-col gap-4 items-center w-full h-full">
      {Object.entries(unreviewedComments).length > 0 ? (
        Object.entries(unreviewedComments).map(([toolCallId, comment]) => (
          <Comment key={toolCallId} toolCallId={toolCallId} comment={comment} />
        ))
      ) : (
        <div className="flex flex-col gap-8 items-center justify-center w-full h-full">
          <p>All comments reviewed</p>
        </div>
      )}
    </div>
  );
};

interface CommentProps {
  toolCallId: string;
  comment: CreateComment;
}

const Comment = ({ toolCallId, comment }: CommentProps) => {
  const { approveComment, rejectComment, approveLoading } =
    useCommentsContext();

  return (
    <div className="bg-gray-900 border border-gray-850 p-4 rounded-lg w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <ToolTypeBadge type="New" />
        <div className="flex gap-3">
          <Button
            onClick={() => {
              rejectComment(toolCallId);
            }}
            style="outlined"
            additionalClasses="border-red-500 hover:bg-red-500/10 text-red-500 !p-2"
          >
            <DeleteIcon className="w-5 h-5 fill-red-500" />
          </Button>
          <Button
            onClick={() => {
              approveComment(toolCallId);
            }}
            loading={approveLoading.includes(toolCallId)}
            additionalClasses="!p-2"
          >
            <CheckIcon className="w-5 h-5 fill-white" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <a
          className="flex gap-2 items-center hover:underline"
          href={comment.issue.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IssuesIcon className="w-5 h-5 fill-gray-200" />
          <h3 className="text-xl font-medium">{comment.issue.title}</h3>
        </a>
        <p className="text-gray-300">{comment.body}</p>
      </div>
    </div>
  );
};

export default Comments;
