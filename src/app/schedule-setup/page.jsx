'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import OnboardingForm from '@/components/OnboardingForm';
import Navbar from '@/components/Navbar';

export default function ScheduleSetupPage() {
  const { status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/schedule-setup');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-gray-950 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden py-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-vivid-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Create Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo-400 to-vivid-teal-400">
                  AI Schedule
                </span>
              </h1>
              <p className="text-slate-gray-400">
                Tell us about your learning goals and we'll create a personalized schedule
              </p>
            </div>

            {/* Form Container */}
            <div className="bg-slate-gray-900/50 border border-slate-gray-800/50 rounded-2xl p-8 backdrop-blur">
              <OnboardingForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
