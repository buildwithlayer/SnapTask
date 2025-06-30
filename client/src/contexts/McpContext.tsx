import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useMcp, type Tool, type UseMcpResult } from "use-mcp/react";
import { ClipLoader } from "react-spinners";
import Button from "../components/Button";

interface McpContextType {
  callTool?: UseMcpResult["callTool"];
  tools?: Tool[];
  state?: UseMcpResult["state"];
}

const McpContext = createContext<McpContextType>({});

export const McpProvider = ({ children }: { children: ReactNode }) => {
  const { callTool, state, tools, error, retry, authenticate } = useMcp({
    autoReconnect: true,
    callbackUrl: import.meta.env.VITE_CALLBACK_URL,
    clientName: "SnapLinear",
    url: "https://mcp.linear.app/sse",
  });


  // TODO: FINISH EMAIL COLLECTION
  useEffect(() => {
    const fetchIssues = async () => {
      if (state === "ready" && callTool) {
        const issues = await callTool?.("list_my_issues", {
          limit: 50,
        });
        issues?.data?.forEach((issue: any) => {
          console.log("Issue",issue.assigneeId);
        });
      }
    };
  fetchIssues();
  }, [state, callTool]);

  const includedTools = [
    "list_comments",
    "create_comment",
    "get_issue",
    "list_issues",
    "create_issue",
    "update_issue",
    "list_issue_statuses",
    "get_issue_status",
    "list_my_issues",
    "list_issue_labels",
    "list_projects",
    "get_project",
    "list_teams",
    "get_team",
    "list_users",
    "get_user",
    "search_documentation",
  ];

  const filteredTools = tools?.filter((tool) => {
    return includedTools.includes(tool.name);
  });

  return (
    <McpContext.Provider value={{ callTool, tools: filteredTools, state }}>
      {state === "failed" && (
        <div className="flex flex-col items-center justify-center text-center h-full w-full gap-8">
          <div className="flex flex-col items-center gap-1">
            <p>Connection failed:</p>
            <p className="text-red-500">{error}</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={retry}>Retry</Button>
            <Button onClick={authenticate}>Authenticate Manually</Button>
          </div>
        </div>
      )}
      {state !== "failed" && state !== "ready" && (
        <div className="flex h-full w-full items-center justify-center">
          <ClipLoader size={56} color="white" />
        </div>
      )}
      {state === "ready" && children}
    </McpContext.Provider>
  );
};

export const useMcpContext = () => useContext(McpContext);
