const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  genre: {
    type: String,
    default: 'General'
  },
  isbn: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
