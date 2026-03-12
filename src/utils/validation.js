/**
 * Validation utilities for the postpone business logic.
 */

/**
 * Check if a task can be postponed.
 * Rules:
 *  - A task can be postponed a maximum of 3 times total.
 *  - A user can postpone a maximum of 2 tasks per day.
 *
 * @param {Object} task - The task document.
 * @param {number} dailyPostponeCount - How many tasks the user has already postponed today.
 * @returns {{ allowed: boolean, reason: string | null }}
 */
export function canPostponeTask(task, dailyPostponeCount) {
  if (task.postponeCount >= 3) {
    return {
      allowed: false,
      reason: `This task has already been postponed ${task.postponeCount} times. Maximum postpone limit (3) reached. Time to commit to your goal!`,
    };
  }

  if (dailyPostponeCount >= 2) {
    return {
      allowed: false,
      reason:
        "You've already postponed 2 tasks today. Daily postpone limit reached. Stay focused on your goals!",
    };
  }

  return { allowed: true, reason: null };
}

/**
 * Get today's date as a string in YYYY-MM-DD format.
 * @returns {string}
 */
export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate the new date when postponing by N days.
 * @param {Date|string} currentDate
 * @param {number} days - Number of days to postpone (default: 1)
 * @returns {Date}
 */
export function getPostponedDate(currentDate, days = 1) {
  const date = new Date(currentDate);
  date.setDate(date.getDate() + days);
  return date;
}
