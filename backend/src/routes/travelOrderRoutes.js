import express from 'express';
import { getUserTravelOrders, applyTravelOrder, updateTravelOrderStatus, getAllTravelOrders } from '../controllers/travelOrderController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateJWT, authorizeRoles('admin', 'supervisor'), getAllTravelOrders);
router.get('/:userId', authenticateJWT, getUserTravelOrders);
router.post('/', authenticateJWT, applyTravelOrder);
router.put('/:travelOrderId', authenticateJWT, updateTravelOrderStatus);

export default router;
