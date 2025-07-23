import {OpenAI} from 'openai/client';
import type {ChatCompletionMessageToolCall} from 'openai/resources/index.mjs';
import {
    createContext,
    type ReactNode,
    useContext,
} from 'react';
import { CreateCommentSchema, CreateIssueSchema, ProjectSchema, TeamSchema, UserSchema, type CreateComment, type CreateIssue, type Project, type Team, type UpdateIssue, type User } from '../linearTypes';
import z from 'zod';

interface LocalStorageContextType {
    getLocalTranscript: () => string | undefined;
    setLocalTranscript: (transcript: string) => void;
    getLocalMessages: () => OpenAI.ChatCompletionMessageParam[] | undefined;
    setLocalMessages: (messages: OpenAI.ChatCompletionMessageParam[]) => void;
    getLocalIncompleteToolCalls: () => OpenAI.ChatCompletionMessageToolCall[] | undefined;
    setLocalIncompleteToolCalls: (toolCalls: OpenAI.ChatCompletionMessageToolCall[]) => void;
    getLocalIssueToolCalls: () => ChatCompletionMessageToolCall[] | undefined;
    setLocalIssueToolCalls: (issueToolCalls: ChatCompletionMessageToolCall[]) => void;
    getLocalApprovedIssues: () => Record<string, CreateIssue | UpdateIssue> | undefined;
    setLocalApprovedIssues: (issues: Record<string, CreateIssue | UpdateIssue>) => void;
    getLocalRejectedIssues: () => Record<string, CreateIssue | UpdateIssue> | undefined;
    setLocalRejectedIssues: (issues: Record<string, CreateIssue | UpdateIssue>) => void;
    getLocalCommentToolCalls: () => ChatCompletionMessageToolCall[] | undefined;
    setLocalCommentToolCalls: (commentToolCalls: ChatCompletionMessageToolCall[]) => void;
    getLocalApprovedComments: () => Record<string, CreateComment> | undefined;
    setLocalApprovedComments: (comments: Record<string, CreateComment>) => void;
    getLocalRejectedComments: () => Record<string, CreateComment> | undefined;
    setLocalRejectedComments: (comments: Record<string, CreateComment>) => void;
    getLocalLinearUsers: () => User[] | undefined;
    setLocalLinearUsers: (users: User[]) => void;
    getLocalLinearProjects: () => Project[] | undefined;
    setLocalLinearProjects: (projects: Project[]) => void;
    getLocalLinearTeams: () => Team[] | undefined;
    setLocalLinearTeams: (teams: Team[]) => void;
    resetLocalStorage: () => void;
    hardReset: () => void;
}

const LocalStorageContext = createContext<LocalStorageContextType>({
    getLocalTranscript: () => undefined,
    setLocalTranscript: (transcript: string) => {
        localStorage.setItem('transcript', transcript);
    },
    getLocalMessages: () => undefined,
    setLocalMessages: (messages: OpenAI.ChatCompletionMessageParam[]) => {
        localStorage.setItem('messages', JSON.stringify(messages));
    },
    getLocalIncompleteToolCalls: () => undefined,
    setLocalIncompleteToolCalls: (toolCalls: OpenAI.ChatCompletionMessageToolCall[]) => {
        localStorage.setItem('incompleteToolCalls', JSON.stringify(toolCalls));
    },
    getLocalIssueToolCalls: () => undefined,
    setLocalIssueToolCalls: (issueToolCalls: ChatCompletionMessageToolCall[]) => {
        localStorage.setItem('issueToolCalls', JSON.stringify(issueToolCalls));
    },
    getLocalApprovedIssues: () => ({}),
    setLocalApprovedIssues: (issues: Record<string, CreateIssue | UpdateIssue>) => {
        localStorage.setItem('approvedIssues', JSON.stringify(issues));
    },
    getLocalRejectedIssues: () => ({}),
    setLocalRejectedIssues: (issues: Record<string, CreateIssue | UpdateIssue>) => {
        localStorage.setItem('rejectedIssues', JSON.stringify(issues));
    },
    getLocalCommentToolCalls: () => undefined,
    setLocalCommentToolCalls: (commentToolCalls: ChatCompletionMessageToolCall[]) => {
        localStorage.setItem('commentToolCalls', JSON.stringify(commentToolCalls));
    },
    getLocalApprovedComments: () => ({}),
    setLocalApprovedComments: (comments: Record<string, CreateComment>) => {
        localStorage.setItem('approvedComments', JSON.stringify(comments));
    },
    getLocalRejectedComments: () => ({}),
    setLocalRejectedComments: (comments: Record<string, CreateComment>) => {
        localStorage.setItem('rejectedComments', JSON.stringify(comments));
    },
    getLocalLinearUsers: () => undefined,
    setLocalLinearUsers: (users: User[]) => {
        localStorage.setItem('linearUsers', JSON.stringify(users));
    },
    getLocalLinearProjects: () => undefined,
    setLocalLinearProjects: (projects: Project[]) => {
        localStorage.setItem('linearProjects', JSON.stringify(projects));
    },
    getLocalLinearTeams: () => undefined,
    setLocalLinearTeams: (teams: Team[]) => {
        localStorage.setItem('linearTeams', JSON.stringify(teams));
    },
    resetLocalStorage: () => {
        [
            'transcript',
            'messages',
            'incompleteToolCalls',
            'issueToolCalls',
            'approvedIssues',
            'rejectedIssues',
            'commentToolCalls',
            'approvedComments',
            'rejectedComments',
            'linearUsers',
            'linearProjects',
            'linearTeams',
        ].forEach((k) => localStorage.removeItem(k));

        window.location.pathname = '/';
    },
    hardReset: () => {
        localStorage.clear();
        window.location.pathname = '/';
    },
});

