import { Router } from 'express';
import healthRoutes from './health';
import moderationRoutes from './moderation';

const router = Router();

router.use('/health', healthRoutes);
router.use('/moderate', moderationRoutes);

export default router;
