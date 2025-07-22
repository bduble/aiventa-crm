// index.js
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import floorTrafficRouter from '../routes/floorTraffic.js';
import leadsRouter from '../routes/leads.js';
import customersRouter from '../routes/customers.js';
import usersRouter from '../routes/users.js';
import dealsRouter from '../routes/deals.js';
import inventoryRouter from '../backend/routes/inventory.js';
import { startAdfIngestJob } from './jobs/adfIngestJob.js';

const app = express();

// Allow requests from configured origins and detected platform URLs
function buildAllowedOrigins() {
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (process.env.FRONTEND_URL) {
    envOrigins.push(process.env.FRONTEND_URL.replace(/\/+$/, ''));
  }

  if (process.env.VERCEL_URL) {
    envOrigins.push(`https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`);
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    envOrigins.push(`https://${process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '')}`);
  }

  return [...new Set(envOrigins.length ? envOrigins : ['*'])];
}

const allowedOrigins = buildAllowedOrigins();

// Support wildcard subdomains for Vercel preview URLs
function isOriginAllowed(origin) {
  if (!origin) return true; // allow same-origin or non-browser requests
  if (allowedOrigins.includes('*')) return true;
  if (allowedOrigins.includes(origin)) return true;
  return allowedOrigins.some(o => {
    return (
      (o.endsWith('.vercel.app') && origin.endsWith('.vercel.app')) ||
      (o.endsWith('.onrender.com') && origin.endsWith('.onrender.com'))
    );
  });
}

// Configure CORS so the React frontend hosted on Vercel can talk to this API
// when deployed to platforms like Render. By default we allow the production
// domain and any Vercel preview URLs. Additional domains can be supplied via
// the `CORS_ORIGINS` environment variable.
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Built-in middleware to parse JSON
app.use(express.json());

// Health-check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount API routes
app.use('/api', floorTrafficRouter);
app.use('/api', leadsRouter);
app.use('/api', usersRouter);
app.use('/api', customersRouter);
app.use('/api', dealsRouter);
app.use('/api/inventory', inventoryRouter);

// Proxy any remaining /api requests to the FastAPI service
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
app.use('/api', createProxyMiddleware({
  target: FASTAPI_URL,
  changeOrigin: true,
}));

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

// Start background jobs
startAdfIngestJob();
