import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { OpenAI } from "openai/client";
import { useMcpContext } from "./McpContext";
import { convertTools, respondToUser } from "../utils/openaiMcp";
import type { Tool, UseMcpResult } from "use-mcp/react";
import toast from "react-hot-toast";
import type { ChatCompletionAssistantMessageParam } from "openai/resources/index.mjs";
import { useTranscriptContext } from "./TranscriptContext";
import { useLinearContext } from "./LinearContext";

interface MessagesContextType {
  messages: OpenAI.ChatCompletionMessageParam[];
  incompleteToolCalls: OpenAI.ChatCompletionMessageToolCall[];
  getResponse: (additionalUserMessage?: string) => void;
  loading: boolean;
  error?: Error;
  awaitingResponse: boolean;
  readToolCallStack: OpenAI.ChatCompletionMessageToolCall[];
}

export const MessagesContext = createContext<MessagesContextType>({
  messages: [],
  incompleteToolCalls: [],
  getResponse: async () => [],
  loading: false,
  awaitingResponse: false,
  readToolCallStack: [],
});

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const { transcript } = useTranscriptContext();
  const { tools, callTool } = useMcpContext();
  const { users, projects, teams } = useLinearContext();

  const [loading, setLoading] = useState<boolean>(false);

  const initialMessage: OpenAI.ChatCompletionMessageParam = {
    content: `You are SnapLinear, an AI teammate that turns stand-up discussion into tidy Linear issues.

Primary Objective:
Convert each actionable item from the user’s transcript into a well-scoped Linear issue (or a comment if a relevant issue exists) that lands in the correct team, project, status, and label.

Interaction Phases:
There are 3 interaction phases, they are the "LEARN phase", "ASK phase" and the "CREATE phase".

LEARN Phase:
Before creating any issues, familiarize yourself with the project.
- ALWAYS learn before you do:
  - Call \`list_issues\` with different search queries and a limit to search for similar issues in the project.
  - Available users:
    ${JSON.stringify(users)}
  - Available projects:
    ${JSON.stringify(projects)}
  - Available teams:
    - Use only ID's of the relevant team's issueStatuses for statusId arguments in \`create_issue\` or \`update_issue\` tool calls.
    - Use only ID's of the relevant team's issueLabels for labelIds arguments in \`create_issue\` or \`update_issue\` tool calls.
    ${JSON.stringify(teams)}
  - Available priorities:
    - 0 = None
    - 1 = Urgent
    - 2 = High
    - 3 = Medium
    - 4 = Low
  - Cache the responses in your working memory; cite them when choosing IDs or names.

ASK Phase (Optional):
If the transcript is ambiguous, and you cannot discern REQUIRED arguments to create/update issues or comments, ask a follow-up question before creating issues.  You can do this by simply responding with a regular message and NOT including any tool calls. If you have the information you need, you can skip this phase and go directly to the 

CREATE phase:
You are now in the create phase.  This phase is triggered the moment you submit a tool that creates or updates any items. DO NOT fill non-required arguments if the data is not included in the transcript.  Be sure to ALWAYS submit ALL edits and updates together in the final tool calls. Your usage of any mutating tool will terminate the loop.


Issue Quality Bar:
- Title: ≤ 60 chars, start with a verb.
- Description: You do not need to include a description for every issue.  Only include description if there are additional clarifying details needed. Linear philosophy says that descriptions are optionally read. 
- Apply status = "Todo" unless context dictates otherwise.

Be Idempotent & Safe:
- Never create duplicate issues (check with \`list_issues\` filtered by title).

Tone:
- Brief, action-oriented, professional.

Here is the transcript:

${transcript}`,
    role: "user",
  };

  const [messages, setMessages] = useState<OpenAI.ChatCompletionMessageParam[]>(
    []
  );
  const [incompleteToolCalls, setIncompleteToolCalls] = useState<
    OpenAI.ChatCompletionMessageToolCall[]
  >([]);
  const [readToolCallStack, setReadToolCallStack] = useState<
    OpenAI.ChatCompletionMessageToolCall[]
  >([]);
  const [error, setError] = useState<Error | undefined>(undefined);

  const lastMessage = messages[messages.length - 1];
  const awaitingResponse =
    (lastMessage?.role === "assistant" && !lastMessage?.tool_calls) ||
    (lastMessage?.role === "user" && messages.length > 1);

  useEffect(() => {
    if (transcript && messages.length === 0) {
      setMessages([initialMessage]);
      localStorage.setItem("messages", JSON.stringify([initialMessage]));
    }
  }, [transcript, messages.length]);

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
    setMessages(messagesToSend);
    respondToUser(
      messagesToSend,
      convertTools(tools as Tool[]),
      callTool as UseMcpResult["callTool"],
      (toolCall?: OpenAI.ChatCompletionMessageToolCall) => {
        if (toolCall) setReadToolCallStack((prev) => [...prev, toolCall]);
      }
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
        readToolCallStack,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessagesContext = () => useContext(MessagesContext);
