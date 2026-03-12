import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Schedule from '@/lib/models/Schedule';

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
 * GET /api/schedules - Fetch all schedules for the logged-in user
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

    await connectDB();

    const schedules = await Schedule.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .populate('tasks');

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedules - Create a new schedule (for non-AI generated schedules)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, coreGoal, interests, pace, availability } = body;

    if (!coreGoal || !pace) {
      return NextResponse.json(
        { error: 'Missing required fields: coreGoal and pace' },
        { status: 400 }
      );
    }

    await connectDB();

    const schedule = new Schedule({
      userId: session.user.id,
      name: name || 'My Learning Schedule',
      coreGoal,
      interests: interests || '',
      pace,
      availability: availability || [],
      status: 'active',
    });

    const savedSchedule = await schedule.save();

    // Add to user's schedules array
    await User.findByIdAndUpdate(session.user.id, {
      $push: { schedules: savedSchedule._id },
    });

    return NextResponse.json(savedSchedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create schedule' },
      { status: 500 }
    );
  }
}
