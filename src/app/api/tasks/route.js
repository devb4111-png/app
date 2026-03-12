import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Task from '@/lib/models/Task';

const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email }).select(
            '+password'
          );
          if (!user) throw new Error('No user found');
          const isPasswordValid = await user.comparePassword(
            credentials.password
          );
          if (!isPasswordValid) throw new Error('Invalid password');
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};

/**
 * GET /api/tasks - Fetch all tasks for the logged-in user
 * Optional query params: scheduleId, status, priority
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    await connectDB();

    // Build query
    const query = { userId: session.user.id };
    if (scheduleId) query.scheduleId = scheduleId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query).sort({ currentDate: 1, priority: -1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
