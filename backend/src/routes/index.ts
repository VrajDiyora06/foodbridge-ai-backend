import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';
import foodRoutes from './food.routes';
import reservationRoutes from './reservation.routes';

const router = Router();

// Mount domain routes
router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/food', foodRoutes);
router.use('/reservations', reservationRoutes);

export default router;
