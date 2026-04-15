import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g. Sick, Vacation, etc.
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true }, // YYYY-MM-DD
  reason: { type: String },
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  documentImage: { type: String }, // base64 or image URL for leave approval document
  ocrText: { type: String }, // OCR extracted text from document
  appliedAt: { type: Date, default: Date.now }
});

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
