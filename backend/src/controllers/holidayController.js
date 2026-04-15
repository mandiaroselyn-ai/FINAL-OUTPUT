import Holiday from '../models/holidayModel.js';

// Get all holidays
export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.status(200).json({ success: true, data: holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch holidays' });
  }
};

// Add a holiday (optional, for admin use)
export const addHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;
    const holiday = new Holiday({ date, name });
    await holiday.save();
    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add holiday' });
  }
};
