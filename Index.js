import express from 'express';
import floorTrafficRouter from './routes/floorTraffic.js';

const app = express();

// built-in middleware to parse JSON bodies
app.use(express.json());

// mount all /floor-traffic routes under /api
// (matches your frontend’s proxy to /api/floor-traffic)
app.use('/api', floorTrafficRouter);

// error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
