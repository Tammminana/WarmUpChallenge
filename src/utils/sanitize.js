/**
 * sanitize.js — Input sanitization utilities
 * Protects against XSS and prompt injection attacks
 */

// Strips characters that are commonly used in prompt injection attempts
const INJECTION_PATTERNS = [
  /ignore previous instructions/gi,
  /forget all previous/gi,
  /you are now/gi,
  /act as/gi,
  /system:/gi,
  /\[system\]/gi,
  /<script/gi,
  /javascript:/gi,
];

/**
 * Sanitizes user input before sending to Gemini API.
 * Prevents prompt injection and limits input length.
 */
export function sanitizePrompt(input) {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Enforce max length (prevents token abuse)
  if (sanitized.length > 500) {
    sanitized = sanitized.slice(0, 500);
  }

  // Remove injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[removed]');
  }

  // Remove angle brackets to prevent HTML injection
  sanitized = sanitized.replace(/[<>]/g, '');

  return sanitized;
}

/**
 * Safely renders AI-generated text as plain text (no HTML).
 * Use this instead of dangerouslySetInnerHTML everywhere.
 */
export function safeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[<>&"']/g, (char) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

/**
 * Simple debounce — delays function execution until user stops typing
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
