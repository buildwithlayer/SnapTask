import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSummaryContext } from "./SummaryContext";
import { OpenAI } from "openai/client";
import { useMcpContext } from "./McpContext";
import { convertTools, respondToUser } from "../utils/openaiMcp";
import type { Tool, UseMcpResult } from "use-mcp/react";
import toast from "react-hot-toast";
import type { ChatCompletionAssistantMessageParam } from "openai/resources/index.mjs";

interface MessagesContextType {
  messages: OpenAI.ChatCompletionMessageParam[];
  incompleteToolCalls: OpenAI.ChatCompletionMessageToolCall[];
  getResponse: (additionalUserMessage?: string) => void;
  loading: boolean;
  error?: Error;
  awaitingResponse: boolean;
}

export const MessagesContext = createContext<MessagesContextType>({
  messages: [],
  incompleteToolCalls: [],
  getResponse: async () => [],
  loading: false,
  awaitingResponse: false,
});

const SYSTEM_PROMPT = `
You are SnapLinear, an AI teammate that turns stand-up discussion into tidy Linear issues.

Primary Objective:
Convert each actionable item from the user’s transcript into a well-scoped Linear issue that lands in the correct team, project, status, and label.

Interaction Rules:
- ALWAYS learn before you do:
  - Run one or more get/list calls first (e.g., \`list_teams\`, \`list_issue_statuses\`, \`list_issue_labels\`).
  - Cache the responses in your working memory; cite them when choosing IDs or names.

- ALWAYS RUN:
  - \`list_teams\`
  - \`list_projects\`
  - \`list_users\`
  - \`list_issue_statuses\`
  - \`list_issue_labels\`

- USE:
  - \`list_issues\` with different search queries and a limit to search for similar issues in the project.

- Before creating any issues, familiarize yourself with the project.

- Ask when uncertain:
  - If the transcript is ambiguous (missing team, assignee, due date, etc.), ask a follow-up question before creating issues.

Issue Quality Bar:
- Title: ≤ 60 chars, start with a verb.
- Description: single-sentence summary + bullet list of acceptance criteria.
- Apply status = "Todo" unless context dictates otherwise.

Be Idempotent & Safe:
- Never create duplicate issues (check with \`list_issues\` filtered by title).

Tone:
- Brief, action-oriented, professional.

Try your best to assign issues to the relevant users if possible. If you don't know who they are because the transcript does not contain that information, ask.

When running any \`create\` or \`update\` routes, ALWAYS submit all those tool calls at the same time. Your usage of any mutating tool will terminate the loop.

Here is the transcript:

{{transcript}}
`;

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const { summary } = useSummaryContext();
  const { tools, callTool } = useMcpContext();

  const [loading, setLoading] = useState<boolean>(false);

  const initialMessage: OpenAI.ChatCompletionMessageParam = {
    content: SYSTEM_PROMPT.replace('{{transcript}}', summary || ''),
    role: "user",
  };

  const [messages, setMessages] = useState<OpenAI.ChatCompletionMessageParam[]>(
    []
  );
  const [incompleteToolCalls, setIncompleteToolCalls] = useState<
    OpenAI.ChatCompletionMessageToolCall[]
  >([]);
  const [error, setError] = useState<Error | undefined>(undefined);

  const lastMessage = messages[messages.length - 1];
  const awaitingResponse =
    lastMessage?.role === "assistant" && !lastMessage?.tool_calls;

  useEffect(() => {
    if (summary && messages.length === 0) {
      setMessages([initialMessage]);
      localStorage.setItem("messages", JSON.stringify([initialMessage]));
    }
  }, [summary, messages.length]);

  useEffect(() => {
    const storedMessages = localStorage.getItem("messages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }

    const storedToolCalls = localStorage.getItem("incompleteToolCalls");
    if (storedToolCalls) {
      setIncompleteToolCalls(JSON.parse(storedToolCalls));
    }
  }, []);

  async function getResponse(additionalUserMessage?: string): Promise<void> {
    setLoading(true);
    let messagesToSend = messages;
    if (additionalUserMessage) {
      const userMessage: OpenAI.ChatCompletionMessageParam = {
        content: additionalUserMessage,
        role: "user",
      };
      messagesToSend = [...messages, userMessage];
    }
    respondToUser(
      messagesToSend,
      convertTools(tools as Tool[]),
      callTool as UseMcpResult["callTool"]
    )
      .then((newMessages) => {
        if (newMessages.length === 0) return;
        localStorage.setItem(
          "messages",
          JSON.stringify([...messagesToSend, ...newMessages])
        );
        setMessages([...messagesToSend, ...newMessages]);

        const assistantMessages: ChatCompletionAssistantMessageParam[] =
          newMessages.filter((msg) => msg.role === "assistant");
        const toolCallMessages: ChatCompletionAssistantMessageParam[] =
          assistantMessages.filter((msg) => msg.tool_calls);
        const toolCalls: OpenAI.ChatCompletionMessageToolCall[] =
          toolCallMessages.flatMap((msg) => msg.tool_calls || []);
        const incompleteToolCalls = toolCalls.filter(
          (tc) =>
            !newMessages.some(
              (msg) => msg.role === "tool" && msg.tool_call_id === tc?.id
            )
        );
        localStorage.setItem(
          "incompleteToolCalls",
          JSON.stringify(incompleteToolCalls || [])
        );
        setIncompleteToolCalls(incompleteToolCalls || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
        setError(err);
      })
      .finally(() => setLoading(false));
  }

  return (
    <MessagesContext.Provider
      value={{
        messages,
        incompleteToolCalls,
        getResponse,
        loading,
        error,
        awaitingResponse,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessagesContext = () => useContext(MessagesContext);
