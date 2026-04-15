import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getProfile,
} from '../controllers/userController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', authenticateJWT, getProfile);
router.get('/', authenticateJWT, authorizeRoles('admin'), getAllUsers);
router.put('/:id', authenticateJWT, updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteUser);

// Role-based data routes
router.get('/admin-data', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'This is admin-only data.' });
});
router.get('/supervisor-data', authenticateJWT, authorizeRoles('admin', 'supervisor'), (req, res) => {
  res.json({ message: 'This is for admin and supervisor.' });
});

export default router;
