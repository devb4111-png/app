import { HiOutlineSparkles } from 'react-icons/hi';
import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Login - AI Schedule Architect',
  description: 'Log in to your AI Schedule Architect account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HiOutlineSparkles className="text-3xl text-electric-indigo-400" />
            <h1 className="text-3xl font-bold text-white">AI Schedule Architect</h1>
          </div>
          <p className="text-gray-400">Welcome back! Log in to your account.</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 backdrop-blur-sm">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Secured with NextAuth.js and bcrypt password hashing
        </p>
      </div>
    </div>
  );
}
