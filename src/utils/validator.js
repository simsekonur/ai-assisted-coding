import { ALLOWED_CATEGORIES, ALLOWED_SENTIMENTS } from '../constants/classification.js';

export function validateInput(text) {
  if (typeof text !== 'string') {
    return { valid: false, error: 'Text must be a string' };
  }
  const trimmed = text.trim();
  if (trimmed.length < 1) {
    return { valid: false, error: 'Text cannot be empty' };
  }
  if (trimmed.length > 1000) {
    return { valid: false, error: 'Text cannot exceed 1000 characters' };
  }
  return { valid: true, text: trimmed };
}

export function stripCodeFences(text) {
  if (typeof text !== 'string') return '';
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  const embeddedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (embeddedMatch) {
    return embeddedMatch[1].trim();
  }
  return trimmed;
}

export function parseAndValidate(rawText) {
  if (typeof rawText !== 'string') {
    throw new Error('Invalid LLM response');
  }

  const cleaned = stripCodeFences(rawText);
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Invalid LLM response');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid LLM response');
  }

  const { category, sentiment, policy_risk, reason } = parsed;

  if (
    typeof category !== 'string' ||
    !ALLOWED_CATEGORIES.has(category) ||
    typeof sentiment !== 'string' ||
    !ALLOWED_SENTIMENTS.has(sentiment) ||
    typeof policy_risk !== 'boolean' ||
    typeof reason !== 'string' ||
    reason.trim().length === 0
  ) {
    throw new Error('Invalid LLM response');
  }

  return {
    category,
    sentiment,
    policy_risk,
    reason: reason.trim()
  };
}

