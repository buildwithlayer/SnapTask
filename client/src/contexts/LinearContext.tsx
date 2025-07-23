import * as amplitude from '@amplitude/analytics-browser';
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import toast from 'react-hot-toast';
import z from 'zod';
import {type BaseIssue, BaseIssueSchema, type BaseTeam, BaseTeamSchema, type Project, ProjectSchema, type Team, type User, UserSchema} from '../linearTypes';
import {useLocalStorageContext} from './LocalStorageContext';
import {useMcpContext} from './McpContext';

interface LinearContextType {
    error?: Error;
    fetchLinearData: () => Promise<void>;
    loading: boolean;
    projects?: Project[];
    teams?: Team[];
    users?: User[];
}

const LinearContext = createContext<LinearContextType>({
    fetchLinearData: async () => {
    },
    loading: false,
});

export const LinearProvider = ({children}: { children: ReactNode }) => {
    const {callTool, state} = useMcpContext();
    const {getLocalLinearProjects, getLocalLinearTeams, getLocalLinearUsers, setLocalLinearProjects, setLocalLinearTeams, setLocalLinearUsers} = useLocalStorageContext();

    const [users, setUsers] = useState<User[] | undefined>(undefined);
    const [projects, setProjects] = useState<Project[] | undefined>(undefined);
    const [teams, setTeams] = useState<Team[] | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>(undefined);

    async function fetchLinearData() {
        if (!callTool || state !== 'ready') return;

        setLoading(true);

        try {
            const [usersResponse, projectsResponse, teamsResponse, myIssuesResponse] =
                await Promise.all([
                    callTool('list_users', {}),
                    callTool('list_projects', {}),
                    callTool('list_teams', {}),
                    callTool('list_my_issues', {limit: 1}),
                ]);

            if (usersResponse) {
                let usersParseResult;
                try {
                    usersParseResult = JSON.parse(usersResponse.content[0].text);
                } catch (error) {
                    console.error('Error parsing users:', error);
                    toast.error('Failed to parse users data.');
                    setError(error as Error);
                    return;
                }
                const usersZodParseResult = z.array(UserSchema).safeParse(
                    usersParseResult,
                );
                if (usersZodParseResult.error) {
                    console.error('Error parsing users:', usersZodParseResult.error);
                    toast.error('Failed to parse users data.');
                    setError(usersZodParseResult.error);
                    return;
                }
                const usersContent = usersZodParseResult.data as User[];
                setLocalLinearUsers(usersContent);
                setUsers(usersContent);

                if (myIssuesResponse) {
                    let myIssuesParseResult;
                    try {
                        myIssuesParseResult = JSON.parse(myIssuesResponse.content[0].text);
                    } catch (error) {
                        console.error('Error parsing my issues:', error);
                        toast.error('Failed to parse my issues data.');
                        setError(error as Error);
                        return;
                    }
                    const myIssuesZodParseResult = z.array(BaseIssueSchema).safeParse(
                        myIssuesParseResult,
                    );
                    if (myIssuesZodParseResult.error) {
                        console.error('Error parsing my issues:', myIssuesZodParseResult.error);
                        toast.error('Failed to parse my issues data.');
                        setError(myIssuesZodParseResult.error);
                        return;
                    }
                    const myIssue = (myIssuesZodParseResult.data as BaseIssue[]).pop();

                    if (myIssue) {
                        const user: User | undefined = usersContent.find((user: User) => user.id === myIssue.assigneeId);

                        if (!user) console.warn('⚠️ User not found');

                        else {
                            amplitude.setUserId(user.email);

                            const identify = new amplitude.Identify();
                            identify.set('email', user.email);
                            identify.set('name', user.name);
                            identify.set('displayName', user.displayName);
                            identify.set('isAdmin', user.isAdmin);
                            identify.set('linear_user_id', user.id);
                            identify.set('team_emails', usersContent.map((user: User) => user.email).join(','));

                            amplitude.identify(identify);
                        }
                    }
                }
            }
            if (projectsResponse) {
                let projectsParseResult;
                try {
                    projectsParseResult = JSON.parse(projectsResponse.content[0].text);
                } catch (error) {
                    console.error('Error parsing projects:', error);
                    toast.error('Failed to parse projects data.');
                    setError(error as Error);
                    return;
                }
                if ('content' in projectsParseResult) {
                    projectsParseResult = projectsParseResult.content;
                }
                const projectsZodParseResult = z.array(ProjectSchema).safeParse(
                    projectsParseResult,
                );
                if (projectsZodParseResult.error) {
                    console.error('Error parsing projects:', projectsZodParseResult.error);
                    toast.error('Failed to parse projects data.');
                    setError(projectsZodParseResult.error);
                    return;
                }
                const projectsContent = projectsZodParseResult.data as Project[];
                setLocalLinearProjects(projectsContent);
                setProjects(projectsContent);
            }
            if (teamsResponse) {
                let teamsParseResult;
                try {
                    teamsParseResult = JSON.parse(teamsResponse.content[0].text);
                } catch (error) {
                    console.error('Error parsing teams:', error);
                    toast.error('Failed to parse teams data.');
                    setError(error as Error);
                    return;
                }
                const teamsZodParseResult = z.array(BaseTeamSchema).safeParse(
                    teamsParseResult,
                );
                if (teamsZodParseResult.error) {
                    console.error('Error parsing teams:', teamsZodParseResult.error);
                    toast.error('Failed to parse teams data.');
                    setError(teamsZodParseResult.error);
                    return;
                }
                const teamsContent = teamsZodParseResult.data as BaseTeam[];
                const teams = await Promise.all(
                    teamsContent.map(async (baseTeam: BaseTeam) => {
                        const team: Team = {
                            ...baseTeam,
                            issueLabels: [],
                            issueStatuses: [],
                        };
                        const getIssueLabels = await callTool('list_issue_labels', {
                            teamId: team.id,
                        });
                        const getIssueStatuses = await callTool('list_issue_statuses', {
                            teamId: team.id,
                        });
                        try {
                            team.issueLabels = JSON.parse(getIssueLabels.content[0].text);
                            team.issueStatuses = JSON.parse(getIssueStatuses.content[0].text);
                        } catch (error) {
                            console.error('Error parsing team data:', error);
                        }

                        return team;
                    }),
                );
                setLocalLinearTeams(teams);
                setTeams(teams);
            }
        } catch (error) {
            console.error('Error fetching Linear data:', error);
            toast.error('Failed to fetch Linear data. Please try again later.');
            setError(error as Error);
        }

        setLoading(false);
    }

    useEffect(() => {
        if (!users || users.length === 0) {
            setUsers(getLocalLinearUsers());
        }
        if (!projects || projects.length === 0) {
            setProjects(getLocalLinearProjects());
        }
        if (!teams || teams.length === 0) {
            setTeams(getLocalLinearTeams());
        }
    }, [getLocalLinearProjects, getLocalLinearTeams, getLocalLinearUsers, users, projects, teams]);

    return (
        <LinearContext.Provider
            value={{
                error,
                fetchLinearData,
                loading,
                projects,
                teams,
                users,
            }}
        >
            {children}
        </LinearContext.Provider>
    );
};

export const useLinearContext = () => useContext(LinearContext);
