import { useState, useEffect, useCallback } from "react";
import { Spinner, ConfirmDialog, JsonViewerModal, SortHeader } from "./ui";
import { apiCall } from "../api";
import type { SyncRecord, SortDirection } from "../types";

export function SyncRecordsSection({
  onAuthError,
}: {
  onAuthError: () => void;
}) {
  const [records, setRecords] = useState<SyncRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<keyof SyncRecord | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterTable, setFilterTable] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [viewingData, setViewingData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<SyncRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await apiCall<SyncRecord[]>("/api/admin/sync-records");

    if (result.status === 401 || result.status === 403) {
      onAuthError();
      return;
    }

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setRecords(result.data);
    }
    setLoading(false);
  }, [onAuthError]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSort = (field: keyof SyncRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredRecords = records.filter((record) => {
    if (
      filterTable &&
      !record.table.toLowerCase().includes(filterTable.toLowerCase())
    ) {
      return false;
    }
    if (
      filterUserId &&
      !record.userId.toLowerCase().includes(filterUserId.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    let comparison = 0;
    if (typeof aVal === "number" && typeof bVal === "number") {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatISODate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);
    const result = await apiCall(
      `/api/admin/sync-records/${deletingRecord.id}`,
      {
        method: "DELETE",
      },
    );

    if (result.status === 401 || result.status === 403) {
      onAuthError();
      return;
    }

    setDeleteLoading(false);
    if (!result.error) {
      setDeletingRecord(null);
      fetchRecords();
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Sync Records</h2>

      <div className="mb-4 flex gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Filter by Table
          </label>
          <input
            type="text"
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            placeholder="Table name..."
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Filter by User ID
          </label>
          <input
            type="text"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            placeholder="User ID..."
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
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
                  label="Table"
                  field="table"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Client ID"
                  field="clientId"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Device ID"
                  field="deviceId"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="User ID"
                  field="userId"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Updated At"
                  field="updatedAt"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Server Received At"
                  field="serverReceivedAt"
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
              {sortedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border border-gray-200 px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No sync records found
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.table}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.clientId}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.deviceId}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.userId}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {formatDate(record.updatedAt)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {formatISODate(record.serverReceivedAt)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingData(record.data)}
                          className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View data
                        </button>
                        <button
                          onClick={() => setDeletingRecord(record)}
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

      <JsonViewerModal
        isOpen={!!viewingData}
        onClose={() => setViewingData(null)}
        data={viewingData || {}}
      />

      <ConfirmDialog
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this sync record?"
        loading={deleteLoading}
      />
    </div>
  );
}
