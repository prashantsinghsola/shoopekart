import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ES Module dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api', apiRouter);

// Root Hello Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ShopKart REST API is running' });
});

// Database Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopkart';

console.log('Attempting to connect to MongoDB at:', mongoUri);
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((err) => {
    console.error('========================================================');
    console.error('WARNING: Could not connect to MongoDB database.');
    console.error(err.message);
    console.error('ShopKart server will run in JSON File Fallback mode.');
    console.error('========================================================');
  });

// Start Server
app.listen(PORT, () => {
  console.log(`ShopKart Backend Server is listening on http://localhost:${PORT}`);
});
