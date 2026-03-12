import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'AI Schedule Architect | Smart Learning Planner',
  description: 'An AI-powered schedule generator that creates personalized learning plans based on your goals, pace, and availability. Built with Google Gemini AI.',
  keywords: ['AI', 'schedule', 'learning', 'planner', 'Gemini', 'productivity'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-gray-950 text-slate-gray-100 font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
