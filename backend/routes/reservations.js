const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Seat = require('../models/Seat');
const { auth, adminAuth } = require('../middleware/auth');

// GET all reservations (admin) or user's own reservations
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    const { status, libraryId } = req.query;
    if (status) query.status = status;
    if (libraryId) query.libraryId = libraryId;

    const reservations = await Reservation.find(query)
      .populate('userId', 'name email profileImage')
      .populate('libraryId', 'libraryName city address image')
      .populate('seatId', 'seatNumber seatType')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create reservation
router.post('/', auth, async (req, res) => {
  try {
    const { libraryId, seatId, date, startTime, endTime } = req.body;

    // Check for existing reservation on same seat/date/time overlap
    const existing = await Reservation.findOne({
      seatId,
      date: new Date(date),
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: 'Seat is already reserved for this time slot' });
    }

    const reservation = new Reservation({
      userId: req.user._id,
      libraryId,
      seatId,
      date: new Date(date),
      startTime,
      endTime,
      status: 'Pending'
    });
    await reservation.save();

    const populated = await Reservation.findById(reservation._id)
      .populate('userId', 'name email')
      .populate('libraryId', 'libraryName city')
      .populate('seatId', 'seatNumber seatType');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT approve reservation (admin)
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', adminNote: req.body.adminNote || '' },
      { new: true }
    ).populate('userId', 'name email').populate('libraryId', 'libraryName').populate('seatId', 'seatNumber');

    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT reject reservation (admin)
router.put('/:id/reject', adminAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', adminNote: req.body.adminNote || '' },
      { new: true }
    ).populate('userId', 'name email').populate('libraryId', 'libraryName').populate('seatId', 'seatNumber');

    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT cancel reservation (admin or student - own only)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    // Students can only cancel their own
    if (req.user.role !== 'admin' && reservation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reservation.status = 'Cancelled';
    reservation.cancellationReason = req.body.reason || 'Cancelled by user';
    await reservation.save();

    const populated = await Reservation.findById(reservation._id)
      .populate('userId', 'name email').populate('libraryId', 'libraryName').populate('seatId', 'seatNumber');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET stats for admin dashboard
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const total = await Reservation.countDocuments();
    const pending = await Reservation.countDocuments({ status: 'Pending' });
    const approved = await Reservation.countDocuments({ status: 'Approved' });
    const cancelled = await Reservation.countDocuments({ status: 'Cancelled' });
    const rejected = await Reservation.countDocuments({ status: 'Rejected' });
    res.json({ total, pending, approved, cancelled, rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
