const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

// Get all sessions for a user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id }).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add new session
router.post('/', auth, async (req, res) => {
    const { buyIn, cashOut, duration, location, gameType, notes } = req.body;
  
    try {
      console.log('Received session data:', req.body);
  
      const newSession = new Session({
        user: req.user.id,
        buyIn,
        cashOut,
        duration,
        location,
        gameType,
        notes
      });
  
      console.log('Created new session object:', newSession);
  
      const session = await newSession.save();
      console.log('Saved session:', session);
  
      res.json(session);
    } catch (err) {
      console.error('Error creating session:', err);
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  });

// Update a session
router.put('/:id', auth, async (req, res) => {
  const { buyIn, cashOut, duration, location, gameType, notes } = req.body;

  try {
    let session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: 'Session not found' });

    // Make sure user owns session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    session = await Session.findByIdAndUpdate(
      req.params.id,
      { $set: { buyIn, cashOut, duration, location, gameType, notes } },
      { new: true }
    );

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;