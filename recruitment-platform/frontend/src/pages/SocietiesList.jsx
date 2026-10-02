import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function SocietiesList() {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchSocieties = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (category) query.append('category', category);

      const data = await apiRequest(`/societies?${query.toString()}`);
      setSocieties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSocieties();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Societies</h1>
          <p className="text-slate-600 mt-1">Explore active student organizations and submit your recruitment application.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search societies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Literary">Literary</option>
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
          >
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading societies...</div>
      ) : societies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
          No societies found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {societies.map((society) => {
            const isExpired = new Date(society.deadline) < new Date();
            return (
              <div key={society.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {society.category}
                    </span>
                    <span className={`text-xs font-medium ${isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isExpired ? 'Closed' : 'Active'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{society.name}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4">{society.description}</p>
                </div>

                <div>
                  <div className="border-t border-slate-100 pt-3 mt-2 flex justify-between text-xs text-slate-500">
                    <span>Deadline:</span>
                    <span className="font-medium text-slate-700">
                      {new Date(society.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/society/${society.id}`}
                    className="mt-4 w-full block text-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md text-sm transition"
                  >
                    View Details & Apply
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}