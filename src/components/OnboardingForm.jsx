'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import VibrantButton from './VibrantButton';
import { HiOutlineSparkles, HiOutlineAcademicCap, HiOutlineLightBulb, HiOutlineLightningBolt, HiOutlineClock } from 'react-icons/hi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PACE_OPTIONS = [
  { value: 'Slow', label: 'Slow', desc: 'Gentle pace with buffer time', icon: '🐢', color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400' },
  { value: 'Steady', label: 'Steady', desc: 'Balanced learning rhythm', icon: '🚶', color: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400' },
  { value: 'Sprint', label: 'Sprint', desc: 'Intensive and fast-paced', icon: '🚀', color: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400' },
];

const STEPS = [
  { title: 'Your Goal', subtitle: 'What do you want to achieve?', icon: HiOutlineAcademicCap },
  { title: 'Your Context', subtitle: 'Tell us about your background', icon: HiOutlineLightBulb },
  { title: 'Your Pace', subtitle: 'How fast do you want to go?', icon: HiOutlineLightningBolt },
  { title: 'Your Time', subtitle: 'When are you available?', icon: HiOutlineClock },
];

export default function OnboardingForm({ onScheduleGenerated }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    coreGoal: '',
    interests: '',
    pace: 'Steady',
    availability: [],
  });

  const [timeSlot, setTimeSlot] = useState({ day: 'Monday', start: '09:00', end: '10:00' });

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const addTimeSlot = () => {
    if (timeSlot.start >= timeSlot.end) {
      setError('End time must be after start time');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, { ...timeSlot }],
    }));
    setError('');
  };

  const removeTimeSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!formData.coreGoal.trim()) return 'Please enter your core goal';
        return null;
      case 1:
        return null; // Interests are optional
      case 2:
        if (!formData.pace) return 'Please select a pace';
        return null;
      case 3:
        if (formData.availability.length === 0) return 'Please add at least one time slot';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const StepIcon = STEPS[step].icon;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${i === step
                  ? 'bg-gradient-to-r from-electric-indigo-500 to-vivid-teal-500 text-white scale-110 shadow-lg shadow-electric-indigo-500/30'
                  : i < step
                  ? 'bg-vivid-teal-500/20 text-vivid-teal-400 border border-vivid-teal-500/30'
                  : 'bg-slate-gray-700/50 text-slate-gray-500 border border-slate-gray-600/30'
                }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-all duration-300
                  ${i < step ? 'bg-vivid-teal-500/50' : 'bg-slate-gray-700/50'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step card */}
      <div className="bg-slate-gray-800/60 backdrop-blur-sm border border-slate-gray-700/50 rounded-2xl p-8 animate-fade-in">
        {/* Step header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-electric-indigo-500/15 flex items-center justify-center">
            <StepIcon className="w-5 h-5 text-electric-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">{STEPS[step].title}</h2>
            <p className="text-sm text-slate-gray-400">{STEPS[step].subtitle}</p>
          </div>
        </div>

        {/* Step 0: Goal & Profile */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-gray-300 mb-2">Welcome, {session?.user?.name}!</label>
              <p className="text-sm text-slate-gray-400 mb-4">Let's create your personalized learning schedule.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-gray-300 mb-2">Core Goal</label>
              <input
                type="text"
                value={formData.coreGoal}
                onChange={(e) => updateForm('coreGoal', e.target.value)}
                placeholder="e.g. Learn Backend Development with Node.js"
                className="w-full px-4 py-3 rounded-xl bg-slate-gray-900/60 border border-slate-gray-600/50
                  text-white placeholder-slate-gray-500 focus:outline-none focus:border-electric-indigo-500/50
                  focus:ring-2 focus:ring-electric-indigo-500/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 1: Interests */}
        {step === 1 && (
          <div>
            <label className="block text-sm font-medium text-slate-gray-300 mb-2">
              Interests & Context <span className="text-slate-gray-500">(optional)</span>
            </label>
            <textarea
              value={formData.interests}
              onChange={(e) => updateForm('interests', e.target.value)}
              placeholder="e.g. I already know some CSS and HTML. I'm interested in Node.js, databases, and APIs..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-slate-gray-900/60 border border-slate-gray-600/50
                text-white placeholder-slate-gray-500 focus:outline-none focus:border-electric-indigo-500/50
                focus:ring-2 focus:ring-electric-indigo-500/20 transition-all resize-none"
            />
            <p className="mt-2 text-xs text-slate-gray-500">
              The more context you provide, the better the AI can tailor your schedule.
            </p>
          </div>
        )}

        {/* Step 2: Pace */}
        {step === 2 && (
          <div className="grid gap-3">
            {PACE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateForm('pace', option.value)}
                className={`flex items-center gap-4 w-full p-4 rounded-xl border transition-all duration-200
                  ${formData.pace === option.value
                    ? `bg-gradient-to-r ${option.color} scale-[1.02]`
                    : 'bg-slate-gray-900/40 border-slate-gray-600/30 hover:bg-slate-gray-800/60 text-slate-gray-300'
                  }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="text-left">
                  <p className="font-semibold text-sm">{option.label}</p>
                  <p className="text-xs opacity-70">{option.desc}</p>
                </div>
                {formData.pace === option.value && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-slate-gray-400 mb-1">Day</label>
                <select
                  value={timeSlot.day}
                  onChange={(e) => setTimeSlot((prev) => ({ ...prev, day: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-gray-900/60 border border-slate-gray-600/50
                    text-white text-sm focus:outline-none focus:border-electric-indigo-500/50 transition-all"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-slate-gray-400 mb-1">Start</label>
                <input
                  type="time"
                  value={timeSlot.start}
                  onChange={(e) => setTimeSlot((prev) => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-gray-900/60 border border-slate-gray-600/50
                    text-white text-sm focus:outline-none focus:border-electric-indigo-500/50 transition-all
                    [color-scheme:dark]"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-slate-gray-400 mb-1">End</label>
                <input
                  type="time"
                  value={timeSlot.end}
                  onChange={(e) => setTimeSlot((prev) => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-gray-900/60 border border-slate-gray-600/50
                    text-white text-sm focus:outline-none focus:border-electric-indigo-500/50 transition-all
                    [color-scheme:dark]"
                />
              </div>
              <VibrantButton onClick={addTimeSlot} size="sm" variant="secondary">
                + Add
              </VibrantButton>
            </div>

            {/* Added slots */}
            {formData.availability.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-medium text-slate-gray-400 uppercase tracking-wider">Added Time Slots</p>
                {formData.availability.map((slot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-vivid-teal-500/10 border border-vivid-teal-500/20 animate-slide-up"
                  >
                    <span className="text-sm text-vivid-teal-300">
                      <span className="font-semibold">{slot.day}</span> — {slot.start} to {slot.end}
                    </span>
                    <button
                      onClick={() => removeTimeSlot(i)}
                      className="text-slate-gray-400 hover:text-red-400 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-gray-700/50">
          {step > 0 ? (
            <VibrantButton onClick={prevStep} variant="ghost" size="sm">
              ← Back
            </VibrantButton>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <VibrantButton onClick={nextStep} variant="primary" size="md">
              Continue →
            </VibrantButton>
          ) : (
            <VibrantButton
              onClick={handleSubmit}
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              <HiOutlineSparkles className="w-5 h-5" />
              Generate My Schedule
            </VibrantButton>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-gray-800 border border-electric-indigo-500/30 rounded-2xl p-8 text-center max-w-sm mx-4 animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-electric-indigo-500 to-vivid-teal-500 flex items-center justify-center animate-pulse-soft">
              <HiOutlineSparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">
              AI is crafting your schedule...
            </h3>
            <p className="text-sm text-slate-gray-400">
              Analyzing your goals, pace, and availability to create the perfect plan.
            </p>
            <div className="mt-4 w-full h-1.5 bg-slate-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-electric-indigo-500 to-vivid-teal-500 rounded-full animate-shimmer bg-[length:200%_100%]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
