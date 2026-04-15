import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['Memo', 'Event', 'Training', 'Advisory', 'Other'], default: 'Other' },
  date: { type: Date, default: Date.now },
  author: { type: String },
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
