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
  unreviewedComments: Record<string, CreateComment>;
  approveComment: (toolCallId: string) => Promise<void>;
  approveLoading: string[];
  rejectComment: (toolCallId: string) => void;
}

const CommentsContext = createContext<CommentsContextType>({
  comments: {},
  unreviewedComments: {},
  approveComment: async () => {},
  approveLoading: [],
  rejectComment: () => {},
});

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const { callTool } = useMcpContext();
  const { incompleteToolCalls } = useMessagesContext();

  const [createCommentToolCalls, setCreateCommentToolCalls] = useState<
    ChatCompletionMessageToolCall[]
  >([]);
  const [approvedComments, setApprovedComments] = useState<Record<string, any>>(
    {}
  );
  const [approveLoading, setApproveLoading] = useState<string[]>([]);
  const [rejectedComments, setRejectedComments] = useState<Record<string, any>>(
    {}
  );

  const comments: Record<string, any> = createCommentToolCalls.reduce(
    (acc, toolCall) => {
      const commentData = JSON.parse(toolCall.function.arguments);
      acc[toolCall.id] = commentData;
      return acc;
    },
    {} as Record<string, any>
  );

  const unreviewedComments = Object.fromEntries(
    Object.entries(comments).filter(([toolCallId]) => {
      return !approvedComments[toolCallId] && !rejectedComments[toolCallId];
    })
  );

  useEffect(() => {
    if (incompleteToolCalls && Object.entries(comments).length === 0) {
      const createCommentToolCalls = incompleteToolCalls.filter(
        (toolCall) => toolCall.function.name === "create_comment"
      );

      setCreateCommentToolCalls(createCommentToolCalls);
      localStorage.setItem(
        "create-comment-tool-calls",
        JSON.stringify(createCommentToolCalls)
      );
    }
  }, [incompleteToolCalls, comments.length]);

  useEffect(() => {
    const storedCreateCommentToolCalls = localStorage.getItem(
      "create-comment-tool-calls"
    );
    const storedApprovedComments = localStorage.getItem("approvedComments");
    const storedRejectedComments = localStorage.getItem("rejectedComments");

    if (storedCreateCommentToolCalls) {
      const parsedComments = JSON.parse(storedCreateCommentToolCalls);
      setCreateCommentToolCalls(parsedComments);
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
      const toolCall = createCommentToolCalls.find(
        (toolCall) => toolCall.id === toolCallId
      );
      if (toolCall) {
        try {
          await callTool(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
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
