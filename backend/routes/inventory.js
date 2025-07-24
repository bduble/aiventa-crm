// backend/routes/inventory.js
import express from 'express';
import db from '../db.js'; // Your DB connector (must support async/await with query)

const router = express.Router();

// Convert JS camelCase to DB snake_case as needed
function toDbVehicle(body) {
  return {
    stock_number: body.stockNumber,
    vin: body.vin,
    make: body.make,
    model: body.model,
    year: body.year,
    price: body.price,
    mileage: body.mileage,
    color: body.color,
    active: body.active,
  }
}

// GET /api/inventory → list all vehicles
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM vehicles ORDER BY id');
    // Convert snake_case keys to camelCase for the frontend (optional, for better JS convention)
    const vehicles = rows.map(row => ({
      ...row,
      stockNumber: row.stock_number,
      // Remove stock_number so you don't have duplicate data (optional)
    }));
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/inventory → create a new vehicle (with UUID, let the DB default handle uuid if set)
router.post('/', async (req, res) => {
  const data = toDbVehicle(req.body);
  try {
    const { rows } = await db.query(
      `INSERT INTO vehicles 
         (stock_number, vin, make, model, year, price, mileage, color, active) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
       RETURNING *`,
      [
        data.stock_number, data.vin, data.make, data.model,
        data.year, data.price, data.mileage, data.color, data.active
      ]
    );
    // Convert to camelCase for response
    const vehicle = {
      ...rows[0],
      stockNumber: rows[0].stock_number,
    };
    res.status(201).json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/inventory/:id → update an existing vehicle (UUID)
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = toDbVehicle(req.body);

  // Only update fields present in the request body!
  const fields = Object.keys(data).filter(key => data[key] !== undefined);
  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  // Prepare SET clause
  const sets = fields.map((f, i) => `${f}=$${i + 1}`).join(', ');
  const values = fields.map(f => data[f]);

  try {
    const { rows, rowCount } = await db.query(
      `UPDATE vehicles SET ${sets} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });

    // Convert to camelCase for response
    const vehicle = {
      ...rows[0],
      stockNumber: rows[0].stock_number,
    };
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
