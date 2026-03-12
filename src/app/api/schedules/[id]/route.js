import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Schedule from '@/lib/models/Schedule';
import Task from '@/lib/models/Task';
import {
  updateScheduleStatus,
  getScheduleWithTasks,
  getScheduleStats,
} from '@/lib/controllers/scheduleController';

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
 * GET /api/schedules/[id] - Fetch a specific schedule with its tasks
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectDB();

    const schedule = await getScheduleWithTasks(id, session.user.id);
    const stats = await getScheduleStats(id, session.user.id);

    return NextResponse.json(
      {
        schedule,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch schedule' },
      { status: error.message.includes('not found') ? 404 : 500 }
    );
  }
}

/**
 * PATCH /api/schedules/[id] - Update a schedule
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, status, targetEndDate } = body;

    await connectDB();

    // Verify schedule belongs to user
    const schedule = await Schedule.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (name !== undefined) schedule.name = name;
    if (status !== undefined) schedule.status = status;
    if (targetEndDate !== undefined) schedule.targetEndDate = targetEndDate;

    const updatedSchedule = await schedule.save();

    return NextResponse.json(updatedSchedule, { status: 200 });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedules/[id] - Delete a schedule and its tasks
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectDB();

    // Verify schedule belongs to user
    const schedule = await Schedule.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Delete schedule and its tasks
    await Task.deleteMany({ scheduleId: id });
    await Schedule.findByIdAndDelete(id);

    // Remove from user's schedules array
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { schedules: id },
    });

    return NextResponse.json(
      { success: true, message: 'Schedule deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
