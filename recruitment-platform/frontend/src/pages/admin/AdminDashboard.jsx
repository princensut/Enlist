import React, { useState, useEffect } from 'react';
import { apiRequest } from "../../api/client";
import Toast from "../../components/Toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApplications = async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const data = await apiRequest(`/admin/applications${query}`);
      setApplications(data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest('/admin/analytics');
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchApplications(), fetchAnalytics()]).finally(() => setLoading(false));
  }, [statusFilter]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await apiRequest(`/admin/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
      fetchApplications();
      fetchAnalytics();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Management Panel</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'applications' ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Applicant Tracking
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Total Societies</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{analytics.total_societies}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Total Applications</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{analytics.total_applications}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Accepted Candidates</span>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">{analytics.status_counts?.Accepted || 0}</p>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Submitted Applications</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Applicant</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Society</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Statement</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{app.applicant_name}</div>
                        <div className="text-xs text-slate-500">{app.applicant_email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{app.society_name}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{app.submission_text}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'Accepted')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-xs"
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
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}