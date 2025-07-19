import express from 'express';
import supabase from '../lib/supabaseClient.js';

const router = express.Router();

function daysToBook(soldDate, bookedDate) {
  if (soldDate && bookedDate) {
    try {
      const sold = new Date(soldDate);
      const booked = new Date(bookedDate);
      const diff = booked - sold;
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  }
  return null;
}

router.get(['/deals', '/deals/'], async (req, res, next) => {
  try {
    const { customer_id, status, month } = req.query;
    let query = supabase.from('deals').select('*');
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (status) query = query.eq('status', status);
    if (month) {
      query = query.gte('sold_date', `${month}-01`).lte('sold_date', `${month}-31`);
    }
    const { data, error } = await query;
    if (error) throw error;
    const deals = (data || []).map(d => ({
      ...d,
      days_to_book: daysToBook(d.sold_date, d.booked_date)
    }));
    res.json(deals);
  } catch (err) {
    next(err);
  }
});

router.get('/deals/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Deal not found' });
    const deal = { ...data, days_to_book: daysToBook(data.sold_date, data.booked_date) };
    res.json(deal);
  } catch (err) {
    next(err);
  }
});

router.post(['/deals', '/deals/'], async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase
      .from('deals')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/deals/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Deal not found' });
    const deal = { ...data, days_to_book: daysToBook(data.sold_date, data.booked_date) };
    res.json(deal);
  } catch (err) {
    next(err);
  }
});

router.post('/deals/:id/unwind', async (req, res, next) => {
  try {
    const reason = req.body?.reason || '';
    const { data, error } = await supabase
      .from('deals')
      .update({
        status: 'Unwound',
        unwind_reason: reason,
        unwind_date: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Deal not found' });
    const deal = { ...data, days_to_book: daysToBook(data.sold_date, data.booked_date) };
    res.json(deal);
  } catch (err) {
    next(err);
  }
});

export default router;
