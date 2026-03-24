import { useState } from "react";
import { Spinner } from "./ui";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    localStorage.setItem("admin_token", token.trim());
    onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded border border-gray-200 p-6"
      >
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
          Admin Login
        </h1>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Admin token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your token"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="flex w-full items-center justify-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading && <Spinner />}
          Sign in
        </button>
      </form>
    </div>
  );
}
