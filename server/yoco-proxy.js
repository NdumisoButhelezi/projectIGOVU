import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import admin from '../firebase-admin.js';
const db = admin.firestore();

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175',
  'https://project-igovu.vercel.app'
];

// Use CORS middleware first
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

const YOCO_API_URL = 'https://payments.yoco.com/api';
const YOCO_SECRET_KEY = process.env.VITE_YOCO_SECRET_KEY || process.env.YOCO_SECRET_KEY;

if (!YOCO_SECRET_KEY) {
  console.error('Yoco secret key is not set in environment variables.');
  process.exit(1);
}

app.post('/api/yoco-checkout', async (req, res) => {
  try {
    console.log('Received payload at /api/yoco-checkout:', JSON.stringify(req.body, null, 2)); // Debug log
    const { cartItems, ...payload } = req.body;
    const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    if (payload.metadata) {
      for (const key in payload.metadata) {
        payload.metadata[key] = String(payload.metadata[key]);
      }
    }

    console.log('Forwarding payload to Yoco API:', JSON.stringify(payload, null, 2)); // Debug log

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

    console.log('Response from Yoco API:', JSON.stringify(yocoRes.data, null, 2)); // Debug log
    res.status(yocoRes.status).json(yocoRes.data);

    if (yocoRes.status === 200) {
      console.log('Yoco API Success Code:', yocoRes.status);

      // Subtract stock for each product and log purchased products
      for (const item of cartItems) {
        const { id, quantity } = item;
        try {
          const productRef = db.collection('products').doc(id);
          const productSnap = await productRef.get();
          if (productSnap.exists) {
            const currentStock = productSnap.data().stock || 0;
            const newStock = Math.max(0, currentStock - quantity);
            await productRef.update({ stock: newStock });
            console.log(`Stock updated for product ID ${id}: -${quantity}`);

            // Log purchased product in a separate collection
            await db.collection('purchasedProducts').add({
              productId: id,
              quantity,
              timestamp: admin.firestore.Timestamp.now(),
              productName: productSnap.data().name || 'Unknown',
              price: productSnap.data().price || 0,
            });
          } else {
            console.warn(`Product ID ${id} does not exist in Firestore.`);
          }
        } catch (error) {
          console.error(`Failed to update stock for product ID ${id}:`, error);
        }
      }
    }
  } catch (err) {
    if (err.response) {
      console.error('Yoco API Error:', err.response.data);
      res.status(err.response.status).json({
        error: err.response.data,
      });
    } else {
      console.error('Yoco API Error:', err.message);
      res.status(500).json({
        error: err.message,
      });
    }
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
    if (err.response) {
      console.error('Yoco API Error:', err.response.data);
      res.status(err.response.status).json({
        error: err.response.data,
      });
    } else {
      console.error('Yoco API Error:', err.message);
      res.status(500).json({
        error: err.message,
      });
    }
  }
});

// Add Courier Guy delivery booking endpoint
app.post('/api/courierguy-book', async (req, res) => {
  try {
    // You may want to validate the payload here
    const COURIERGUY_API_URL = 'https://api.thecourierguy.co.za/api/book';
    const COURIERGUY_API_KEY = process.env.COURIERGUY_API_KEY || 'f485e6a4135f44e9bde500d334bf6639';
    const bookingPayload = req.body;
    const courierRes = await axios.post(
      COURIERGUY_API_URL,
      bookingPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${COURIERGUY_API_KEY}`,
        },
      }
    );
    res.status(courierRes.status).json(courierRes.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
});
// Add Shiplogic delivery quote endpoint (real API call)
app.post('/api/courierguy-quote', async (req, res) => {
  try {
    const { collection_address, delivery_address, parcels, declared_value } = req.body;

    // Log the incoming payload for debugging
    console.log('Received payload:', JSON.stringify(req.body, null, 2));

    // Validate required fields in collection_address
    if (
      !collection_address ||
      !collection_address.type ||
      !collection_address.company ||
      !collection_address.street_address ||
      !collection_address.city ||
      !collection_address.zone ||
      !collection_address.country ||
      !collection_address.code ||
      !collection_address.lat ||
      !collection_address.lng
    ) {
      console.error('Validation failed: Missing required fields in collection_address.');
      return res.status(400).json({ error: 'Missing required fields in collection_address.' });
    }

    // Validate required fields in delivery_address
    if (
      !delivery_address ||
      !delivery_address.type ||
      !delivery_address.street_address ||
      !delivery_address.city ||
      !delivery_address.zone ||
      !delivery_address.country ||
      !delivery_address.code ||
      !delivery_address.lat ||
      !delivery_address.lng
    ) {
      console.error('Validation failed: Missing required fields in delivery_address.');
      return res.status(400).json({ error: 'Missing required fields in delivery_address.' });
    }

    // Validate required fields in parcels
    if (!parcels || !Array.isArray(parcels) || parcels.length === 0) {
      console.error('Validation failed: Missing or invalid parcels.');
      return res.status(400).json({ error: 'Missing or invalid parcels.' });
    }

    // Prepare the payload for Shiplogic API
    const shiplogicPayload = {
      collection_address,
      delivery_address,
      parcels,
      declared_value,
      collection_min_date: new Date().toISOString().split('T')[0], // Today's date
      delivery_min_date: new Date().toISOString().split('T')[0], // Today's date
    };

    const SHIPLOGIC_API_URL = 'https://api.shiplogic.com/v2/rates'; // Updated endpoint
    console.log('Sending payload to Shiplogic API:', JSON.stringify(shiplogicPayload, null, 2));

    // Step 1: Get rates from Shiplogic
    const shiplogicRes = await axios.post(
      SHIPLOGIC_API_URL,
      shiplogicPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SHIPLOGIC_API_KEY}`,
        },
      }
    );

    // Log the response from Shiplogic API
    console.log('Shiplogic API Response:', JSON.stringify(shiplogicRes.data, null, 2));

    // Step 2: Return the rates data to the frontend
    res.status(200).json(shiplogicRes.data);
  } catch (err) {
    if (err.response?.status === 404) {
      console.error('Shiplogic API returned 404: Endpoint not found.');
      return res.status(404).json({ error: 'Shiplogic API endpoint not found. Please verify the URL.' });
    }
    if (err.code === 'ENOTFOUND') {
      console.error('DNS resolution error:', err.message);
      return res.status(500).json({ error: 'Unable to resolve Shiplogic API URL. Please check your internet connection or API URL.' });
    }
    console.error('Error in /api/courierguy-quote:', err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
});

