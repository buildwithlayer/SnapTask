import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useMessagesContext } from "./MessagesContext";
import { useMcpContext } from "./McpContext";
import toast from "react-hot-toast";
import type { ChatCompletionMessageToolCall } from "openai/resources/index.mjs";
import type { CreateComment } from "../linearTypes";

interface CommentsContextType {
  comments: Record<string, CreateComment>;
  commentsLoading: boolean;
  unreviewedComments: Record<string, CreateComment>;
  approveComment: (toolCallId: string) => Promise<void>;
  approveLoading: string[];
  rejectComment: (toolCallId: string) => void;
}

const CommentsContext = createContext<CommentsContextType>({
  comments: {},
  commentsLoading: false,
  unreviewedComments: {},
  approveComment: async () => {},
  approveLoading: [],
  rejectComment: () => {},
});

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const { callTool } = useMcpContext();
  const { incompleteToolCalls } = useMessagesContext();

  const [commentToolCalls, setCommentToolCalls] = useState<
    ChatCompletionMessageToolCall[]
  >([]);
  const [approvedComments, setApprovedComments] = useState<Record<string, any>>(
    {}
  );
  const [approveLoading, setApproveLoading] = useState<string[]>([]);
  const [rejectedComments, setRejectedComments] = useState<Record<string, any>>(
    {}
  );

  const [comments, setComments] = useState<Record<string, CreateComment>>({});
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);

  const unreviewedComments = Object.fromEntries(
    Object.entries(comments).filter(([toolCallId]) => {
      return !approvedComments[toolCallId] && !rejectedComments[toolCallId];
    })
  );

  useEffect(() => {
    if (Object.keys(comments).length > 0) return;

    setCommentsLoading(true);

    async function fetchComments() {
      const resolvedComments = await Promise.all(
        commentToolCalls.map(async (toolCall) => {
          const commentData = JSON.parse(toolCall.function.arguments);
          const getIssueResponse = await callTool?.("get_issue", {
            id: commentData.issueId,
          });
          if (getIssueResponse) {
            commentData.issue = JSON.parse(getIssueResponse.content[0].text);
          }
          return { [toolCall.id]: commentData };
        })
      );

      const commentsObject = Object.assign({}, ...resolvedComments);
      setComments(commentsObject);
    }

    fetchComments()
      .catch((error) => {
        console.error("Error fetching comments:", error);
        toast.error("Could not fetch comments");
      })
      .finally(() => {
        setCommentsLoading(false);
      });
  }, [commentToolCalls, callTool]);

  useEffect(() => {
    if (incompleteToolCalls && Object.entries(comments).length === 0) {
      const commentToolCalls = incompleteToolCalls.filter(
        (toolCall) => toolCall.function.name === "create_comment"
      );

      setCommentToolCalls(commentToolCalls);
      localStorage.setItem(
        "commentToolCalls",
        JSON.stringify(commentToolCalls)
      );
    }
  }, [incompleteToolCalls, comments.length]);

  useEffect(() => {
    const storedCommentToolCalls = localStorage.getItem("commentToolCalls");
    const storedApprovedComments = localStorage.getItem("approvedComments");
    const storedRejectedComments = localStorage.getItem("rejectedComments");

    if (storedCommentToolCalls) {
      const parsedComments = JSON.parse(storedCommentToolCalls);
      setCommentToolCalls(parsedComments);
    }
    if (storedApprovedComments) {
      setApprovedComments(JSON.parse(storedApprovedComments));
    }
    if (storedRejectedComments) {
      setRejectedComments(JSON.parse(storedRejectedComments));
    }
  }, []);

  async function approveComment(toolCallId: string) {
    if (approveLoading.includes(toolCallId)) return;
    setApproveLoading((prev) => [...prev, toolCallId]);
    if (comments[toolCallId] && callTool) {
      const toolCall = commentToolCalls.find(
        (toolCall) => toolCall.id === toolCallId
      );
      if (toolCall) {
        try {
          const toolResponse = await callTool(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          if (toolResponse.isError) {
            throw new Error(toolResponse.content[0].text);
          }
          setApprovedComments((prev) => ({
            ...prev,
            [toolCallId]: comments[toolCallId],
          }));
          localStorage.setItem(
            "approvedComments",
            JSON.stringify({
              ...approvedComments,
              [toolCallId]: comments[toolCallId],
            })
          );
        } catch (error) {
          console.error("Error approving comment:", error);
          toast.error("Could not approve comment");
        }
      }
      setApproveLoading((prev) => prev.filter((id) => id !== toolCallId));
    }
  }

  function rejectComment(toolCallId: string) {
    if (comments[toolCallId]) {
      setRejectedComments((prev) => ({
        ...prev,
        [toolCallId]: comments[toolCallId],
      }));
      localStorage.setItem(
        "rejectedComments",
        JSON.stringify({
          ...rejectedComments,
          [toolCallId]: comments[toolCallId],
        })
      );
    }
  }

  return (
    <CommentsContext.Provider
      value={{
        comments,
        commentsLoading,
        unreviewedComments,
        approveComment,
        approveLoading,
        rejectComment,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export const useCommentsContext = () => useContext(CommentsContext);
