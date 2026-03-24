import { useState, useEffect } from "react";
import { Modal, Spinner } from "./ui";
import { apiCall } from "../api";
import type { User } from "../types";

export function UserFormModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    cuit: "",
    email: "",
    status: "active",
    isAdmin: false,
    config: "{}",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdToken, setCreatedToken] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        cuit: user.cuit,
        email: user.email,
        status: user.status,
        isAdmin: user.isAdmin,
        config: JSON.stringify(user.config, null, 2),
      });
    } else {
      setFormData({
        name: "",
        cuit: "",
        email: "",
        status: "active",
        isAdmin: false,
        config: "{}",
      });
    }
    setError("");
    setCreatedToken("");
    setCopied(false);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = user ? `/api/admin/users/${user._id}` : "/api/admin/users";
    const method = user ? "PUT" : "POST";

    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = JSON.parse(formData.config);
    } catch {
      setError("Config must be valid JSON");
      setLoading(false);
      return;
    }

    const result = await apiCall<{ data: User; token?: string }>(endpoint, {
      method,
      body: JSON.stringify({ ...formData, config: parsedConfig }),
    });

    setLoading(false);

    if (result.status === 401 || result.status === 403) {
      window.location.reload();
      return;
    }

    if (result.error) {
      setError(result.error);
      return;
    }

    if (!user && result.data?.token) {
      setCreatedToken(result.data.token);
    } else {
      onSuccess();
      onClose();
    }
  };

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(createdToken);
    setCopied(true);
  };

  const handleCloseAfterCreate = () => {
    onSuccess();
    onClose();
  };

  if (createdToken) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAfterCreate}
        title="User Created"
      >
        <p className="mb-2 text-sm text-gray-700">
          User created successfully. Please save this JWT token:
        </p>
        <div className="mb-4 flex items-start gap-2">
          <pre className="flex-1 overflow-auto rounded bg-gray-100 p-2 text-xs break-all">
            {createdToken}
          </pre>
          <button
            onClick={handleCopyToken}
            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <button
          onClick={handleCloseAfterCreate}
          className="w-full rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Close
        </button>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Edit User" : "New User"}
    >
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            CUIT <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.cuit}
            onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          <input
            type="text"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Config
          </label>
          <textarea
            rows={5}
            value={formData.config}
            onChange={(e) =>
              setFormData({ ...formData, config: e.target.value })
            }
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:border-gray-500 focus:outline-none"
            spellCheck={false}
          />
        </div>
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) =>
                setFormData({ ...formData, isAdmin: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            Is Admin
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading && <Spinner />}
            {user ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
