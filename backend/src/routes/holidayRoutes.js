import express from 'express';
import { getHolidays, addHoliday } from '../controllers/holidayController.js';

const router = express.Router();

// GET /api/holidays
router.get('/', getHolidays);

// POST /api/holidays (optional, for admin use)
router.post('/', addHoliday);

export default router;
