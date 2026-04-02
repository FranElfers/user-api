import { useState, useEffect, useCallback } from "react";
import { Spinner, ConfirmDialog, SortHeader } from "./ui";
import { IndexFormModal } from "./index-form-modal";
import { apiCall } from "../api";
import type { Index, IndexRaw, SortDirection } from "../types";

export function IndexesSection({ onAuthError }: { onAuthError: () => void }) {
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<keyof Index | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<Index | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<Index | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchIndexes = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await apiCall<IndexRaw[]>("/api/index/all");

    if (result.status === 401 || result.status === 403) {
      onAuthError();
      return;
    }

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      const list: Index[] = [];
      for (const index of result.data) {
        const variations = index.variations.map((v) => ({
          name: index.name,
          ...v,
        }));
        list.push(...variations);
      }

      setIndexes(list);
    }
    setLoading(false);
  }, [onAuthError]);

  useEffect(() => {
    fetchIndexes();
  }, [fetchIndexes]);

  const handleSort = (field: keyof Index) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedIndexes = [...indexes].sort((a, b) => {
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
    if (!deletingIndex) return;
    setDeleteLoading(true);

    const result = await apiCall(
      `/api/admin/indexes/${deletingIndex.name}/${deletingIndex.date}`,
      { method: "DELETE" },
    );

    setDeleteLoading(false);

    if (result.status === 401 || result.status === 403) {
      window.location.reload();
      return;
    }

    if (result.error) {
      setError(result.error);
    } else {
      setError("");
      fetchIndexes();
    }

    setDeletingIndex(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Indexes</h2>
        <button
          onClick={() => {
            setEditingIndex(null);
            setShowForm(true);
          }}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          New index
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
                  label="Name"
                  field="name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Date"
                  field="date"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Value"
                  field="value"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedIndexes.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border border-gray-200 px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No indexes found
                  </td>
                </tr>
              ) : (
                sortedIndexes.map((index) => (
                  <tr
                    key={index.date + index.name}
                    className="hover:bg-gray-50"
                  >
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {index.name}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {index.date}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {index.value}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingIndex(index);
                            setShowForm(true);
                          }}
                          className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingIndex(index)}
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

      <IndexFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        index={editingIndex}
        onSuccess={fetchIndexes}
      />

      <ConfirmDialog
        isOpen={!!deletingIndex}
        onClose={() => setDeletingIndex(null)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete index "${deletingIndex?.name}" for ${deletingIndex?.date}?`}
        loading={deleteLoading}
      />
    </div>
  );
}
