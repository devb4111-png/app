import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Creates and returns a configured Gemini generative model instance.
 * This utility keeps the API key on the server side only.
 *
 * @param {string} [modelName='gemini-3-flash-preview'] - The Gemini model to use.
 * @returns {import('@google/generative-ai').GenerativeModel}
 */
export function getGeminiModel(modelName = 'gemini-3-flash-preview') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not defined. Please add it to your .env.local file.'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Builds the system prompt for the AI Schedule Engine.
 *
 * @param {Object} params
 * @param {string} params.coreGoal - The user's primary learning/work goal.
 * @param {string} params.interests - Background context or existing knowledge.
 * @param {string} params.pace - 'Slow', 'Steady', or 'Sprint'.
 * @param {Array} params.availability - Array of time blocks, e.g. [{day: 'Monday', start: '18:00', end: '20:00'}].
 * @returns {string} The complete system prompt.
 */
export function buildSchedulePrompt({ coreGoal, interests, pace, availability }) {
  const availabilityText = availability
    .map((slot) => `  - ${slot.day}: ${slot.start} to ${slot.end}`)
    .join('\n');

  return `You are an expert AI Schedule Architect. Your job is to create a structured, realistic learning/work schedule based on the user's inputs.

USER PROFILE:
- Core Goal: ${coreGoal}
- Background & Interests: ${interests}
- Learning Pace: ${pace} (Slow = gentle with lots of breaks, Steady = balanced, Sprint = intensive and fast-paced)
- Available Time Blocks:
${availabilityText}

INSTRUCTIONS:
1. Break down the core goal into specific, actionable tasks.
2. Assign each task a realistic time estimate that fits within the user's availability.
3. Prioritize tasks logically (foundations first, advanced topics later).
4. For a "${pace}" pace, ${
    pace === 'Slow'
      ? 'include buffer time and review sessions between topics.'
      : pace === 'Sprint'
      ? 'pack tasks densely and move quickly through fundamentals.'
      : 'balance new content with practice sessions.'
  }

RESPOND WITH ONLY a valid JSON object in this exact format (no markdown, no code fences):
{
  "schedule": [
    {
      "title": "Task title",
      "description": "Detailed description of what to do",
      "estimatedMinutes": 60,
      "priority": "high",
      "suggestedDay": "Monday",
      "suggestedTime": "18:00"
    }
  ]
}

Priority must be one of: "high", "medium", "low".
Generate between 8 and 20 tasks depending on the scope of the goal.
Ensure tasks fit within the provided availability windows.`;
}
