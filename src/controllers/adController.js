import { validateInput, parseAndValidate } from '../utils/validator.js';
import { hashText, getCachedAd, setCachedAd, hasCachedAd } from '../services/cacheService.js';
import { callGemini } from '../services/geminiService.js';

export async function classifyAd(req, res) {
  const validation = validateInput(req.body?.text);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const trimmedText = validation.text;
  const cacheKey = hashText(trimmedText);

  if (hasCachedAd(cacheKey)) {
    return res.status(200).json(getCachedAd(cacheKey));
  }

  let geminiData;
  try {
    geminiData = await callGemini(trimmedText);
  } catch {
    return res.status(502).json({ error: 'LLM unavailable' });
  }

  const rawOutput = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof rawOutput !== 'string') {
    return res.status(502).json({ error: 'Invalid LLM response' });
  }

  let result;
  try {
    result = parseAndValidate(rawOutput);
  } catch {
    return res.status(502).json({ error: 'Invalid LLM response' });
  }

  setCachedAd(cacheKey, result);
  return res.status(200).json(result);
}

