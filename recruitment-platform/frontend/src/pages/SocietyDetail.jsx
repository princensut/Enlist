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

  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [statement, setStatement] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);

      try {
        const data = await apiRequest(`/societies/${id}`);
        setSociety(data);
      } catch (err) {
        setSociety(null);
        setToast({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!rollNumber.trim()) {
      setToast({
        message: 'Please enter your roll number.',
        type: 'error',
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(mobileNumber.trim())) {
      setToast({
        message: 'Please enter a valid 10-digit mobile number.',
        type: 'error',
      });
      return;
    }

    if (statement.trim().length < 10) {
      setToast({
        message: 'Statement must contain at least 10 characters.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest('/applications/apply', {
        method: 'POST',
        body: JSON.stringify({
          society_id: parseInt(id, 10),
          roll_number: rollNumber.trim(),
          email: email.trim(),
          mobile_number: mobileNumber.trim(),
          submission_text: statement.trim(),
        }),
      });

      setToast({
        message: 'Application submitted successfully!',
        type: 'success',
      });

      setTimeout(() => {
        navigate('/my-applications');
      }, 1500);

    } catch (err) {
      setToast({
        message: err.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500">
        Loading details...
      </div>
    );
  }

  if (!society) {
    return (
      <div className="text-center py-12 text-slate-500">
        Society not found.
      </div>
    );
  }

  const isExpired = new Date(society.deadline) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

      {/* Society Information */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">

        <div className="flex justify-between items-start mb-4">

          <div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {society.category}
            </span>

            <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
              {society.name}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">
              Recruitment Deadline
            </span>

            <span
              className={`text-sm font-bold ${
                isExpired ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {new Date(society.deadline).toLocaleString()}
            </span>
          </div>

        </div>

        <p className="text-slate-700 text-base leading-relaxed mb-6">
          {society.description}
        </p>

      </div>

      {/* Application Form */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">

        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Submit Application
        </h2>

        {isExpired ? (

          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm">
            Recruitment for this society has closed.
            Submissions are no longer accepted.
          </div>

        ) : (

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Roll Number */}
            <div>
              <label
                htmlFor="rollNumber"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Roll Number *
              </label>

              <input
                id="rollNumber"
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter your college roll number"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email Address *
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Mobile Number *
              </label>

              <input
                id="mobileNumber"
                type="tel"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setMobileNumber(value);
                }}
                placeholder="Enter your 10-digit mobile number"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Statement of Interest */}
            <div>
              <label
                htmlFor="statement"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Statement of Interest & Experience *
              </label>

              <textarea
                id="statement"
                required
                minLength={10}
                rows={5}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Explain why you want to join this society and describe any prior relevant experience..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />

              <p className="text-xs text-slate-500 mt-1">
                Minimum 10 characters required.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>

          </form>

        )}

      </div>

      {/* Notifications */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

    </div>
  );
}
