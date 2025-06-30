import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Project, Team, User } from "../linearTypes";
import { useMcpContext } from "./McpContext";
import toast from "react-hot-toast";

interface LinearContextType {
  users?: User[];
  projects?: Project[];
  teams?: Team[];
  fetchLinearData: () => Promise<void>;
  loading: boolean;
  error?: Error;
}

const LinearContext = createContext<LinearContextType>({
  fetchLinearData: async () => {},
  loading: false,
});

export const LinearProvider = ({ children }: { children: ReactNode }) => {
  const { callTool } = useMcpContext();

  const [users, setUsers] = useState<User[] | undefined>(undefined);
  const [projects, setProjects] = useState<Project[] | undefined>(undefined);
  const [teams, setTeams] = useState<Team[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  async function fetchLinearData() {
    if (!callTool) return;

    setLoading(true);

    try {
      const [usersResponse, projectsResponse, teamsResponse] =
        await Promise.all([
          callTool("list_users", {}),
          callTool("list_projects", {}),
          callTool("list_teams", {}),
        ]);

      if (usersResponse) {
        const usersContent = JSON.parse(usersResponse.content[0].text);
        localStorage.setItem("linear_users", JSON.stringify(usersContent));
        setUsers(usersContent);
      }
      if (projectsResponse) {
        const projectsContent = JSON.parse(projectsResponse.content[0].text);
        localStorage.setItem(
          "linear_projects",
          JSON.stringify(projectsContent)
        );
        setProjects(projectsContent);
      }
      if (teamsResponse) {
        const teamsContent = JSON.parse(teamsResponse.content[0].text);
        localStorage.setItem("linear_teams", JSON.stringify(teamsContent));
        setTeams(teamsContent);
      }
    } catch (error) {
      console.error("Error fetching Linear data:", error);
      toast.error("Failed to fetch Linear data. Please try again later.");
      setError(error as Error);
    }

    setLoading(false);
  }

  useEffect(() => {
    const storedUsers = localStorage.getItem("linear_users");
    const storedProjects = localStorage.getItem("linear_projects");
    const storedTeams = localStorage.getItem("linear_teams");

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    }
  }, []);

  return (
    <LinearContext.Provider
      value={{
        users,
        projects,
        teams,
        fetchLinearData,
        loading,
        error,
      }}
    >
      {children}
    </LinearContext.Provider>
  );
};

export const useLinearContext = () => useContext(LinearContext);
