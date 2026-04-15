import DTRLog from '../models/dtrLogModel.js';

// Get all logs (admin/supervisor)
export const getAllLogs = async (req, res) => {
  try {
    const logs = await DTRLog.find().sort({ date: -1 }).lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all logs for a user
export const getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await DTRLog.find({ userId }).sort({ date: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    console.error('❌ Error getting user logs:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add a new log
export const addLog = async (req, res) => {
  try {
    const log = new DTRLog(req.body);
    await log.save();
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a log (for time out)
export const updateLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const updated = await DTRLog.findByIdAndUpdate(logId, req.body, { new: true });
    res.json({ success: true, log: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