export const LocalStorageProvider = ({children}: { children: ReactNode }) => {
    const getLocalTranscript = () => {
        return localStorage.getItem('transcript') || undefined;
    }

    const setLocalTranscript = (transcript: string) => {
        localStorage.setItem('transcript', transcript);
    };

    const getLocalMessages = () => {
        const messages = localStorage.getItem('messages');
        try {
            if (!messages) return undefined;
            return JSON.parse(messages) as OpenAI.ChatCompletionMessageParam[];
        } catch (error) {
            console.error('Error parsing messages from localStorage:', error);
            return undefined;
        }
    };

    const setLocalMessages = (messages: OpenAI.ChatCompletionMessageParam[]) => {
        localStorage.setItem('messages', JSON.stringify(messages));
    };

    const getLocalIncompleteToolCalls = () => {
        const toolCalls = localStorage.getItem('incompleteToolCalls');
        try {
            if (!toolCalls) return undefined;
            return JSON.parse(toolCalls) as OpenAI.ChatCompletionMessageToolCall[];
        } catch (error) {
            console.error('Error parsing incompleteToolCalls from localStorage:', error);
            return undefined;
        }
    };

    const setLocalIncompleteToolCalls = (toolCalls: OpenAI.ChatCompletionMessageToolCall[]) => {
        localStorage.setItem('incompleteToolCalls', JSON.stringify(toolCalls));
    };

    const getLocalIssueToolCalls = () => {
        const issueToolCalls = localStorage.getItem('issueToolCalls');
        try {
            if (!issueToolCalls) return undefined;
            return JSON.parse(issueToolCalls) as ChatCompletionMessageToolCall[];
        } catch (error) {
            console.error('Error parsing issueToolCalls from localStorage:', error);
            return undefined;
        }
    };

    const setLocalIssueToolCalls = (issueToolCalls: ChatCompletionMessageToolCall[]) => {
        localStorage.setItem('issueToolCalls', JSON.stringify(issueToolCalls));
    };

    const getLocalApprovedIssues = () => {
        const approvedIssues = localStorage.getItem('approvedIssues');
        try {
            const parsedIssues = JSON.parse(approvedIssues || '{}');
            const approvedIssuesParseResult = z.record(CreateIssueSchema).safeParse(parsedIssues);
            return approvedIssuesParseResult.success ? approvedIssuesParseResult.data : undefined;
        } catch (error) {
            console.error('Error parsing approvedIssues from localStorage:', error);
            return undefined;
        }
    };

    const setLocalApprovedIssues = (issues: Record<string, CreateIssue | UpdateIssue>) => {
        localStorage.setItem('approvedIssues', JSON.stringify(issues));
    };

    const getLocalRejectedIssues = () => {
        const rejectedIssues = localStorage.getItem('rejectedIssues');
        try {
            const parsedIssues = JSON.parse(rejectedIssues || '{}');
            const rejectedIssuesParseResult = z.record(CreateIssueSchema).safeParse(parsedIssues);
            return rejectedIssuesParseResult.success ? rejectedIssuesParseResult.data : undefined;
        } catch (error) {
            console.error('Error parsing rejectedIssues from localStorage:', error);
            return undefined;
        }
    };

    const setLocalRejectedIssues = (issues: Record<string, CreateIssue | UpdateIssue>) => {
        localStorage.setItem('rejectedIssues', JSON.stringify(issues));
    };

    const getLocalCommentToolCalls = () => {
        const commentToolCalls = localStorage.getItem('commentToolCalls');
        try {
            if (!commentToolCalls) return undefined;
            return JSON.parse(commentToolCalls) as ChatCompletionMessageToolCall[];
        } catch (error) {
            console.error('Error parsing commentToolCalls from localStorage:', error);
            return undefined;
        }
    };

    const setLocalCommentToolCalls = (commentToolCalls: ChatCompletionMessageToolCall[]) => {
        localStorage.setItem('commentToolCalls', JSON.stringify(commentToolCalls));
    };

    const getLocalApprovedComments = () => {
        const approvedComments = localStorage.getItem('approvedComments');
        try {
            const parsedComments = JSON.parse(approvedComments || '{}');
            const approvedCommentsParseResult = z.record(CreateCommentSchema).safeParse(parsedComments);
            return approvedCommentsParseResult.success ? approvedCommentsParseResult.data : undefined;
        } catch (error) {
            console.error('Error parsing approvedComments from localStorage:', error);
            return undefined;
        }
    };

    const setLocalApprovedComments = (comments: Record<string, CreateComment>) => {
        localStorage.setItem('approvedComments', JSON.stringify(comments));
    };

    const getLocalRejectedComments = () => {
        const rejectedComments = localStorage.getItem('rejectedComments');
        try {
            const parsedComments = JSON.parse(rejectedComments || '{}');
            const rejectedCommentsParseResult = z.record(CreateCommentSchema).safeParse(parsedComments);
            return rejectedCommentsParseResult.success ? rejectedCommentsParseResult.data : undefined;
        } catch (error) {
            console.error('Error parsing rejectedComments from localStorage:', error);
            return undefined;
        }
    };

    const setLocalRejectedComments = (comments: Record<string, CreateComment>) => {
        localStorage.setItem('rejectedComments', JSON.stringify(comments));
    };

    const getLocalLinearUsers = () => {
        const linearUsers = localStorage.getItem('linearUsers');
        try {
            const parsedUsers = JSON.parse(linearUsers || '');
            const linearUsersParseResult = z.array(UserSchema).safeParse(parsedUsers);
            return linearUsersParseResult.success ? linearUsersParseResult.data : undefined;
        } catch (error) {
            console.error('Error parsing linearUsers from localStorage:', error);
            return undefined;
        }
    };

    const setLocalLinearUsers = (users: User[]) => {
        localStorage.setItem('linearUsers', JSON.stringify(users));
    };

    const getLocalLinearProjects = () => {
        const linearProjects = localStorage.getItem('linearProjects');
        try {
            const parsedProjects = JSON.parse(linearProjects || '');
            const linearProjectsParseResult = z.array(ProjectSchema).safeParse(parsedProjects);
            return linearProjectsParseResult.success ? linearProjectsParseResult.data : undefined;
        } catch (error) {
            console.error('Error parsing linearProjects from localStorage:', error);
            return undefined;
        }
    };

    const setLocalLinearProjects = (projects: Project[]) => {
        localStorage.setItem('linearProjects', JSON.stringify(projects));
    };

    const getLocalLinearTeams = () => {
        const linearTeams = localStorage.getItem('linearTeams');
        try {
            const parsedTeams = JSON.parse(linearTeams || '');
            const linearTeamsParseResult = z.array(TeamSchema).safeParse(parsedTeams);
            return linearTeamsParseResult.success ? linearTeamsParseResult.data : undefined;
        } catch (error) {
            console.error('Error parsing linearTeams from localStorage:', error);
            return undefined;
        }
    };

    const setLocalLinearTeams = (teams: Team[]) => {
        localStorage.setItem('linearTeams', JSON.stringify(teams));
    };

    const resetLocalStorage = () => {
        [
            'transcript',
            'messages',
            'incompleteToolCalls',
            'issueToolCalls',
            'approvedIssues',
            'rejectedIssues',
            'commentToolCalls',
            'approvedComments',
            'rejectedComments',
            'linearUsers',
            'linearProjects',
            'linearTeams',
        ].forEach((k) => localStorage.removeItem(k));

        window.location.pathname = '/';
    };

    const hardReset = () => {
        localStorage.clear();
        window.location.pathname = '/';
    };

    return (
        <LocalStorageContext.Provider
            value={{
                getLocalTranscript,
                setLocalTranscript,
                getLocalMessages,
                setLocalMessages,
                getLocalIncompleteToolCalls,
                setLocalIncompleteToolCalls,
                getLocalIssueToolCalls,
                setLocalIssueToolCalls,
                getLocalApprovedIssues,
                setLocalApprovedIssues,
                getLocalRejectedIssues,
                setLocalRejectedIssues,
                getLocalCommentToolCalls,
                setLocalCommentToolCalls,
                getLocalApprovedComments,
                setLocalApprovedComments,
                getLocalRejectedComments,
                setLocalRejectedComments,
                getLocalLinearUsers,
                setLocalLinearUsers,
                getLocalLinearProjects,
                setLocalLinearProjects,
                getLocalLinearTeams,
                setLocalLinearTeams,
                resetLocalStorage,
                hardReset,
            }}
        >
            {children}
        </LocalStorageContext.Provider>
    );
};

export const useLocalStorageContext = () => useContext(LocalStorageContext);
