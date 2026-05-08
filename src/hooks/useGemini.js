import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are Wanderly, an expert AI travel planner. When given a travel request, generate a detailed, logical itinerary in valid JSON format ONLY — no markdown, no extra text.

JSON structure required:
{
  "destination": "City, Country",
  "tripTitle": "Short catchy trip title",
  "duration": "X days",
  "totalBudget": "estimated total in user's currency",
  "persona": "traveler type (e.g. Budget Explorer, Luxury Foodie)",
  "highlights": ["key highlight 1", "key highlight 2", "key highlight 3"],
  "days": [
    {
      "day": 1,
      "theme": "Arrival & First Impressions",
      "activities": [
        {
          "time": "09:00 AM",
          "name": "Activity Name",
          "type": "sightseeing|food|adventure|culture|shopping|transport",
          "description": "2-3 sentence description with practical tips",
          "cost": "approx cost or 'Free'",
          "duration": "X hours",
          "tip": "One local insider tip",
          "accessibility": "brief accessibility note"
        }
      ],
      "dailyBudget": "estimated daily spend",
      "mealSuggestions": { "breakfast": "...", "lunch": "...", "dinner": "..." }
    }
  ],
  "budgetBreakdown": {
    "accommodation": "...",
    "food": "...",
    "transport": "...",
    "activities": "...",
    "misc": "..."
  },
  "packingTips": ["tip1", "tip2", "tip3"],
  "bestTimeToVisit": "...",
  "emergencyContacts": { "police": "...", "ambulance": "...", "tourist helpline": "..." }
}

Rules:
- Keep activities realistic and time-spaced logically
- If budget is tight, prioritize free/cheap attractions
- Always include accessibility info
- Return ONLY valid JSON, nothing else`;

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateItinerary = useCallback(async (userPrompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      });

      const result = await model.generateContent(userPrompt);
      const text = result.response.text().trim();

      // Strip markdown code fences if present
      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      const msg = err.message?.includes('API key') ? err.message
        : err instanceof SyntaxError ? 'AI returned malformed data. Please try again.'
        : `Generation failed: ${err.message}`;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTip = useCallback(async (activityName, destination) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Give ONE very short, practical real-time tip (max 20 words) for visiting "${activityName}" in ${destination}. No intro, just the tip.`
      );
      return result.response.text().trim();
    } catch {
      return null;
    }
  }, []);

  return { generateItinerary, generateTip, loading, error };
}
