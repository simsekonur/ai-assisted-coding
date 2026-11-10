import { app } from './src/app.js';

export { app };
export { validateInput, parseAndValidate } from './src/utils/validator.js';
export { cache, hashText } from './src/services/cacheService.js';
export { callGemini } from './src/services/geminiService.js';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
