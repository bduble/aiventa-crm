// routes/users.js
import express from 'express';

import UserModel from '../models/UserModel.js';

import supabase from '../lib/supabaseClient.js';


const router = express.Router();

// GET /api/users
router.get('/users', async (req, res, next) => {
  try {

    const users = await UserModel.findAll();
    res.json(users);
  } catch (err) {
    next(err);

    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// GET /api/users/:id
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'User not found' });
    return res.json(data);
  } catch (err) {
    return next(err);

  }
});

// POST /api/users
router.post('/users', async (req, res, next) => {
  try {

    const { name, email, role, active, permissions } = req.body;
    if (!name || !email) {
      return res.status(422).json({ message: 'name and email are required' });
    }
    const user = await UserModel.create({ name, email, role, active, permissions });
    res.status(201).json(user);
  } catch (err) {
    next(err);

    const payload = req.body;
    const { data, error } = await supabase.from('users').insert(payload).select('*').single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    return next(err);

  }
});

// PUT /api/users/:id
router.put('/users/:id', async (req, res, next) => {
  try {

    const updated = await UserModel.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);

    const { id } = req.params;
    const payload = req.body;
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'User not found' });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, count } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    if (count === 0) return res.status(404).json({ message: 'User not found' });
    return res.status(204).send();
  } catch (err) {
    return next(err);

  }
});

export default router;
