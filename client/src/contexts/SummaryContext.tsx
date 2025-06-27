import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranscriptContext } from "./TranscriptContext";
import toast from "react-hot-toast";

interface SummaryContextType {
  summary?: string;
  summarizeTranscript: () => Promise<void>;
  loading: boolean;
  error?: Error;
}

const SummaryContext = createContext<SummaryContextType>({
  summarizeTranscript: async () => {},
  loading: false,
});

export const SummaryProvider = ({ children }: { children: ReactNode }) => {
  const { transcript } = useTranscriptContext();

  const [summary, setSummary] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const storedSummary = localStorage.getItem("summary");
    if (storedSummary) {
      setSummary(storedSummary);
    }
  }, []);

  async function summarizeTranscript(): Promise<void> {
    setSummary(undefined);
    setLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/api/extract`, {
      body: JSON.stringify({ transcript }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("summary", data.summary);
          setSummary(data.summary);
        } else {
          console.error(await response.text());
          toast.error("Could not summarize transcript");
          setError(new Error("Could not summarize transcript"));
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <SummaryContext.Provider
      value={{
        summary,
        summarizeTranscript,
        loading,
        error,
      }}
    >
      {children}
    </SummaryContext.Provider>
  );
};

export const useSummaryContext = () => useContext(SummaryContext);
