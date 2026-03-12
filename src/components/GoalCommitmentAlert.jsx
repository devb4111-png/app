'use client';

import { HiOutlineExclamationTriangle, HiOutlineXMark } from 'react-icons/hi2';

export default function GoalCommitmentAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Alert card */}
      <div className="relative w-full max-w-md bg-slate-gray-800 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden animate-slide-up">
        {/* Red gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-bold text-white mb-1">
                🎯 Goal Commitment Alert
              </h3>
              <p className="text-sm text-slate-gray-300 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-lg text-slate-gray-400 hover:text-white hover:bg-slate-gray-700/50 transition-colors"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Action button */}
          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-orange-600
                text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40
                hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              I&apos;ll Stay Committed!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
