const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { auth, adminAuth } = require('../middleware/auth');

// GET all books (with library info, supports search)
router.get('/', async (req, res) => {
  try {
    const { search, libraryId } = req.query;
    let query = {};
    if (libraryId) query.libraryId = libraryId;
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { author: new RegExp(search, 'i') }
    ];
    const books = await Book.find(query).populate('libraryId', 'libraryName city status totalSeats');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('libraryId');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create book (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    const populated = await book.populate('libraryId', 'libraryName city');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update book (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('libraryId', 'libraryName city');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE book (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
