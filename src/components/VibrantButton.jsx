'use client';

export default function VibrantButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: `bg-gradient-to-r from-electric-indigo-600 to-electric-indigo-500
      hover:from-electric-indigo-500 hover:to-electric-indigo-400
      text-white shadow-lg shadow-electric-indigo-500/25
      hover:shadow-electric-indigo-500/40 active:shadow-electric-indigo-500/20`,
    secondary: `bg-gradient-to-r from-vivid-teal-600 to-vivid-teal-500
      hover:from-vivid-teal-500 hover:to-vivid-teal-400
      text-white shadow-lg shadow-vivid-teal-500/25
      hover:shadow-vivid-teal-500/40 active:shadow-vivid-teal-500/20`,
    outline: `border-2 border-electric-indigo-500/40 text-electric-indigo-400
      hover:bg-electric-indigo-500/10 hover:border-electric-indigo-500/60`,
    ghost: `text-slate-gray-300 hover:text-white hover:bg-slate-gray-700/50`,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-300 ease-out transform
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962
              7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
