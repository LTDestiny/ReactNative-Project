import { Router } from 'express';
import { chat, recommendations, startSession } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/chat', chat);
router.get('/recommendations', recommendations);
router.post('/session', authenticate, startSession);

export default router;
