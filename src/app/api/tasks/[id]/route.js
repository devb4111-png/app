import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import User from '@/lib/models/User';
import Schedule from '@/lib/models/Schedule';
import {
  canPostponeTask,
  getTodayString,
  getPostponedDate,
} from '@/utils/validation';
import { updateScheduleCompletion } from '@/lib/controllers/scheduleController';

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
 * PATCH /api/tasks/[id] — update task status or postpone
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

    const { id } = await params;
    const body = await request.json();
    const { action, status } = body;

    await connectDB();

    const task = await Task.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Handle postpone action
    if (action === 'postpone') {
      const user = await User.findById(task.userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check/reset daily postpone counter
      const today = getTodayString();
      let dailyCount = 0;

      if (user.dailyPostponeCount?.date === today) {
        dailyCount = user.dailyPostponeCount.count;
      }

      // Validate postpone limits
      const validation = canPostponeTask(task, dailyCount);
      if (!validation.allowed) {
        return NextResponse.json(
          {
            error: validation.reason,
            type: 'GOAL_COMMITMENT',
          },
          { status: 403 }
        );
      }

      // Apply postpone
      task.currentDate = getPostponedDate(task.currentDate, 1);
      task.postponeCount += 1;
      await task.save();

      // Update daily counter
      await User.findByIdAndUpdate(user._id, {
        dailyPostponeCount: {
          date: today,
          count: dailyCount + 1,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Task postponed to ${task.currentDate.toISOString().split('T')[0]}`,
        task,
        postponesRemaining: 3 - task.postponeCount,
        dailyPostponesRemaining: 2 - (dailyCount + 1),
      });
    }

    // Handle status update
    if (status) {
      if (!['pending', 'in-progress', 'completed'].includes(status)) {
        return NextResponse.json(
          {
            error:
              'Invalid status. Must be: pending, in-progress, or completed',
          },
          { status: 400 }
        );
      }

      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      }

      await task.save();

      // Update schedule completion percentage
      if (task.scheduleId) {
        await updateScheduleCompletion(task.scheduleId);
      }

      return NextResponse.json({
        success: true,
        message: `Task status updated to ${status}`,
        task,
      });
    }

    return NextResponse.json(
      { error: 'Must provide either action or status' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
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

    const { id } = await params;

    await connectDB();

    const task = await Task.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const scheduleId = task.scheduleId;

    await Task.findByIdAndDelete(id);

    // Remove task from schedule
    if (scheduleId) {
      await Schedule.findByIdAndUpdate(scheduleId, {
        $pull: { tasks: id },
      });

      // Update schedule completion
      await updateScheduleCompletion(scheduleId);
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
