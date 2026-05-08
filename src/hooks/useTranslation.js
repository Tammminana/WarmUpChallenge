import { useState, useCallback } from 'react';

/**
 * useTranslation — wraps Google Cloud Translation API
 * Used to translate itinerary content into the user's detected language.
 * API Key must be the same Gemini/Google API key with Translation API enabled.
 */
export function useTranslation() {
  const [translating, setTranslating] = useState(false);

  /**
   * Detects the language of the given text using Google Translation API
   * Returns language code string e.g. "hi", "en", "te"
   */
  const detectLanguage = useCallback(async (text) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return 'en';
    try {
      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text }),
        }
      );
      const data = await res.json();
      return data?.data?.detections?.[0]?.[0]?.language || 'en';
    } catch {
      return 'en';
    }
  }, []);

  /**
   * Translates text to the target language
   * Returns translated string or original on failure
   */
  const translate = useCallback(async (text, targetLang) => {
    if (!text || targetLang === 'en') return text;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return text;

    setTranslating(true);
    try {
      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, target: targetLang, format: 'text' }),
        }
      );
      const data = await res.json();
      return data?.data?.translations?.[0]?.translatedText || text;
    } catch {
      return text;
    } finally {
      setTranslating(false);
    }
  }, []);

  return { detectLanguage, translate, translating };
}
