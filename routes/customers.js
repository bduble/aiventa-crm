import express from 'express';
import supabase from '../lib/supabaseClient.js';

const router = express.Router();

// GET /api/customers
router.get('/customers', async (req, res, next) => {
  try {
    const { q, email, phone } = req.query;
    let query = supabase.from('customers').select('*');
    if (q) query = query.ilike('name', `%${q}%`);
    if (email) query = query.ilike('email', `%${email}%`);
    if (phone) query = query.ilike('phone', `%${phone}%`);
    const { data, error } = await query;
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    const customers = rows.map(c => ({
      ...c,
      name: normalizeCustomerName(c)
    }));
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

// GET /api/customers/:id
router.get('/customers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Customer not found' });
    const customer = {
      ...data,
      name: data.name || [data.first_name, data.last_name].filter(Boolean).join(' ').trim() || 'Unknown Customer',
    };
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers
router.post('/customers', async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/customers/:id
router.patch('/customers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Customer not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/customers/:id
router.delete('/customers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, count } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    if (count === 0) return res.status(404).json({ message: 'Customer not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
