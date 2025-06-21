// routes/floorTraffic.js
import express from 'express';
import FloorTrafficModel from '../models/FloorTrafficModel'; // adjust this path/import to your ORM or DB layer

const router = express.Router();

// GET today’s logs (you probably already have something like this)
router.get('/floor-traffic', async (req, res, next) => {
  try {
    const todayLogs = await FloorTrafficModel.findToday();   // or your own query
    res.json(todayLogs);
  } catch (err) {
    next(err);
  }
});

// ← NEW POST HANDLER
router.post('/floor-traffic', async (req, res, next) => {
  try {
    const {
      timeIn,
      timeOut,
      salesperson,
      customerName,
      vehicle,
      trade,
      demo,
      writeUp,
      customerOffer,
      mgrTO,
      origin
    } = req.body;

    // Basic validation example
    if (!timeIn || !salesperson || !customerName) {
      return res.status(422).json({ message: 'timeIn, salesperson & customerName are required' });
    }

    // Create your record—adjust for your ORM (Sequelize, Mongoose, etc.)
    const newLog = await FloorTrafficModel.create({
      timeIn,
      timeOut,
      salesperson,
      customerName,
      vehicle,
      trade,
      demo,
      writeUp,
      customerOffer,
      mgrTO,
      origin
    });

    res.status(201).json(newLog);
  } catch (err) {
    next(err);
  }
});

export default router;
