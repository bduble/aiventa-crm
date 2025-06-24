// routes/floorTraffic.js
import express from 'express';
import FloorTrafficModel from '../models/FloorTrafficModel.js';

const router = express.Router();

/**
 * GET /api/floor-traffic/today
 * Fetch today’s floor-traffic entries.
 */
router.get('/floor-traffic/today', async (req, res, next) => {
  try {
    const todayLogs = await FloorTrafficModel.findToday();
    return res.json(todayLogs);
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/floor-traffic
 * Alias for today's floor-traffic entries.
 * Mirrors the FastAPI implementation.
 */
router.get('/floor-traffic', async (req, res, next) => {
  try {
    const todayLogs = await FloorTrafficModel.findToday();
    return res.json(todayLogs);
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/floor-traffic
 * Create a new floor-traffic entry.
 */
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
      origin,
    } = req.body;

    // Basic validation
    if (!timeIn || !salesperson || !customerName) {
      return res
        .status(422)
        .json({ message: 'timeIn, salesperson & customerName are required' });
    }

    // Create the record (adjust for your ORM)
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
      origin,
    });

    return res.status(201).json(newLog);
  } catch (err) {
    return next(err);
  }
});

export default router;
