const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

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

// Create a new session
router.post('/', auth, async (req, res) => {
  const { buyIn, gameType, stakes, notes, setting, sessionType } = req.body;

  try {
    const newSession = new Session({
      user: req.user.id,
      buyIn,
      gameType,
      stakes,
      notes,
      setting,
      sessionType,
      startTime: new Date()
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
  const { buyIn, cashOut, duration, gameType, stakes, notes, isActive, setting, sessionType } = req.body;

  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    // Make sure user owns session
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    session.buyIn = buyIn || session.buyIn;
    session.cashOut = cashOut || session.cashOut;
    session.duration = duration || session.duration;
    session.gameType = gameType || session.gameType;
    session.stakes = stakes || session.stakes;
    session.notes = notes || session.notes;
    session.isActive = isActive !== undefined ? isActive : session.isActive;
    session.setting = setting || session.setting;
    session.sessionType = sessionType || session.sessionType;

    if (!session.isActive && !session.endTime) {
      session.endTime = new Date();
    }

    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get filtered and sorted sessions
router.get('/filter', auth, async (req, res) => {
  try {
    let query = { user: req.user.id };
    const { profitMin, profitMax, setting, gameType, stakes, sessionType, sortBy, sortOrder } = req.query;

    if (profitMin || profitMax) {
      query.$expr = { $and: [] };
      if (profitMin) {
        query.$expr.$and.push({ $gte: [{ $subtract: ['$cashOut', '$buyIn'] }, Number(profitMin)] });
      }
      if (profitMax) {
        query.$expr.$and.push({ $lte: [{ $subtract: ['$cashOut', '$buyIn'] }, Number(profitMax)] });
      }
    }

    if (setting) query.setting = setting;
    if (gameType) query.gameType = gameType;
    if (stakes) query.stakes = stakes;
    if (sessionType) query.sessionType = sessionType;

    let sortOption = {};
    if (sortBy === 'profit') {
      sortOption = { $subtract: ['$cashOut', '$buyIn'] };
    } else if (sortBy === 'duration') {
      sortOption = 'duration';
    } else {
      sortOption = 'startTime';
    }

    const sessions = await Session.find(query)
      .sort({ [sortOption]: sortOrder === 'asc' ? 1 : -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;