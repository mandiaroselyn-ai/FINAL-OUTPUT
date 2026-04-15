import Announcement from '../models/announcementModel.js';

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create an announcement
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update an announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const updated = await Announcement.findByIdAndUpdate(announcementId, req.body, { new: true });
    res.json({ success: true, announcement: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    await Announcement.findByIdAndDelete(announcementId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
