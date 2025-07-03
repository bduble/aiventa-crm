// backend/app.js
const express = require('express');
const app     = express();
const cors    = require('cors');

app.use(express.json());
app.use(cors());  // configure with your CORS_ORIGINS

// Mount your new inventory router:
const inventoryRouter = require('./routes/inventory');
app.use('/api/inventory', inventoryRouter);

// Your existing floor-traffic router:
// const ftRouter = require('./routes/floor-traffic');
// app.use('/api/floor-traffic', ftRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
