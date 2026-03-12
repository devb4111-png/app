'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiOutlineSparkles } from 'react-icons/hi';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <nav className="bg-slate-gray-950/80 backdrop-blur-md border-b border-slate-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-indigo-500 to-vivid-teal-500 flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline font-display font-bold text-white text-lg">
              AI Schedule Architect
            </span>
            <span className="sm:hidden font-display font-bold text-white">Architect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {session ? (
              <>
                <Link href="/dashboard" className="text-slate-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/schedule-setup" className="text-slate-gray-300 hover:text-white transition">
                  New Schedule
                </Link>
                <div className="flex items-center gap-4 pl-4 border-l border-slate-gray-700">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{session.user?.name}</p>
                    <p className="text-xs text-slate-gray-400">{session.user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition text-sm font-medium border border-red-500/20"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-gray-300 hover:text-white transition">
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-electric-indigo-600 to-electric-indigo-500 text-white hover:from-electric-indigo-700 hover:to-electric-indigo-600 transition text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-gray-800 text-slate-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? (
              <AiOutlineClose className="w-6 h-6" />
            ) : (
              <AiOutlineMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-gray-800/50 py-4 space-y-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 rounded-lg text-slate-gray-300 hover:bg-slate-gray-800 hover:text-white transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/schedule-setup"
                  className="block px-4 py-2 rounded-lg text-slate-gray-300 hover:bg-slate-gray-800 hover:text-white transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  New Schedule
                </Link>
                <div className="px-4 py-2 border-t border-slate-gray-800">
                  <p className="text-sm font-medium text-white mb-2">{session.user?.name}</p>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition text-sm font-medium border border-red-500/20"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 rounded-lg text-slate-gray-300 hover:bg-slate-gray-800 hover:text-white transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 rounded-lg bg-gradient-to-r from-electric-indigo-600 to-electric-indigo-500 text-white hover:from-electric-indigo-700 hover:to-electric-indigo-600 transition text-sm font-medium text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
