import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Allow both local and Vercel frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://project-igovu.vercel.app'
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '2mb' }));

const YOCO_API_URL = 'https://payments.yoco.com/api';
const YOCO_SECRET_KEY = process.env.VITE_YOCO_SECRET_KEY || process.env.YOCO_SECRET_KEY;

app.post('/api/yoco-checkout', async (req, res) => {
  try {
    const { token, ...payload } = req.body;
    // Idempotency key for safe retries
    const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    // Ensure metadata values are strings
    if (payload.metadata) {
      for (const key in payload.metadata) {
        payload.metadata[key] = String(payload.metadata[key]);
      }
    }
    console.log('Yoco Checkout Payload:', payload);
    const yocoRes = await axios.post(
      `${YOCO_API_URL}/checkouts`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    res.status(yocoRes.status).json(yocoRes.data);
  } catch (err) {
    // Print the full error response from Yoco
    if (err.response) {
      console.error('Yoco API Error:', err.response.data);
    } else {
      console.error('Yoco API Error:', err.message);
    }
    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
});

app.get('/api/yoco-checkout/:id', async (req, res) => {
  try {
    const yocoRes = await axios.get(
      `${YOCO_API_URL}/checkouts/${req.params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.status(yocoRes.status).json(yocoRes.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Yoco proxy server running on port ${PORT}`);
});
