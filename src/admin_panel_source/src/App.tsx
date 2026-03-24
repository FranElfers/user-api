import { useState, useEffect } from "react";
import { Spinner } from "./components/ui";
import { LoginScreen } from "./components/login-screen";
import { UsersSection } from "./components/users-section";
import { SyncRecordsSection } from "./components/sync-records-section";
import { IndexesSection } from "./components/indexes-section";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState<
    "users" | "sync-records" | "indexes"
  >("users");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setIsAuthenticated(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const handleAuthError = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-56 border-r border-gray-200 bg-white">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="p-2">
          <button
            onClick={() => setActiveSection("users")}
            className={`w-full rounded px-3 py-2 text-left text-sm ${
              activeSection === "users"
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveSection("indexes")}
            className={`w-full rounded px-3 py-2 text-left text-sm ${
              activeSection === "indexes"
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Indexes
          </button>
          <button
            onClick={() => setActiveSection("sync-records")}
            className={`w-full rounded px-3 py-2 text-left text-sm ${
              activeSection === "sync-records"
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Sync records
          </button>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="flex items-center justify-end border-b border-gray-200 px-6 py-4">
          <button
            onClick={handleSignOut}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </header>

        <div className="p-6">
          {activeSection === "users" ? (
            <UsersSection onAuthError={handleAuthError} />
          ) : activeSection === "indexes" ? (
            <IndexesSection onAuthError={handleAuthError} />
          ) : (
            <SyncRecordsSection onAuthError={handleAuthError} />
          )}
        </div>
      </main>
    </div>
  );
}
