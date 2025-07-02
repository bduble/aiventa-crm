// routes/users.js
import express from 'express';
import UserModel from '../models/UserModel.js';

const router = express.Router();

// GET /api/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await UserModel.findAll();
    res.json(users);
  } catch (err) {
    next(err);
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
  }
});

export default router;
