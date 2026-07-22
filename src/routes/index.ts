import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Mount domain routes here as the project grows
// e.g. router.use('/auth', authRoutes);
// e.g. router.use('/donations', donationRoutes);

router.use(healthRoutes);

export default router;
