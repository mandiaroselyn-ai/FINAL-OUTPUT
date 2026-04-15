import express from 'express';
import { getUserLeaves, applyLeave, updateLeaveStatus, getAllLeaves } from '../controllers/leaveController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateJWT, authorizeRoles('admin', 'supervisor'), getAllLeaves);
router.get('/:userId', authenticateJWT, getUserLeaves);
router.post('/', authenticateJWT, applyLeave);
router.put('/:leaveId', authenticateJWT, updateLeaveStatus);

export default router;
