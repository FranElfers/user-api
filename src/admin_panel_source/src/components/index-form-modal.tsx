import { useState, useEffect } from "react";
import { Modal, Spinner } from "./ui";
import { apiCall } from "../api";
import type { Index } from "../types";

export function IndexFormModal({
  isOpen,
  onClose,
  index,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  index: Index | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    value: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (index) {
      setFormData({
        name: index.name,
        date: index.date,
        value: index.value.toString(),
      });
    } else {
      setFormData({
        name: "",
        date: new Date().toISOString().split("T")[0],
        value: "",
      });
    }
    setError("");
  }, [index, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name.trim()) {
      setError("Index name is required");
      setLoading(false);
      return;
    }

    if (!formData.date.trim()) {
      setError("Date is required");
      setLoading(false);
      return;
    }

    if (!formData.value.trim()) {
      setError("Value is required");
      setLoading(false);
      return;
    }

    const valueNum = parseFloat(formData.value);
    if (isNaN(valueNum)) {
      setError("Value must be a valid number");
      setLoading(false);
      return;
    }

    const endpoint = index
      ? `/api/admin/indexes/${index.name}/${index.date}`
      : "/api/admin/indexes";
    const method = index ? "PUT" : "POST";

    const body = index
      ? { value: valueNum }
      : {
          index: formData.name,
          date: formData.date,
          value: valueNum,
        };

    const result = await apiCall(endpoint, {
      method,
      body: JSON.stringify(body),
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

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={index ? "Edit Index" : "New Index"}
    >
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Index Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={!!index}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 focus:border-gray-500 focus:outline-none"
            placeholder="e.g., IPC, RIPTE"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            disabled={!!index}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 focus:border-gray-500 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Value <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            step="0.001"
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:bg-gray-400 hover:bg-gray-800"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner />
                <span>Saving...</span>
              </div>
            ) : index ? (
              "Update"
            ) : (
              "Create"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
