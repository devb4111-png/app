'use client';

import { useState } from 'react';
import { HiOutlineSparkles, HiOutlineCalendar, HiOutlineChartBar, HiOutlineCog, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: HiOutlineChartBar },
  { label: 'Schedule', href: '/dashboard?view=schedule', icon: HiOutlineCalendar },
  { label: 'AI Generate', href: '/', icon: HiOutlineSparkles },
  { label: 'Settings', href: '#', icon: HiOutlineCog },
];

export default function Sidebar({ activeView = 'Dashboard' }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-electric-indigo-600 text-white p-2 rounded-xl shadow-lg hover:bg-electric-indigo-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <HiOutlineMenu className="w-5 h-5" /> : <HiOutlineX className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
          ${collapsed ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0 lg:static lg:z-auto
          w-64 bg-slate-gray-900 border-r border-slate-gray-700/50 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-indigo-500 to-vivid-teal-500 flex items-center justify-center shadow-lg">
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-display font-bold text-lg leading-tight">
                Schedule
              </h1>
              <p className="text-vivid-teal-400 text-xs font-medium tracking-wider uppercase">
                Architect
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.label === activeView;
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-electric-indigo-600/20 text-electric-indigo-400 shadow-sm border border-electric-indigo-500/20'
                    : 'text-slate-gray-400 hover:text-white hover:bg-slate-gray-800/60'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-electric-indigo-400' : ''}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-electric-indigo-400 animate-pulse-soft" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-electric-indigo-900/40 to-vivid-teal-900/30 border border-electric-indigo-500/10">
          <p className="text-xs text-slate-gray-300 mb-1">Powered by</p>
          <p className="text-sm font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo-400 to-vivid-teal-400">
            Google Gemini AI
          </p>
        </div>
      </aside>
    </>
  );
}
