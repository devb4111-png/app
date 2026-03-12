'use client';

export default function ProgressBar({ completed = 0, total = 1, label = 'Progress' }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-gray-300">{label}</span>
        <span className="text-sm font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo-400 to-vivid-teal-400">
          {percentage}%
        </span>
      </div>

      <div className="relative w-full h-3 bg-slate-gray-700/50 rounded-full overflow-hidden">
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />

        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-electric-indigo-500 to-vivid-teal-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        >
          {/* Glow effect */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-vivid-teal-400 blur-sm opacity-80" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-slate-gray-500">
          {completed} of {total} tasks
        </span>
        {percentage === 100 && (
          <span className="text-xs font-medium text-vivid-teal-400 animate-pulse-soft">
            🎉 All done!
          </span>
        )}
      </div>
    </div>
  );
}
