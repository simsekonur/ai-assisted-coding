import { Router } from 'express';
import { classifyAd } from '../controllers/adController.js';

const router = Router();

router.post('/classify-ad', classifyAd);

export default router;

