import express from 'express';
import adRoutes from './routes/adRoutes.js';

export const app = express();

app.use(express.json());

// Handle malformed JSON body errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

// Mount routes
app.use('/', adRoutes);

export default app;

