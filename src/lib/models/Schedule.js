import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Schedule name is required'],
      trim: true,
      default: 'My Learning Schedule',
    },
    coreGoal: {
      type: String,
      required: [true, 'Core goal is required'],
      trim: true,
    },
    interests: {
      type: String,
      trim: true,
      default: '',
    },
    pace: {
      type: String,
      enum: ['Slow', 'Steady', 'Sprint'],
      default: 'Steady',
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          required: true,
        },
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetEndDate: {
      type: Date,
      default: null,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dailyPostponeCount: {
      date: { type: String, default: '' },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ScheduleSchema.index({ userId: 1, status: 1 });
ScheduleSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Schedule ||
  mongoose.model('Schedule', ScheduleSchema);
