import mongoose from 'mongoose';

const travelOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  purpose: { type: String, required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  documentImage: {
    type: String,
    default: null
  },
  ocrText: {
    type: String,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('TravelOrder', travelOrderSchema);
