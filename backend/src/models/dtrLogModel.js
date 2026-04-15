import mongoose from 'mongoose';

const dtrLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeIn: { type: String },
  timeOut: { type: String },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  selfie: { type: String }, // base64 or image URL
}, { timestamps: true });

const DTRLog = mongoose.model('DTRLog', dtrLogSchema);
export default DTRLog;
