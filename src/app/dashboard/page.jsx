'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import ProgressBar from '@/components/ProgressBar';
import {
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineSparkles,
} from 'react-icons/hi';

const tabs = [
  { id: 'overview', label: 'Overview', icon: HiOutlineSparkles },
  { id: 'schedules', label: 'Schedules', icon: HiOutlineCheckCircle },
  { id: 'progress', label: 'Progress', icon: HiOutlineChartBar },
  { id: 'settings', label: 'Settings', icon: HiOutlineCog },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/dashboard');
    }
  }, [status, router]);

  // Fetch schedules
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSchedules();
    }
  }, [status]);

  async function fetchSchedules() {
    try {
      const response = await fetch('/api/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
        if (data.length > 0) {
          setSelectedSchedule(data[0]._id);
          fetchTasksForSchedule(data[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasksForSchedule(scheduleId) {
    try {
      const response = await fetch(`/api/tasks?scheduleId=${scheduleId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }

  const handleScheduleSelect = (scheduleId) => {
    setSelectedSchedule(scheduleId);
    fetchTasksForSchedule(scheduleId);
  };

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

  // Get selected schedule details
  const selected = schedules.find((s) => s._id === selectedSchedule);

  // Calculate stats for selected schedule
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Overall stats across all schedules
  const allTasks = schedules.flatMap((s) => s.tasks || []);
  const totalAllTasks = allTasks.length;
  const completedAllTasks = allTasks.filter(
    (t) => t.status === 'completed'
  ).length;
  const overallCompletionRate =
    totalAllTasks > 0
      ? Math.round((completedAllTasks / totalAllTasks) * 100)
      : 0;

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
        </div>

        <div className="relative z-10 py-8">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Welcome, {session?.user?.name || 'Learner'}!
              </h1>
              <p className="text-slate-gray-400">
                Manage your learning schedules and track progress
              </p>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-8 border-b border-slate-gray-800">
              <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-4 md:pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                        isActive
                          ? 'bg-electric-indigo-500/20 text-electric-indigo-400 border border-electric-indigo-500/30'
                          : 'text-slate-gray-400 hover:text-slate-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div>
                    <h2 className="text-lg font-display font-bold text-white mb-4">
                      Overall Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-electric-indigo-500/20 to-electric-indigo-600/10 border border-electric-indigo-500/20 rounded-xl p-6">
                        <p className="text-slate-gray-400 text-sm font-medium mb-2">
                          Active Schedules
                        </p>
                        <p className="text-3xl font-bold text-electric-indigo-400">
                          {schedules.filter((s) => s.status === 'active').length}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-vivid-teal-500/20 to-vivid-teal-600/10 border border-vivid-teal-500/20 rounded-xl p-6">
                        <p className="text-slate-gray-400 text-sm font-medium mb-2">
                          Total Tasks
                        </p>
                        <p className="text-3xl font-bold text-vivid-teal-400">
                          {totalAllTasks}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-xl p-6">
                        <p className="text-slate-gray-400 text-sm font-medium mb-2">
                          Completed
                        </p>
                        <p className="text-3xl font-bold text-amber-400">
                          {completedAllTasks}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                        <p className="text-slate-gray-400 text-sm font-medium mb-2">
                          Completion Rate
                        </p>
                        <p className="text-3xl font-bold text-purple-400">
                          {overallCompletionRate}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selected Schedule Details */}
                  {selected && (
                    <div className="bg-slate-gray-900/50 border border-slate-gray-800/50 rounded-xl p-6">
                      <h2 className="text-xl font-display font-bold text-white mb-4">
                        Current Schedule: {selected.name}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-sm text-slate-gray-400 mb-2">
                            Goal
                          </p>
                          <p className="text-white font-medium">
                            {selected.coreGoal}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-gray-400 mb-2">
                            Pace
                          </p>
                          <p className="text-white font-medium">
                            {selected.pace}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-gray-400 text-sm">
                              Schedule Progress
                            </p>
                            <p className="text-sm font-medium text-white">
                              {completedTasks} of {totalTasks}
                            </p>
                          </div>
                          <ProgressBar progress={completionRate} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Tasks */}
                  {tasks.length > 0 && (
                    <div className="bg-slate-gray-900/50 border border-slate-gray-800/50 rounded-xl p-6">
                      <h2 className="text-xl font-display font-bold text-white mb-4">
                        Upcoming Tasks
                      </h2>
                      <div className="space-y-3">
                        {tasks
                          .sort(
                            (a, b) =>
                              new Date(a.currentDate) -
                              new Date(b.currentDate)
                          )
                          .slice(0, 3)
                          .map((task) => (
                            <TaskCard key={task._id} task={task} />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Schedules Tab */}
              {activeTab === 'schedules' && (
                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-slate-gray-400">Loading schedules...</p>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="bg-slate-gray-900/50 border border-slate-gray-800/50 rounded-xl p-12 text-center">
                      <p className="text-slate-gray-400 mb-4">
                        No schedules yet. Create your first AI schedule!
                      </p>
                      <a
                        href="/schedule-setup"
                        className="inline-block px-6 py-2 rounded-lg bg-gradient-to-r from-electric-indigo-600 to-electric-indigo-500 text-white hover:from-electric-indigo-700 hover:to-electric-indigo-600 transition font-medium"
                      >
                        Generate Schedule
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {schedules.map((schedule) => {
                        const scheduleTaskCount = schedule.tasks?.length || 0;
                        const completedCount =
                          schedule.tasks?.filter(
                            (t) => t.status === 'completed'
                          ).length || 0;
                        const progress =
                          scheduleTaskCount > 0
                            ? Math.round(
                                (completedCount / scheduleTaskCount) * 100
                              )
                            : 0;

                        return (
                          <div
                            key={schedule._id}
                            onClick={() => handleScheduleSelect(schedule._id)}
                            className={`p-6 rounded-xl border transition cursor-pointer ${
                              selectedSchedule === schedule._id
                                ? 'bg-electric-indigo-500/20 border-electric-indigo-500/30'
                                : 'bg-slate-gray-900/50 border-slate-gray-800/50 hover:border-slate-gray-700'
                            }`}
                          >
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {schedule.name}
                            </h3>
                            <p className="text-sm text-slate-gray-400 mb-4">
                              {schedule.coreGoal}
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-gray-400">
                                  Progress
                                </span>
                                <span className="text-white font-medium">
                                  {progress}%
                                </span>
                              </div>
                              <ProgressBar progress={progress} />
                              <div className="text-xs text-slate-gray-500 pt-2">
                                {completedCount} of {scheduleTaskCount} tasks
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tasks for Selected Schedule */}
                  {selected && tasks.length > 0 && (
                    <div className="bg-slate-gray-900/50 border border-slate-gray-800/50 rounded-xl p-6">
                      <h2 className="text-xl font-display font-bold text-white mb-4">
                        Tasks for {selected.name}
                      </h2>
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <TaskCard key={task._id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  <div className="bg-slate-gray-900/50 border border-slate-gray-800/50 rounded-xl p-6">
                    <h2 className="text-xl font-display font-bold text-white mb-6">
                      Progress Analytics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Overall Completion Progress */}
                      <div>
                        <h3 className="text-sm font-medium text-slate-gray-400 mb-4">
                          Overall Completion
                        </h3>
                        <div className="flex items-center justify-center">
                          <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-slate-gray-800"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={`${(overallCompletionRate / 100) * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
                                className="text-electric-indigo-400 transition-all duration-500"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">
                                {overallCompletionRate}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-gray-800/50">
                          <span className="text-slate-gray-400">
                            Total Tasks
                          </span>
                          <span className="text-2xl font-bold text-white">
                            {totalAllTasks}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-gray-800/50">
                          <span className="text-slate-gray-400">
                            Completed
                          </span>
                          <span className="text-2xl font-bold text-vivid-teal-400">
                            {completedAllTasks}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-gray-800/50">
                          <span className="text-slate-gray-400">
                            Active Schedules
                          </span>
                          <span className="text-2xl font-bold text-amber-400">
                            {
                              schedules.filter((s) => s.status === 'active')
                                .length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="bg-slate-gray-900/50 border border-slate-gray-800/50 rounded-xl p-6">
                  <h2 className="text-xl font-display font-bold text-white mb-6">
                    Settings
                  </h2>

                  <div className="space-y-6">
                    {/* User Info */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-gray-400 mb-3">
                        Account Information
                      </h3>
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-slate-gray-800/50">
                          <p className="text-xs text-slate-gray-500 mb-1">
                            Name
                          </p>
                          <p className="text-white font-medium">
                            {session?.user?.name}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-gray-800/50">
                          <p className="text-xs text-slate-gray-500 mb-1">
                            Email
                          </p>
                          <p className="text-white font-medium">
                            {session?.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-gray-400 mb-3">
                        Actions
                      </h3>
                      <button
                        onClick={() => router.push('/schedule-setup')}
                        className="w-full px-4 py-3 rounded-lg border border-slate-gray-700 text-white hover:bg-slate-gray-800 transition font-medium text-left"
                      >
                        Create New Schedule
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
