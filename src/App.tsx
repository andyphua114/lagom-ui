import { AuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import { ChatPage } from "./components/ChatPage";
import { LoginPage } from "./components/LoginPage";
import { useChatSettings } from "./hooks/useChatSettings";

interface AppShellProps {
  resetSettings: () => void;
  settings: ReturnType<typeof useChatSettings>["settings"];
  updateSettings: ReturnType<typeof useChatSettings>["updateSettings"];
}

function LoadingScreen({ assistantName }: { assistantName: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
        <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-500 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          {assistantName}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Restoring your session...
        </p>
      </section>
    </main>
  );
}

function AppShell({ resetSettings, settings, updateSettings }: AppShellProps) {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return <LoadingScreen assistantName={settings.assistantName} />;
  }

  if (!isAuthenticated) {
    return <LoginPage assistantName={settings.assistantName} />;
  }

  return (
    <ChatPage
      resetSettings={resetSettings}
      settings={settings}
      updateSettings={updateSettings}
    />
  );
}

function App() {
  const { resetSettings, settings, updateSettings } = useChatSettings();

  return (
    <AuthProvider apiBaseUrl={settings.apiBaseUrl}>
      <AppShell
        resetSettings={resetSettings}
        settings={settings}
        updateSettings={updateSettings}
      />
    </AuthProvider>
  );
}

export default App;
