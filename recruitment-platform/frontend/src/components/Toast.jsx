import React from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-indigo-600 text-white',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center shadow-lg rounded-lg overflow-hidden animate-slide-up">
      <div className={`px-4 py-3 text-sm font-medium flex items-center space-x-3 ${bgColors[type]}`}>
        <span>{message}</span>
        <button onClick={onClose} className="ml-3 font-bold opacity-75 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  );
}