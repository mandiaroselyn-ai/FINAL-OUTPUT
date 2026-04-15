import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  }
});

const Holiday = mongoose.model('Holiday', holidaySchema);
export default Holiday;