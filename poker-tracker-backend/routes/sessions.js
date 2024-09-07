const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const mongoose = require('mongoose');

// Get all sessions for a user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all active sessions for a user
router.get('/active', auth, async (req, res) => {
  try {
    const activeSessions = await Session.find({ user: req.user.id, isActive: true }).sort({ startTime: -1 });
    res.json(activeSessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a single session by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    res.json(session);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Session not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Create a new session
router.post('/', auth, async (req, res) => {
  const { sessionName, buyIn, cashOut, gameType, stakes, notes, setting, sessionType, startTime, endTime, duration, isActive, tip } = req.body;

  try {
    const newSession = new Session({
      user: req.user.id,
      sessionName,
      buyIn,
      cashOut,
      gameType,
      stakes,
      notes,
      setting,
      sessionType,
      startTime,
      endTime,
      duration,
      isActive,
      tip
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
  const { sessionName, buyIn, cashOut, duration, gameType, stakes, notes, isActive, setting, sessionType, startTime, endTime, tip } = req.body;

  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Make sure user owns session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    session.sessionName = sessionName || session.sessionName;
    session.buyIn = buyIn || session.buyIn;
    session.cashOut = cashOut || session.cashOut;
    session.duration = duration || session.duration;
    session.gameType = gameType || session.gameType;
    session.stakes = stakes || session.stakes;
    session.notes = notes || session.notes;
    session.isActive = isActive !== undefined ? isActive : session.isActive;
    session.setting = setting || session.setting;
    session.sessionType = sessionType || session.sessionType;
    session.startTime = startTime || session.startTime;
    session.endTime = endTime || session.endTime;
    session.tip = tip !== undefined ? tip : session.tip;

    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a session
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid session ID' });
    }

    let session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Make sure user owns session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const result = await Session.findByIdAndDelete(id);

    if (!result) {
      return res.status(500).json({ msg: 'Failed to delete session' });
    }

    res.json({ msg: 'Session removed' });
  } catch (err) {
    console.error('Error in delete session route:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// Get filtered sessions
router.get('/filter', auth, async (req, res) => {
  try {
    const { profitMin, profitMax, setting, gameType, stakes, sessionType, startDate, endDate, sessionName } = req.query;

    let query = { user: req.user.id };

    if (profitMin || profitMax) {
      query.$expr = {};
      if (profitMin) {
        query.$expr.$gte = [{ $subtract: ['$cashOut', '$buyIn'] }, Number(profitMin)];
      }
      if (profitMax) {
        query.$expr.$lte = [{ $subtract: ['$cashOut', '$buyIn'] }, Number(profitMax)];
      }
    }

    if (setting) query.setting = setting;
    if (gameType) query.gameType = gameType;
    if (stakes) query.stakes = stakes;
    if (sessionType) query.sessionType = sessionType;

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (sessionName) {
      query.sessionName = { $regex: sessionName, $options: 'i' };
    }

    const sessions = await Session.find(query).sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;