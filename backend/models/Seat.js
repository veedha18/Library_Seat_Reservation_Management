const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    required: true
  },
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required']
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'unavailable'],
    default: 'available'
  },
  seatType: {
    type: String,
    enum: ['regular', 'window', 'quiet', 'computer'],
    default: 'regular'
  }
}, { timestamps: true });

module.exports = mongoose.model('Seat', seatSchema);
