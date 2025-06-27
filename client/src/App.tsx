import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MenuBar from "./MenuBar.tsx";
import OAuthCallback from "./OAuthCallback.tsx";
import { TranscriptProvider } from "./contexts/TranscriptContext.tsx";
import { SummaryProvider } from "./contexts/SummaryContext.tsx";
import Content from "./Content.tsx";
import { Toaster } from "react-hot-toast";
import { FileProvider } from "./contexts/FileContext.tsx";

function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <MenuBar />
      <Router>
        <Routes>
          <Route path={"/oauth/callback"} element={<OAuthCallback />} />
          <Route
            path={"/"}
            element={
              <FileProvider>
                <TranscriptProvider>
                  <SummaryProvider>
                    <Content />
                  </SummaryProvider>
                </TranscriptProvider>
              </FileProvider>
            }
          />
        </Routes>
      </Router>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </div>
  );
}

export default App;
