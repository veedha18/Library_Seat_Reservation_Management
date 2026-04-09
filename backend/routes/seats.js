const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Library = require('../models/Library');
const { auth, adminAuth } = require('../middleware/auth');

// GET seats (by library)
router.get('/', async (req, res) => {
  try {
    const { libraryId } = req.query;
    let query = {};
    if (libraryId) query.libraryId = libraryId;
    const seats = await Seat.find(query).populate('libraryId', 'libraryName');
    res.json(seats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST reserve seat
router.post('/reserve', auth, async (req, res) => {
  try {
    const { seatId } = req.body;
    const seat = await Seat.findById(seatId);
    if (!seat) return res.status(404).json({ message: 'Seat not found' });
    if (seat.status !== 'available') return res.status(400).json({ message: 'Seat is not available' });
    res.json({ message: 'Seat is available for reservation', seat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create seat (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const seat = new Seat(req.body);
    await seat.save();

    // Update library total seats
    await Library.findByIdAndUpdate(req.body.libraryId, { $inc: { totalSeats: 1 } });
    res.status(201).json(seat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update seat (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!seat) return res.status(404).json({ message: 'Seat not found' });
    res.json(seat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE seat (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const seat = await Seat.findByIdAndDelete(req.params.id);
    if (!seat) return res.status(404).json({ message: 'Seat not found' });
    // Update library total seats
    await Library.findByIdAndUpdate(seat.libraryId, { $inc: { totalSeats: -1 } });
    res.json({ message: 'Seat deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
