'use client';

import Link from 'next/link';
import { HiOutlineSparkles, HiOutlinePhone, HiOutlineGlobe } from 'react-icons/hi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-gray-950 border-t border-slate-gray-800/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-indigo-500 to-vivid-teal-500 flex items-center justify-center">
                <HiOutlineSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-white">Schedule Architect</span>
            </div>
            <p className="text-sm text-slate-gray-400">
              AI-powered learning schedule generator using Google Gemini.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/schedule-setup" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                  Generate Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                  AI Planning
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                  Progress Tracking
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                  Task Management
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                  Goal Commitment
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@example.com"
                  className="flex items-center gap-2 text-sm text-slate-gray-400 hover:text-slate-gray-300 transition"
                >
                  <HiOutlinePhone className="w-4 h-4" />
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-slate-gray-400 hover:text-slate-gray-300 transition"
                >
                  <HiOutlineGlobe className="w-4 h-4" />
                  Website
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-gray-800/50 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-gray-500">
              © {currentYear} AI Schedule Architect. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-slate-gray-400 hover:text-slate-gray-300 transition">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
