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
  const { buyIn, gameType, stakes, setting, sessionType, notes } = req.body;

  try {
    const newSession = new Session({
      user: req.user.id,
      buyIn,
      gameType,
      stakes,
      setting,
      sessionType,
      notes
    });

    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a session
router.put('/:id', auth, async (req, res) => {
  const { buyIn, cashOut, duration, gameType, stakes, setting, sessionType, notes, photos } = req.body;

  try {
    let session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: 'Session not found' });

    // Make sure user owns session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    session = await Session.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          buyIn, 
          cashOut, 
          duration, 
          gameType, 
          stakes, 
          setting, 
          sessionType, 
          notes,
          photos
        } 
      },
      { new: true }
    );

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: 'Session not found' });

    // Make sure user owns session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await session.remove();

    res.json({ msg: 'Session removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;