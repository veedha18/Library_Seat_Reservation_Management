const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  libraryName: {
    type: String,
    required: [true, 'Library name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Maintenance'],
    default: 'Open'
  },
  totalSeats: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  openingHours: {
    type: String,
    default: '9:00 AM - 9:00 PM'
  }
}, { timestamps: true });

module.exports = mongoose.model('Library', librarySchema);
