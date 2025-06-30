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
import {
  isUpdateIssue,
  type CreateIssue,
  type UpdateIssue,
} from "../linearTypes";

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

  const [issueToolCalls, setIssueToolCalls] = useState<
    ChatCompletionMessageToolCall[]
  >([]);
  const [approvedIssues, setApprovedIssues] = useState<Record<string, any>>({});
  const [approveLoading, setApproveLoading] = useState<string[]>([]);
  const [rejectedIssues, setRejectedIssues] = useState<Record<string, any>>({});

  const [issues, setIssues] = useState<
    Record<string, CreateIssue | UpdateIssue>
  >({});

  useEffect(() => {
    if (Object.keys(issues).length > 0) return;

    async function fetchIssues() {
      const resolvedIssues = await Promise.all(
        issueToolCalls.map(async (toolCall) => {
          const issueData = JSON.parse(toolCall.function.arguments);
          if (isUpdateIssue(issueData)) {
            const getIssueResponse = await callTool?.("get_issue", {
              id: issueData.id,
            });
            if (getIssueResponse) {
              issueData.originalIssue = JSON.parse(
                getIssueResponse.content[0].text
              );
            }
          }
          return { [toolCall.id]: issueData };
        })
      );

      const issuesObject = Object.assign({}, ...resolvedIssues);
      setIssues(issuesObject);
    }

    fetchIssues().catch((error) => {
      console.error("Error fetching issues:", error);
      toast.error("Could not fetch issues");
    });
  }, [issueToolCalls, callTool]);

  useEffect(() => {
    console.log("Issues updated:", issues);
  }, [issues]);

  const unreviewedIssues = Object.fromEntries(
    Object.entries(issues).filter(([toolCallId]) => {
      return !approvedIssues[toolCallId] && !rejectedIssues[toolCallId];
    })
  );

  useEffect(() => {
    if (incompleteToolCalls && Object.entries(issues).length === 0) {
      const issueToolCalls = incompleteToolCalls.filter(
        (toolCall) =>
          toolCall.function.name === "create_issue" ||
          toolCall.function.name === "update_issue"
      );

      setIssueToolCalls(issueToolCalls);
      localStorage.setItem("issueToolCalls", JSON.stringify(issueToolCalls));
    }
  }, [incompleteToolCalls, issues.length]);

  useEffect(() => {
    const storedIssueToolCalls = localStorage.getItem("issueToolCalls");
    const storedApprovedIssues = localStorage.getItem("approvedIssues");
    const storedRejectedIssues = localStorage.getItem("rejectedIssues");

    if (storedIssueToolCalls) {
      const parsedIssues = JSON.parse(storedIssueToolCalls);
      setIssueToolCalls(parsedIssues);
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
      const toolCall = issueToolCalls.find(
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
