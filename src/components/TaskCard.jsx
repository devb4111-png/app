'use client';

import { useState } from 'react';
import { HiOutlineClock, HiOutlineCalendar, HiOutlineArrowRight, HiOutlineCheck, HiOutlineExclamationCircle } from 'react-icons/hi';

const priorityConfig = {
  high: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/20',
    dot: 'bg-red-400',
    label: 'High',
  },
  medium: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Medium',
  },
  low: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Low',
  },
};

const statusConfig = {
  pending: { bg: 'border-slate-gray-600/50', text: 'Pending' },
  'in-progress': { bg: 'border-electric-indigo-500/50', text: 'In Progress' },
  completed: { bg: 'border-vivid-teal-500/50', text: 'Completed' },
};

export default function TaskCard({ task, onPostpone, onStatusChange, onAlert }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.pending;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePostpone = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'postpone' }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.type === 'GOAL_COMMITMENT') {
          onAlert?.(data.error);
        }
        return;
      }

      onPostpone?.(data.task);
    } catch (err) {
      console.error('Postpone error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        onStatusChange?.(data.task);
      }
    } catch (err) {
      console.error('Status change error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isCompleted = task.status === 'completed';
  const isPostponed = task.postponeCount > 0;

  return (
    <div
      className={`group relative rounded-2xl border ${status.bg} bg-slate-gray-800/60 backdrop-blur-sm
      hover:bg-slate-gray-800/80 transition-all duration-300 overflow-hidden
      ${isCompleted ? 'opacity-70' : ''} animate-fade-in`}
    >
      {/* Subtle gradient accent at top */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r
          ${task.priority === 'high' ? 'from-red-500 via-orange-500 to-amber-500' :
            task.priority === 'medium' ? 'from-amber-500 via-yellow-500 to-amber-400' :
            'from-emerald-500 via-teal-500 to-cyan-500'}`}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-display font-semibold text-base leading-snug
                ${isCompleted ? 'line-through text-slate-gray-500' : 'text-white'}`}
            >
              {task.title}
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${priority.badge} shrink-0`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
        </div>

        {/* Description (expandable) */}
        {task.description && (
          <p
            className={`text-sm text-slate-gray-400 mb-4 cursor-pointer transition-all duration-200
              ${isExpanded ? '' : 'line-clamp-2'}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {task.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-gray-400 mb-4">
          <span className="inline-flex items-center gap-1.5">
            <HiOutlineClock className="w-3.5 h-3.5" />
            {task.estimatedMinutes} min
          </span>

          <span className="inline-flex items-center gap-1.5">
            <HiOutlineCalendar className="w-3.5 h-3.5" />
            {formatDate(task.currentDate)}
          </span>

          {isPostponed && (
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <HiOutlineExclamationCircle className="w-3.5 h-3.5" />
              Postponed {task.postponeCount}/3
            </span>
          )}
        </div>

        {/* Action buttons */}
        {!isCompleted && (
          <div className="flex items-center gap-2">
            {task.status === 'pending' && (
              <button
                onClick={() => handleStatusChange('in-progress')}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
                  bg-electric-indigo-600/20 text-electric-indigo-400 border border-electric-indigo-500/20
                  hover:bg-electric-indigo-600/30 transition-all duration-200 disabled:opacity-50"
              >
                <HiOutlineArrowRight className="w-3.5 h-3.5" />
                Start
              </button>
            )}

            {task.status === 'in-progress' && (
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
                  bg-vivid-teal-600/20 text-vivid-teal-400 border border-vivid-teal-500/20
                  hover:bg-vivid-teal-600/30 transition-all duration-200 disabled:opacity-50"
              >
                <HiOutlineCheck className="w-3.5 h-3.5" />
                Complete
              </button>
            )}

            <button
              onClick={handlePostpone}
              disabled={isLoading || task.postponeCount >= 3}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
                bg-slate-gray-700/50 text-slate-gray-300 border border-slate-gray-600/30
                hover:bg-slate-gray-700/80 transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Postpone
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2 text-vivid-teal-400 text-xs font-medium">
            <HiOutlineCheck className="w-4 h-4" />
            Completed
          </div>
        )}
      </div>
    </div>
  );
}
