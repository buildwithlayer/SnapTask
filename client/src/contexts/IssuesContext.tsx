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
import type { CreateIssue, UpdateIssue } from "../linearTypes";

interface IssuesContextType {
  issues: Record<string, CreateIssue | UpdateIssue>;
  unreviewedIssues: Record<string, CreateIssue | UpdateIssue>;
  approveIssue: (toolCallId: string) => Promise<void>;
  approveLoading: string[];
  rejectIssue: (toolCallId: string) => void;
}

const IssuesContext = createContext<IssuesContextType>({
  issues: {},
  unreviewedIssues: {},
  approveIssue: async () => {},
  approveLoading: [],
  rejectIssue: () => {},
});

export const IssuesProvider = ({ children }: { children: ReactNode }) => {
  const { callTool } = useMcpContext();
  const { incompleteToolCalls } = useMessagesContext();

  const [createIssueToolCalls, setCreateIssueToolCalls] = useState<
    ChatCompletionMessageToolCall[]
  >([]);
  const [approvedIssues, setApprovedIssues] = useState<Record<string, any>>({});
  const [approveLoading, setApproveLoading] = useState<string[]>([]);
  const [rejectedIssues, setRejectedIssues] = useState<Record<string, any>>({});

  const issues: Record<string, any> = createIssueToolCalls.reduce(
    (acc, toolCall) => {
      const issueData = JSON.parse(toolCall.function.arguments);
      acc[toolCall.id] = issueData;
      return acc;
    },
    {} as Record<string, any>
  );

  const unreviewedIssues = Object.fromEntries(
    Object.entries(issues).filter(([toolCallId]) => {
      return !approvedIssues[toolCallId] && !rejectedIssues[toolCallId];
    })
  );

  useEffect(() => {
    if (incompleteToolCalls && Object.entries(issues).length === 0) {
      const createIssueToolCalls = incompleteToolCalls.filter(
        (toolCall) =>
          toolCall.function.name === "create_issue" ||
          toolCall.function.name === "update_issue"
      );

      setCreateIssueToolCalls(createIssueToolCalls);
      localStorage.setItem(
        "create-issue-tool-calls",
        JSON.stringify(createIssueToolCalls)
      );
    }
  }, [incompleteToolCalls, issues.length]);

  useEffect(() => {
    const storedCreateIssueToolCalls = localStorage.getItem(
      "create-issue-tool-calls"
    );
    const storedApprovedIssues = localStorage.getItem("approvedIssues");
    const storedRejectedIssues = localStorage.getItem("rejectedIssues");

    if (storedCreateIssueToolCalls) {
      const parsedIssues = JSON.parse(storedCreateIssueToolCalls);
      setCreateIssueToolCalls(parsedIssues);
    }
    if (storedApprovedIssues) {
      setApprovedIssues(JSON.parse(storedApprovedIssues));
    }
    if (storedRejectedIssues) {
      setRejectedIssues(JSON.parse(storedRejectedIssues));
    }
  }, []);

  async function approveIssue(toolCallId: string) {
    if (approveLoading.includes(toolCallId)) return;
    setApproveLoading((prev) => [...prev, toolCallId]);
    if (issues[toolCallId] && callTool) {
      const toolCall = createIssueToolCalls.find(
        (toolCall) => toolCall.id === toolCallId
      );
      if (toolCall) {
        try {
          await callTool(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          setApprovedIssues((prev) => ({
            ...prev,
            [toolCallId]: issues[toolCallId],
          }));
          localStorage.setItem(
            "approvedIssues",
            JSON.stringify({
              ...approvedIssues,
              [toolCallId]: issues[toolCallId],
            })
          );
        } catch (error) {
          console.error("Error approving issue:", error);
          toast.error("Could not approve issue");
        }
      }
      setApproveLoading((prev) => prev.filter((id) => id !== toolCallId));
    }
  }

  function rejectIssue(toolCallId: string) {
    if (issues[toolCallId]) {
      setRejectedIssues((prev) => ({
        ...prev,
        [toolCallId]: issues[toolCallId],
      }));
      localStorage.setItem(
        "rejectedIssues",
        JSON.stringify({
          ...rejectedIssues,
          [toolCallId]: issues[toolCallId],
        })
      );
    }
  }

  return (
    <IssuesContext.Provider
      value={{
        issues,
        unreviewedIssues,
        approveIssue,
        approveLoading,
        rejectIssue,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};

export const useIssuesContext = () => useContext(IssuesContext);
