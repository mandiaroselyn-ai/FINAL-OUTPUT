import Leave from '../models/leaveModel.js';

// Get all leaves (admin/supervisor)
export const getAllLeaves = async (req, res) => {
  try {
    console.log('📝 Fetching all leaves for admin/supervisor');
    const leaves = await Leave.find().sort({ startDate: -1 }).lean();
    console.log(`✅ Found ${leaves.length} leaves`);
    res.json({ success: true, leaves });
  } catch (err) {
    console.error('❌ Error fetching leaves:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all leaves for a user
export const getUserLeaves = async (req, res) => {
  try {
    const { userId } = req.params;
    const leaves = await Leave.find({ userId }).sort({ startDate: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Apply for a leave
export const applyLeave = async (req, res) => {
  try {
    console.log('📝 Creating new leave:', req.body);
    const leave = new Leave(req.body);
    await leave.save();
    console.log('✅ Leave created:', leave);
    res.status(201).json({ success: true, leave });
  } catch (err) {
    console.error('❌ Error applying for leave:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update leave status (for admin)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    console.log('📝 Updating leave status:', { leaveId, update: req.body });
    const updated = await Leave.findByIdAndUpdate(leaveId, req.body, { new: true });
    console.log('✅ Leave updated:', updated);
    res.json({ success: true, leave: updated });
  } catch (err) {
    console.error('❌ Error updating leave status:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
