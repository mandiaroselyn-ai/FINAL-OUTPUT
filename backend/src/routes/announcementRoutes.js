import express from 'express';
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';

const router = express.Router();

// Get all announcements
router.get('/', getAllAnnouncements);
// Create an announcement
router.post('/', createAnnouncement);
// Update an announcement
router.put('/:announcementId', updateAnnouncement);
// Delete an announcement
router.delete('/:announcementId', deleteAnnouncement);

export default router;
