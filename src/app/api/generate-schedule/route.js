import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getGeminiModel, buildSchedulePrompt } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Schedule from '@/lib/models/Schedule';
import Task from '@/lib/models/Task';
import {
  createSchedule,
  addTasksToSchedule,
} from '@/lib/controllers/scheduleController';

// Create auth config for getServerSession
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

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { coreGoal, interests, pace, availability, scheduleName } = body;

    // Validate required fields
    if (!coreGoal || !pace || !availability?.length) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: coreGoal, pace, and availability are required.',
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Create a new schedule
    const schedule = await createSchedule(session.user.id, {
      name: scheduleName || 'My Learning Schedule',
      coreGoal,
      interests: interests || '',
      pace,
      availability,
    });

    // Generate schedule with Gemini
    const model = getGeminiModel();
    const prompt = buildSchedulePrompt({
      coreGoal,
      interests,
      pace,
      availability,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code fences if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let scheduleData;
    try {
      scheduleData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // Delete the schedule if generation fails
      await Schedule.findByIdAndDelete(schedule._id);
      return NextResponse.json(
        { error: 'AI generated an invalid response. Please try again.' },
        { status: 500 }
      );
    }

    if (!scheduleData.schedule || !Array.isArray(scheduleData.schedule)) {
      await Schedule.findByIdAndDelete(schedule._id);
      return NextResponse.json(
        { error: 'AI response missing schedule array. Please try again.' },
        { status: 500 }
      );
    }

    // Map day names to next occurrence dates
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    function getNextDayDate(dayName) {
      const today = new Date();
      const todayDay = today.getDay();
      const targetDay = dayMap[dayName] ?? todayDay;
      let daysUntil = targetDay - todayDay;
      if (daysUntil <= 0) daysUntil += 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate;
    }

    // Create task objects (without scheduleId, will be added by controller)
    const taskData = scheduleData.schedule.map((item) => {
      const scheduledDate = getNextDayDate(item.suggestedDay || 'Monday');
      return {
        title: item.title,
        description: item.description || '',
        estimatedMinutes: item.estimatedMinutes || 60,
        priority: ['high', 'medium', 'low'].includes(item.priority)
          ? item.priority
          : 'medium',
        status: 'pending',
        originalDate: scheduledDate,
        currentDate: scheduledDate,
        postponeCount: 0,
        suggestedDay: item.suggestedDay || '',
        suggestedTime: item.suggestedTime || '',
      };
    });

    // Add tasks to schedule using controller
    const createdTasks = await addTasksToSchedule(
      schedule._id,
      session.user.id,
      taskData
    );

    // Populate the schedule with tasks
    const populatedSchedule = await Schedule.findById(schedule._id).populate(
      'tasks'
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule generated successfully!',
        schedule: populatedSchedule,
        taskCount: createdTasks.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Schedule generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
