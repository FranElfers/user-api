import { useState, useEffect, useCallback } from "react";
import { Spinner, ConfirmDialog, SortHeader, JsonViewerModal } from "./ui";
import { UserFormModal } from "./user-form-modal";
import { apiCall } from "../api";
import type { User, SortDirection } from "../types";

export function UsersSection({ onAuthError }: { onAuthError: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewingConfig, setViewingConfig] = useState<Record<
    string,
    unknown
  > | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await apiCall<User[]>("/api/admin/users");

    if (result.status === 401 || result.status === 403) {
      onAuthError();
      return;
    }

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setUsers(result.data);
    }
    setLoading(false);
  }, [onAuthError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    let comparison = 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === "boolean" && typeof bVal === "boolean") {
      comparison = aVal === bVal ? 0 : aVal ? -1 : 1;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    const result = await apiCall(`/api/admin/users/${deletingUser._id}`, {
      method: "DELETE",
    });

    if (result.status === 401 || result.status === 403) {
      onAuthError();
      return;
    }

    setDeleteLoading(false);
    if (!result.error) {
      setDeletingUser(null);
      fetchUsers();
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          New user
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <SortHeader
                  label="_id"
                  field="_id"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Name"
                  field="name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="CUIT"
                  field="cuit"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Email"
                  field="email"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Status"
                  field="status"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Admin"
                  field="isAdmin"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Config
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="border border-gray-200 px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {user._id}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {user.cuit}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {user.status}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {user.isAdmin ? "Yes" : "No"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <button
                        onClick={() => setViewingConfig(user.config)}
                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </button>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowForm(true);
                          }}
                          className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <UserFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        user={editingUser}
        onSuccess={fetchUsers}
      />

      <JsonViewerModal
        isOpen={!!viewingConfig}
        onClose={() => setViewingConfig(null)}
        data={viewingConfig || {}}
      />

      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete user "${deletingUser?.name}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}
