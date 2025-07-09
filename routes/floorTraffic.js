// routes/floorTraffic.js
import express from 'express';
import FloorTrafficModel from '../models/FloorTrafficModel.js';
import supabase from '../lib/supabaseClient.js';

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

    // Attempt to also create a contact record for this customer.
    // Ignore any errors so the floor-traffic entry still persists.
    const name = customerName || `${req.body.first_name ?? ''} ${req.body.last_name ?? ''}`.trim();
    if (name) {
      try {
        const { error } = await supabase
          .from('contacts')
          .insert({
            name,
            email: req.body.email || null,
            phone: req.body.phone || null,
          })
          .single();
        if (error) console.warn('Failed to insert contact record:', error.message);
      } catch (e) {
        console.warn('Failed to insert contact record:', e.message);
      }
    }

    return res.status(201).json(newLog);
  } catch (err) {
    return next(err);
  }
});

/**
 * PUT /api/floor-traffic/:id
 * Update an existing floor-traffic entry.
 */
router.put('/floor-traffic/:id', async (req, res, next) => {
  try {
    const updated = await FloorTrafficModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not Found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

export default router;
