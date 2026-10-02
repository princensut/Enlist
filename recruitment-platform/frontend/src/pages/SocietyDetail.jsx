import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function SocietyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statement, setStatement] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await apiRequest(`/societies/${id}`);
        setSociety(data);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/applications/apply', {
        method: 'POST',
        body: JSON.stringify({
          society_id: parseInt(id, 10),
          submission_text: statement,
        }),
      });
      setToast({ message: 'Application submitted successfully!', type: 'success' });
      setTimeout(() => navigate('/my-applications'), 1500);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Loading details...</div>;
  if (!society) return <div className="text-center py-12 text-slate-500">Society not found.</div>;

  const isExpired = new Date(society.deadline) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {society.category}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">{society.name}</h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Recruitment Deadline</span>
            <span className={`text-sm font-bold ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
              {new Date(society.deadline).toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-slate-700 text-base leading-relaxed mb-6">{society.description}</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Submit Application</h2>

        {isExpired ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm">
            Recruitment for this society has closed. Submissions are no longer accepted.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Statement of Interest & Experience
              </label>
              <textarea
                required
                rows={5}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Explain why you want to join and any prior relevant experience..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-md text-sm transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}