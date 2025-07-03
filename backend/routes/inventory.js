// backend/routes/inventory.js
const express = require('express');
const router  = express.Router();
// assume you have a `db` module to talk to Postgres:
const db      = require('../db');  

// GET /api/inventory → list all vehicles
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM vehicles ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/inventory → create a new vehicle
router.post('/', async (req, res) => {
  const { stockNumber, vin, make, model, year, price, mileage, color, active } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO vehicles 
         (stock_number, vin, make, model, year, price, mileage, color, active) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
       RETURNING *`,
      [stockNumber, vin, make, model, year, price, mileage, color, active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/inventory/:id → update an existing vehicle
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  // build a dynamic SET clause or explicitly list fields
  const fields = ['stock_number','vin','make','model','year','price','mileage','color','active'];
  const sets   = fields.map((f,i) => `${f}=$${i+1}`).join(',');
  const values = fields.map(f => req.body[f.replace('_','')]);
  try {
    const result = await db.query(
      `UPDATE vehicles SET ${sets} WHERE id=$${fields.length+1} RETURNING *`,
      [...values, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
