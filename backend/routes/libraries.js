const express = require('express');
const router = express.Router();
const Library = require('../models/Library');
const Reservation = require('../models/Reservation');
const { auth, adminAuth } = require('../middleware/auth');

// GET all libraries
router.get('/', async (req, res) => {
  try {
    const { city, search } = req.query;
    let query = {};
    if (city) query.city = new RegExp(city, 'i');
    if (search) query.$or = [
      { libraryName: new RegExp(search, 'i') },
      { city: new RegExp(search, 'i') },
      { address: new RegExp(search, 'i') }
    ];
    const libraries = await Library.find(query);
    res.json(libraries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single library
router.get('/:id', async (req, res) => {
  try {
    const library = await Library.findById(req.params.id);
    if (!library) return res.status(404).json({ message: 'Library not found' });
    res.json(library);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create library (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const library = new Library(req.body);
    await library.save();
    res.status(201).json(library);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update library (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const library = await Library.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!library) return res.status(404).json({ message: 'Library not found' });

    // If library is closed/maintenance, cancel all pending/approved reservations
    if (req.body.status === 'Closed' || req.body.status === 'Maintenance') {
      await Reservation.updateMany(
        { libraryId: req.params.id, status: { $in: ['Pending', 'Approved'] } },
        { status: 'Cancelled', cancellationReason: `Library is now ${req.body.status}. All reservations have been cancelled.` }
      );
    }

    res.json(library);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE library (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const library = await Library.findByIdAndDelete(req.params.id);
    if (!library) return res.status(404).json({ message: 'Library not found' });
    res.json({ message: 'Library deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