app.post('/api/sync-stock', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Missing productId or quantity in request body.' });
    }

    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return res.status(404).json({ error: `Product ID ${productId} does not exist.` });
    }

    const currentStock = productSnap.data().stock || 0;
    const newStock = Math.max(0, currentStock - quantity);

    await productRef.update({ stock: newStock });
    console.log(`Stock updated for product ID ${productId}: -${quantity}`);

    res.status(200).json({ message: `Stock updated for product ID ${productId}.` });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock.' });
  }
});

// Function to process and log old transactions
const processOldTransactions = async () => {
  console.log('Processing old transactions...');
  try {
    // Fetch all transactions from the "transactions" collection
    const transactionsSnap = await db.collection('transactions').get();
    if (transactionsSnap.empty) {
      console.log('No old transactions found.');
      return;
    }

    // Iterate through each transaction
    for (const transactionDoc of transactionsSnap.docs) {
      const transaction = transactionDoc.data();
      const items = transaction.items || [];

      console.log(`Processing transaction ID: ${transactionDoc.id}`);
      console.log('Items in transaction:', items);

      // Iterate through each item in the transaction
      for (const item of items) {
        const { id: productId, quantity } = item;

        try {
          // Fetch the product from the "products" collection
          const productRef = db.collection('products').doc(productId);
          const productSnap = await productRef.get();

          if (productSnap.exists) {
            const currentStock = productSnap.data().stock || 0;
            const newStock = Math.max(0, currentStock - quantity);

            // Update the product stock
            await productRef.update({ stock: newStock });
            console.log(`Stock updated for product ID ${productId}: -${quantity}`);
          } else {
            console.warn(`Product ID ${productId} does not exist in Firestore.`);
          }
        } catch (error) {
          console.error(`Failed to update stock for product ID ${productId}:`, error);
        }
      }
    }

    console.log('Old transactions processed successfully.');
  } catch (error) {
    console.error('Error processing old transactions:', error);
  }
};

// Try to process old transactions and listen for updates, but don't crash if Firebase credentials aren't available
try {
  // Call the function to process old transactions when the server starts
  processOldTransactions();

  // Real-time listener for transactions to update stock
  const syncStockOnTransactionUpdate = () => {
    console.log('Listening for transaction updates...');
    db.collection('transactions').onSnapshot(async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const transaction = change.doc.data();
          const items = transaction.items || [];

          console.log(`New transaction detected: ${change.doc.id}`);
          console.log('Processing items:', items);

          // Iterate through each item in the transaction
          for (const item of items) {
            const { id: productId, quantity } = item;

            try {
              // Fetch the product from the "products" collection
              const productRef = db.collection('products').doc(productId);
              const productSnap = await productRef.get();

              if (productSnap.exists) {
                const currentStock = productSnap.data().stock || 0;
                const newStock = Math.max(0, currentStock - quantity);

                // Update the product stock
                await productRef.update({ stock: newStock });
                console.log(`Stock updated for product ID ${productId}: -${quantity}`);
              } else {
                console.warn(`Product ID ${productId} does not exist in Firestore.`);
              }
            } catch (error) {
              console.error(`Failed to update stock for product ID ${productId}:`, error);
            }
          }
        }
      });
    });
  };
         
  // Call the function to start listening for transaction updates
  syncStockOnTransactionUpdate();
} catch (error) {
  console.error('Firebase functionality disabled due to credential error:', error.message);
  console.log('The server will continue to run for payment processing only.');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Yoco proxy server running on port ${PORT}`);
});
