import connectDB from '@/lib/mongodb';
import Schedule from '@/lib/models/Schedule';
import Task from '@/lib/models/Task';
import User from '@/lib/models/User';

/**
 * Create a new schedule for a user
 */
export async function createSchedule(userId, scheduleData) {
  try {
    await connectDB();

    // Create the schedule
    const schedule = new Schedule({
      userId,
      name: scheduleData.name || 'My Learning Schedule',
      coreGoal: scheduleData.coreGoal,
      interests: scheduleData.interests || '',
      pace: scheduleData.pace || 'Steady',
      availability: scheduleData.availability || [],
      status: 'active',
    });

    const savedSchedule = await schedule.save();

    // Add schedule to user's schedules array
    await User.findByIdAndUpdate(userId, {
      $push: { schedules: savedSchedule._id },
    });

    return savedSchedule;
  } catch (error) {
    throw new Error(`Failed to create schedule: ${error.message}`);
  }
}

/**
 * Get all schedules for a user
 */
export async function getUserSchedules(userId) {
  try {
    await connectDB();

    const schedules = await Schedule.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return schedules;
  } catch (error) {
    throw new Error(`Failed to fetch schedules: ${error.message}`);
  }
}

/**
 * Get a single schedule with its tasks
 */
export async function getScheduleWithTasks(scheduleId, userId) {
  try {
    await connectDB();

    const schedule = await Schedule.findOne({
      _id: scheduleId,
      userId,
    }).populate('tasks');

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    return schedule;
  } catch (error) {
    throw new Error(`Failed to fetch schedule: ${error.message}`);
  }
}

/**
 * Add tasks to a schedule
 */
export async function addTasksToSchedule(scheduleId, userId, tasks) {
  try {
    await connectDB();

    // Verify schedule belongs to user
    const schedule = await Schedule.findOne({
      _id: scheduleId,
      userId,
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Create tasks
    const createdTasks = await Task.insertMany(
      tasks.map((task) => ({
        ...task,
        scheduleId,
        userId,
      }))
    );

    // Add task IDs to schedule
    await Schedule.findByIdAndUpdate(scheduleId, {
      $push: { tasks: { $each: createdTasks.map((t) => t._id) } },
    });

    return createdTasks;
  } catch (error) {
    throw new Error(`Failed to add tasks: ${error.message}`);
  }
}

/**
 * Update schedule status
 */
export async function updateScheduleStatus(scheduleId, userId, status) {
  try {
    await connectDB();

    const schedule = await Schedule.findOneAndUpdate(
      { _id: scheduleId, userId },
      { status },
      { new: true }
    );

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    return schedule;
  } catch (error) {
    throw new Error(`Failed to update schedule: ${error.message}`);
  }
}

/**
 * Calculate and update completion percentage
 */
export async function updateScheduleCompletion(scheduleId) {
  try {
    await connectDB();

    const tasks = await Task.find({ scheduleId });

    if (tasks.length === 0) {
      await Schedule.findByIdAndUpdate(scheduleId, {
        completionPercentage: 0,
      });
      return;
    }

    const completedTasks = tasks.filter(
      (t) => t.status === 'completed'
    ).length;
    const completionPercentage = Math.round(
      (completedTasks / tasks.length) * 100
    );

    await Schedule.findByIdAndUpdate(scheduleId, {
      completionPercentage,
    });

    return completionPercentage;
  } catch (error) {
    throw new Error(`Failed to update completion: ${error.message}`);
  }
}

/**
 * Delete a schedule and its tasks
 */
export async function deleteSchedule(scheduleId, userId) {
  try {
    await connectDB();

    const schedule = await Schedule.findOneAndDelete({
      _id: scheduleId,
      userId,
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Delete all tasks for this schedule
    await Task.deleteMany({ scheduleId });

    // Remove schedule from user's schedules array
    await User.findByIdAndUpdate(userId, {
      $pull: { schedules: scheduleId },
    });

    return schedule;
  } catch (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
}

/**
 * Get schedule statistics
 */
export async function getScheduleStats(scheduleId, userId) {
  try {
    await connectDB();

    const schedule = await Schedule.findOne({
      _id: scheduleId,
      userId,
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const tasks = await Task.find({ scheduleId });

    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      inProgressTasks: tasks.filter((t) => t.status === 'in-progress').length,
      pendingTasks: tasks.filter((t) => t.status === 'pending').length,
      highPriorityTasks: tasks.filter((t) => t.priority === 'high').length,
      completionPercentage: schedule.completionPercentage,
      daysSinceStart: Math.floor(
        (new Date() - new Date(schedule.startDate)) / (1000 * 60 * 60 * 24)
      ),
    };

    return stats;
  } catch (error) {
    throw new Error(`Failed to fetch stats: ${error.message}`);
  }
}
