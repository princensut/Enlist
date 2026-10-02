import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-indigo-400">
            <span>CampusRecruit</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
              Societies
            </Link>

            {user ? (
              <>
                {user.role === 'STUDENT' && (
                  <Link to="/my-applications" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
                    My Applications
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-medium">
                    Admin Panel
                  </Link>
                )}

                <span className="text-slate-400 text-sm hidden md:inline">
                  {user.full_name} ({user.role})
                </span>

                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-red-400 text-sm font-medium border border-slate-700 px-3 py-1.5 rounded-md hover:border-red-400 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}