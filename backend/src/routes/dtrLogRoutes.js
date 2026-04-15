import express from 'express';
import { getUserLogs, addLog, updateLog, getAllLogs } from '../controllers/dtrLogController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateJWT, authorizeRoles('admin', 'supervisor'), getAllLogs);
router.get('/:userId', authenticateJWT, getUserLogs);
router.post('/', authenticateJWT, addLog);
router.put('/:logId', authenticateJWT, updateLog);

export default router;
