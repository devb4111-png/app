import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: [true, 'Schedule ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    estimatedMinutes: {
      type: Number,
      required: true,
      min: [1, 'Estimated time must be at least 1 minute'],
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    originalDate: {
      type: Date,
      required: [true, 'Original scheduled date is required'],
    },
    currentDate: {
      type: Date,
      required: [true, 'Current scheduled date is required'],
    },
    postponeCount: {
      type: Number,
      default: 0,
      max: [3, 'A task can only be postponed a maximum of 3 times'],
    },
    suggestedDay: {
      type: String,
      default: '',
    },
    suggestedTime: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries on task by schedule and user
TaskSchema.index({ scheduleId: 1, currentDate: 1 });
TaskSchema.index({ scheduleId: 1, status: 1 });
TaskSchema.index({ userId: 1, scheduleId: 1 });
TaskSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
