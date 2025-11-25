import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAdminDashboard } from '../controllers/admin.controller';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getAdminDashboard);

export default router;

