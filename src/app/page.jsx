'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiOutlineSparkles, HiOutlineChartBar, HiOutlineShieldCheck, HiOutlineArrowRight } from 'react-icons/hi';

const features = [
  {
    icon: HiOutlineSparkles,
    title: 'AI-Powered Planning',
    desc: 'Google Gemini crafts a schedule tailored to your learning style and goals.',
    color: 'from-electric-indigo-500/20 to-electric-indigo-600/10 border-electric-indigo-500/20',
    iconColor: 'text-electric-indigo-400',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Progress Tracking',
    desc: 'Visual dashboard to monitor completions, deadlines, and your growth.',
    color: 'from-vivid-teal-500/20 to-vivid-teal-600/10 border-vivid-teal-500/20',
    iconColor: 'text-vivid-teal-400',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Goal Commitment',
    desc: 'Smart limits on postponements keep you accountable and on track.',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
    iconColor: 'text-amber-400',
  },
];

const stats = [
  { label: 'Users', value: '500+' },
  { label: 'Schedules Generated', value: '2000+' },
  { label: 'Tasks Completed', value: '50k+' },
  { label: 'Avg Productivity Gain', value: '35%' },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-slate-gray-950 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-vivid-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <div className="text-center pt-16 pb-20 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-indigo-500/10 border border-electric-indigo-500/20 text-electric-indigo-400 text-sm font-medium mb-6 animate-fade-in">
              <HiOutlineSparkles className="w-4 h-4" />
              Powered by Google Gemini AI
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white mb-4 animate-slide-up">
              AI Schedule{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo-400 via-purple-400 to-vivid-teal-400">
                Architect
              </span>
            </h1>

            <p className="text-lg text-slate-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up">
              Transform your goals into a personalized learning schedule. Our AI analyzes your pace, 
              availability, and learning style to create the perfect roadmap for success.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
              <Link
                href="/signup"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-electric-indigo-600 to-electric-indigo-500 text-white hover:from-electric-indigo-700 hover:to-electric-indigo-600 transition font-medium flex items-center gap-2"
              >
                Get Started Free
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 rounded-lg border border-slate-gray-700 text-white hover:bg-slate-gray-800 transition font-medium"
              >
                Already have an account? Log In
              </Link>
            </div>

            {/* Feature cards */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className={`p-6 rounded-2xl border bg-gradient-to-br ${feature.color} text-left
                      hover:scale-[1.02] transition-transform duration-300 animate-fade-in`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Icon className={`w-8 h-8 ${feature.iconColor} mb-3`} />
                    <h3 className="text-sm font-display font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Section */}
          <div className="py-16 px-4 bg-slate-gray-900/50 border-y border-slate-gray-800/50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-center text-2xl font-display font-bold text-white mb-12">
                Trusted by Learners Worldwide
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo-400 to-vivid-teal-400 mb-2">
                      {stat.value}
                    </div>
                    <p className="text-slate-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="py-16 px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-center text-2xl md:text-3xl font-display font-bold text-white mb-12">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: '01',
                    title: 'Create Your Profile',
                    desc: 'Sign up and tell us about your learning goals, pace preference, and available time.',
                  },
                  {
                    step: '02',
                    title: 'AI Generates Schedule',
                    desc: 'Our Gemini AI creates a personalized, realistic schedule broken into actionable tasks.',
                  },
                  {
                    step: '03',
                    title: 'Track & Manage',
                    desc: 'Follow your schedule, track progress, and adjust as needed with our intuitive dashboard.',
                  },
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl font-display font-bold text-electric-indigo-400/30">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-slate-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="p-12 rounded-2xl bg-gradient-to-r from-electric-indigo-500/10 to-vivid-teal-500/10 border border-electric-indigo-500/20">
                <h2 className="text-3xl font-display font-bold text-white mb-4">
                  Ready to transform your learning?
                </h2>
                <p className="text-lg text-slate-gray-400 mb-8">
                  Join thousands of learners using AI to create the perfect study schedule.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-electric-indigo-600 to-electric-indigo-500 text-white hover:from-electric-indigo-700 hover:to-electric-indigo-600 transition font-medium"
                >
                  Start for Free
                  <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
