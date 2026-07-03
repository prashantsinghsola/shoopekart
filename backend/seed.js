import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Category, Product, Settings } from './models/Schema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Categories Seed Data
const initialCategories = [
  { name: "Men's Clothes", slug: "men-s-clothes" },
  { name: "Women's Clothes", slug: "women-s-clothes" },
  { name: "Electronics", slug: "electronics" },
  { name: "Shoes", slug: "shoes" }
];

// Initial Products Seed Data
const initialProducts = [
  {
    title: "Premium Men's Leather Jacket",
    description: "Handcrafted genuine leather jacket. Perfect for autumn and winter.",
    price: 189.99,
    discountPrice: 149.99,
    category: "Men's Clothes",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    isDealOfTheDay: true
  },
  {
    title: "Elegant Summer Floral Dress",
    description: "Flowy, breathable summer dress made from organic cotton.",
    price: 79.99,
    discountPrice: 59.99,
    category: "Women's Clothes",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    isDealOfTheDay: false
  },
  {
    title: "Ultra Bass Bluetooth Headphones",
    description: "Over-ear active noise cancelling headphones with 40-hour battery life.",
    price: 120.00,
    discountPrice: 99.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    isDealOfTheDay: true
  },
  {
    title: "Performance Athletic Running Shoes",
    description: "Lightweight mesh knit running sneakers with impact-cushioning soles.",
    price: 95.00,
    discountPrice: 0,
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    rating: 4.4,
    isDealOfTheDay: false
  },
  {
    title: "Classic White Sneakers",
    description: "Minimalist leather sneaker. Goes with everything.",
    price: 85.00,
    discountPrice: 65.00,
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    isDealOfTheDay: false
  },
  {
    title: "Smart Sports Fitness Band",
    description: "Heart rate monitor, step tracker, sleep analyzer, and water resistant.",
    price: 49.99,
    discountPrice: 39.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80",
    rating: 4.2,
    isDealOfTheDay: true
  }
];

// Initial Settings Seed Data
const initialSettings = {
  key: 'site_settings',
  logoType: 'text',
  logoText: 'ShopKart',
  logoImage: '',
  heroImages: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80'
  ],
  footerText: '© 2026 ShopKart. All rights reserved.',
  footerEmail: 'support@shopkart.com',
  footerPhone: '+1 (234) 567-890',
  footerAddress: '123 ShopKart Ave, Commerce City, USA'
};

const writeToJSONFiles = () => {
  console.log('Writing seed data to JSON fallback files...');
  fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(
    initialCategories.map((c, i) => ({ _id: `cat_${i + 1}`, ...c, createdAt: new Date().toISOString() })), null, 2
  ));
  fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(
    initialProducts.map((p, i) => ({ _id: `prod_${i + 1}`, ...p, createdAt: new Date().toISOString() })), null, 2
  ));
  fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(initialSettings, null, 2));
  console.log('JSON fallback files written successfully.');
};

const runSeeder = async () => {
  // Always write JSON files
  writeToJSONFiles();

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopkart';
  console.log('Connecting to MongoDB for seeding:', mongoUri);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Seed Categories
    await Category.deleteMany({});
    const createdCats = await Category.insertMany(initialCategories);
    console.log(`Seeded ${createdCats.length} categories.`);

    // Seed Products
    await Product.deleteMany({});
    const createdProds = await Product.insertMany(initialProducts);
    console.log(`Seeded ${createdProds.length} products.`);

    // Seed Settings
    await Settings.deleteMany({});
    const settings = new Settings(initialSettings);
    await settings.save();
    console.log('Seeded global store settings.');

    console.log('MongoDB Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('========================================================');
    console.error('MongoDB connection failed. Mongoose seeding skipped.');
    console.error(err.message);
    console.error('The application will proceed fully in local JSON Mode.');
    console.error('========================================================');
    process.exit(0);
  }
};

runSeeder();
