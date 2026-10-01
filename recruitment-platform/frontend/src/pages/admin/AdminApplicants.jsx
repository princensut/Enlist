import React, { useState, useEffect } from "react";
import { apiFetch } from "../../api/client";

export function AdminApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const loadApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status && { status }),
      });
      const data = await apiFetch(`/admin/applications?${query.toString()}`);
      setApplicants(data.items);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApplicants();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, status, page]);

  const updateStatus = async (appId, newStatus) => {
    try {
      await apiFetch(`/admin/applications/${appId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      loadApplicants();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Applicant Management</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search applicants or societies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Application Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

      {loading ? (
        <div className="text-center py-12">Loading applicants...</div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border text-gray-500">
          No applicants match the query criteria.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Society</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applicants.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold">{app.student?.name}</div>
                    <div className="text-sm text-gray-500">{app.student?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{app.society?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => updateStatus(app.id, "Accepted")}
                      disabled={app.status === "Accepted"}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "Rejected")}
                      disabled={app.status === "Rejected"}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}