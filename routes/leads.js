// routes/leads.js
import { Op } from "sequelize";
import express from 'express';
import sequelize from '../models/sequelize.js';
import Lead from '../models/Lead.js';

const router = express.Router();

// Ensure table exists
await sequelize.sync();

// Helper to format outstandingResponse
function withOutstandingFlag(lead) {
  const o = lead.last_lead_response_at && (
    !lead.last_staff_response_at ||
    new Date(lead.last_lead_response_at) > new Date(lead.last_staff_response_at) ||
    lead.last_lead_response_channel !== lead.last_staff_response_channel
  );
  return { ...lead.toJSON(), outstandingResponse: Boolean(o) };
}

// GET /api/leads
router.get('/leads', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate) where.created_at = { ...(where.created_at || {}), [Op.gte]: startDate };
    if (endDate) where.created_at = { ...(where.created_at || {}), [Op.lte]: endDate };

    const leads = await Lead.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(leads.map(withOutstandingFlag));
  } catch (err) {
    next(err);
  }
});

// POST /api/leads
router.post('/leads', async (req, res, next) => {
  try {
    const payload = req.body;
    const lead = await Lead.create(payload);
    res.status(201).json(withOutstandingFlag(lead));
  } catch (err) {
    next(err);
  }
});

// POST /api/leads/:id/respond
router.post('/leads/:id/respond', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { channel } = req.body;
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.last_staff_response_at = new Date();
    lead.last_staff_response_channel = channel;
    await lead.save();
    res.json(withOutstandingFlag(lead));
  } catch (err) {
    next(err);
  }
});

export default router;
