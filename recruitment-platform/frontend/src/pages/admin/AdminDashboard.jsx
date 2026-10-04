import React, { useState, useEffect } from 'react';
import { apiRequest } from "../../api/client";
import Toast from "../../components/Toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Societies tab
  const [societies, setSocieties] = useState([]);
  const emptyForm = { name: '', description: '', category: '', deadline: '', eligibility: '', contact_email: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSocieties = async () => {
    try {
      const list = await apiRequest('/societies');
      setSocieties(Array.isArray(list) ? list : []);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        deadline: new Date(form.deadline).toISOString(),
        contact_email: form.contact_email || null,
      };
      await apiRequest('/societies', { method: 'POST', body: JSON.stringify(body) });
      setToast({ message: 'Society created', type: 'success' });
      setForm(emptyForm);
      fetchSocieties();
      fetchAnalytics();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSociety = async (id, name) => {
    if (!window.confirm(`Remove "${name}"?`)) return;
    try {
      await apiRequest(`/societies/${id}`, { method: 'DELETE' });
      setToast({ message: 'Society removed', type: 'success' });
      fetchSocieties();
      fetchAnalytics();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApplications = async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const data = await apiRequest(`/admin/applications${query}`);
      setApplications(Array.isArray(data) ? data : (data?.items || []));
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
    Promise.all([fetchApplications(), fetchAnalytics(), fetchSocieties()]).finally(() => setLoading(false));
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
            onClick={() => setActiveTab('societies')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'societies' ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Societies
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
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{(analytics.active_societies ?? analytics.total_societies)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Total Applications</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{analytics.total_applications}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">Accepted Candidates</span>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">{analytics.accepted_applications || 0}</p>
          </div>
        </div>
      )}

      {activeTab === 'societies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleCreateSociety} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Add Society</h2>
            {[
              ['name', 'Name', 'text', true],
              ['category', 'Category (e.g. Technical, Cultural)', 'text', true],
              ['eligibility', 'Eligibility', 'text', true],
              ['contact_email', 'Contact email (optional)', 'email', false],
            ].map(([key, label, type, required]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  type={type}
                  required={required}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (min 10 characters)</label>
              <textarea
                required
                minLength={10}
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Application deadline</label>
              <input
                type="datetime-local"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Society'}
            </button>
          </form>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Current Societies ({societies.length})</h2>
            {societies.length === 0 ? (
              <p className="text-slate-500 text-sm">No societies yet. Add one using the form.</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {societies.map((soc) => (
                  <li key={soc.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-900">{soc.name}</div>
                      <div className="text-xs text-slate-500">
                        {soc.category} · deadline {new Date(soc.deadline).toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSociety(soc.id, soc.name)}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
                        <div className="font-medium text-slate-900">{app.student?.name}</div>
                        <div className="text-xs text-slate-500">{app.student?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{app.society?.name}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{app.answers?.why_join}</td>
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