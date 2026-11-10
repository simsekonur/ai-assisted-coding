import { test } from 'node:test';
import assert from 'node:assert/strict';

// Ensure NODE_ENV is set to 'test' so app.listen is not called on import
process.env.NODE_ENV = 'test';

const { validateInput, parseAndValidate } = await import('./server.js');

test('empty input rejected', () => {
  const emptyStr = validateInput('');
  assert.strictEqual(emptyStr.valid, false);
  assert.strictEqual(emptyStr.error, 'Text cannot be empty');

  const whitespaceOnly = validateInput('   \n\t   ');
  assert.strictEqual(whitespaceOnly.valid, false);
  assert.strictEqual(whitespaceOnly.error, 'Text cannot be empty');

  const nullInput = validateInput(null);
  assert.strictEqual(nullInput.valid, false);
  assert.strictEqual(nullInput.error, 'Text must be a string');

  const undefinedInput = validateInput(undefined);
  assert.strictEqual(undefinedInput.valid, false);
  assert.strictEqual(undefinedInput.error, 'Text must be a string');

  const numberInput = validateInput(12345);
  assert.strictEqual(numberInput.valid, false);
  assert.strictEqual(numberInput.error, 'Text must be a string');
});

test('valid input accepted', () => {
  const rawInput = '   Get 50% off all sneakers this weekend only!   ';
  const result = validateInput(rawInput);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.text, 'Get 50% off all sneakers this weekend only!');

  // Single character boundary
  const singleChar = validateInput('A');
  assert.strictEqual(singleChar.valid, true);
  assert.strictEqual(singleChar.text, 'A');

  // Max length boundary (1000 characters)
  const exact1000 = validateInput('x'.repeat(1000));
  assert.strictEqual(exact1000.valid, true);
  assert.strictEqual(exact1000.text.length, 1000);
});

test('input exceeding 1000 characters rejected', () => {
  const over1000 = validateInput('x'.repeat(1001));
  assert.strictEqual(over1000.valid, false);
  assert.strictEqual(over1000.error, 'Text cannot exceed 1000 characters');
});

test('fenced JSON parsed', () => {
  const jsonWithFence = '```json\n{\n  "category": "ecommerce",\n  "sentiment": "positive",\n  "policy_risk": false,\n  "reason": "Promotional discount for footwear."\n}\n```';
  const parsed1 = parseAndValidate(jsonWithFence);
  assert.deepStrictEqual(parsed1, {
    category: 'ecommerce',
    sentiment: 'positive',
    policy_risk: false,
    reason: 'Promotional discount for footwear.'
  });

  // Generic code fence without 'json' tag
  const genericFence = '```\n{\n  "category": "gaming",\n  "sentiment": "neutral",\n  "policy_risk": false,\n  "reason": "Announcement of a new video game update."\n}\n```';
  const parsed2 = parseAndValidate(genericFence);
  assert.deepStrictEqual(parsed2, {
    category: 'gaming',
    sentiment: 'neutral',
    policy_risk: false,
    reason: 'Announcement of a new video game update.'
  });

  // Strips extra fields from model response
  const withExtraFields = '```json\n{\n  "category": "finance",\n  "sentiment": "neutral",\n  "policy_risk": false,\n  "reason": "Personal loan rate comparison.",\n  "confidence": 0.98,\n  "extra_notes": "None"\n}\n```';
  const parsed3 = parseAndValidate(withExtraFields);
  assert.deepStrictEqual(parsed3, {
    category: 'finance',
    sentiment: 'neutral',
    policy_risk: false,
    reason: 'Personal loan rate comparison.'
  });
  assert.strictEqual(Object.keys(parsed3).length, 4);
});

test('invalid category rejected', () => {
  const invalidCategoryJson = JSON.stringify({
    category: 'cryptocurrency_scam',
    sentiment: 'negative',
    policy_risk: true,
    reason: 'Promotes unverified financial scheme.'
  });

  assert.throws(
    () => parseAndValidate(invalidCategoryJson),
    (err) => err instanceof Error && err.message === 'Invalid LLM response'
  );
});

test('invalid sentiment rejected', () => {
  const invalidSentimentJson = JSON.stringify({
    category: 'ecommerce',
    sentiment: 'super_excited',
    policy_risk: false,
    reason: 'Great product discount.'
  });

  assert.throws(
    () => parseAndValidate(invalidSentimentJson),
    (err) => err instanceof Error && err.message === 'Invalid LLM response'
  );
});

test('invalid policy_risk rejected', () => {
  const nonBooleanPolicyRisk = JSON.stringify({
    category: 'ecommerce',
    sentiment: 'positive',
    policy_risk: 'false',
    reason: 'Great product discount.'
  });

  assert.throws(
    () => parseAndValidate(nonBooleanPolicyRisk),
    (err) => err instanceof Error && err.message === 'Invalid LLM response'
  );
});
