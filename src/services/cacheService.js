import crypto from 'node:crypto';

export const cache = new Map();

export function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function getCachedAd(hash) {
  return cache.get(hash);
}

export function setCachedAd(hash, classification) {
  cache.set(hash, classification);
}

export function hasCachedAd(hash) {
  return cache.has(hash);
}

