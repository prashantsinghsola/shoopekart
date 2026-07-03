import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Category, Product, Settings, User, Order } from '../models/Schema.js';

const router = express.Router();

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// JSON Fallback Paths
const CATEGORIES_FILE = path.join(dataDir, 'categories.json');
const PRODUCTS_FILE = path.join(dataDir, 'products.json');
const SETTINGS_FILE = path.join(dataDir, 'settings.json');
const USERS_FILE = path.join(dataDir, 'users.json');
const ORDERS_FILE = path.join(dataDir, 'orders.json');

// Initialize JSON files if they don't exist
if (!fs.existsSync(CATEGORIES_FILE)) fs.writeFileSync(CATEGORIES_FILE, JSON.stringify([]));
if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]));
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
if (!fs.existsSync(SETTINGS_FILE)) {
  const defaultSettings = {
    logoType: 'text',
    logoText: 'ShopKart',
    logoImage: '',
    heroImages: [],
    footerText: '© 2026 ShopKart. All rights reserved.',
    footerEmail: 'support@shopkart.com',
    footerPhone: '+1 (234) 567-890',
    footerAddress: '123 ShopKart Ave, Commerce City, USA'
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings));
}

// Check if mongoose is connected
const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Multer storage configuration for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Image Upload Endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const relativePath = `/uploads/${req.file.filename}`;
  res.json({ url: relativePath });
});

// JSON Helpers
const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJSON = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================
router.get('/categories', async (req, res) => {
  try {
    if (isDbConnected()) {
      const categories = await Category.find();
      return res.json(categories);
    } else {
      const categories = readJSON(CATEGORIES_FILE);
      return res.json(categories);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    if (isDbConnected()) {
      const newCategory = new Category({ name, slug });
      await newCategory.save();
      res.status(201).json(newCategory);
    } else {
      const categories = readJSON(CATEGORIES_FILE);
      const exists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
      if (exists) return res.status(400).json({ error: 'Category already exists' });
      
      const newCategory = {
        _id: 'cat_' + Math.random().toString(36).substr(2, 9),
        name,
        slug,
        createdAt: new Date().toISOString()
      };
      categories.push(newCategory);
      writeJSON(CATEGORIES_FILE, categories);
      res.status(201).json(newCategory);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Category.findByIdAndDelete(id);
      res.json({ message: 'Category deleted successfully' });
    } else {
      let categories = readJSON(CATEGORIES_FILE);
      categories = categories.filter(c => c._id !== id);
      writeJSON(CATEGORIES_FILE, categories);
      res.json({ message: 'Category deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================
router.get('/products', async (req, res) => {
  try {
    const { search, category, type } = req.query;
    let products = [];
    
    if (isDbConnected()) {
      let query = {};
      if (category) query.category = category;
      if (search) query.title = { $regex: search, $options: 'i' };
      
      products = await Product.find(query);
    } else {
      products = readJSON(PRODUCTS_FILE);
      if (category) {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        products = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
      }
    }

    if (type === 'random') {
      // Shuffle products array and take up to 4 items for Suggestion for You
      products = products.sort(() => 0.5 - Math.random()).slice(0, 4);
    } else if (type === 'deal') {
      products = products.filter(p => p.isDealOfTheDay);
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { title, description, price, discountPrice, category, image, images, rating, isDealOfTheDay } = req.body;
    if (!title || !price || !category || !image) {
      return res.status(400).json({ error: 'Title, price, category, and image are required' });
    }

    const productData = {
      title,
      description: description || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category,
      image,
      images: images && images.length > 0 ? images : [image],
      rating: rating ? Number(rating) : 4.5,
      isDealOfTheDay: !!isDealOfTheDay
    };

    if (isDbConnected()) {
      const newProduct = new Product(productData);
      await newProduct.save();
      res.status(201).json(newProduct);
    } else {
      const products = readJSON(PRODUCTS_FILE);
      const newProduct = {
        _id: 'prod_' + Math.random().toString(36).substr(2, 9),
        ...productData,
        createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      writeJSON(PRODUCTS_FILE, products);
      res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.discountPrice !== undefined) updateData.discountPrice = Number(updateData.discountPrice);
    if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
    if (updateData.images && updateData.images.length > 0) {
      updateData.image = updateData.images[0];
    }

    if (isDbConnected()) {
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
      res.json(updatedProduct);
    } else {
      const products = readJSON(PRODUCTS_FILE);
      const index = products.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });
      
      products[index] = { ...products[index], ...updateData, updatedAt: new Date().toISOString() };
      writeJSON(PRODUCTS_FILE, products);
      res.json(products[index]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Product.findByIdAndDelete(id);
      res.json({ message: 'Product deleted successfully' });
    } else {
      let products = readJSON(PRODUCTS_FILE);
      products = products.filter(p => p._id !== id);
      writeJSON(PRODUCTS_FILE, products);
      res.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    if (isDbConnected()) {
      let settings = await Settings.findOne({ key: 'site_settings' });
      if (!settings) {
        settings = new Settings({ key: 'site_settings' });
        await settings.save();
      }
      res.json(settings);
    } else {
      const settings = readJSON(SETTINGS_FILE);
      res.json(settings);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const updateData = req.body;
    if (isDbConnected()) {
      const settings = await Settings.findOneAndUpdate(
        { key: 'site_settings' },
        updateData,
        { new: true, upsert: true }
      );
      res.json(settings);
    } else {
      const settings = readJSON(SETTINGS_FILE);
      const updated = { ...settings, ...updateData };
      writeJSON(SETTINGS_FILE, updated);
      res.json(updated);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings/hero', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

    if (isDbConnected()) {
      const settings = await Settings.findOne({ key: 'site_settings' }) || new Settings({ key: 'site_settings' });
      settings.heroImages.push(imageUrl);
      await settings.save();
      res.json(settings);
    } else {
      const settings = readJSON(SETTINGS_FILE);
      settings.heroImages = settings.heroImages || [];
      settings.heroImages.push(imageUrl);
      writeJSON(SETTINGS_FILE, settings);
      res.json(settings);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/settings/hero', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

    if (isDbConnected()) {
      const settings = await Settings.findOne({ key: 'site_settings' });
      if (settings) {
        settings.heroImages = settings.heroImages.filter(img => img !== imageUrl);
        await settings.save();
      }
      res.json(settings);
    } else {
      const settings = readJSON(SETTINGS_FILE);
      settings.heroImages = (settings.heroImages || []).filter(img => img !== imageUrl);
      writeJSON(SETTINGS_FILE, settings);
      res.json(settings);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// USER AUTH & PROFILE ENDPOINTS
// ==========================================
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (isDbConnected()) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ error: 'Email already registered' });

      const newUser = new User({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || '',
        address: address || ''
      });
      await newUser.save();
      
      const userObj = newUser.toObject();
      delete userObj.password;
      return res.status(201).json(userObj);
    } else {
      const users = readJSON(USERS_FILE);
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) return res.status(400).json({ error: 'Email already registered' });

      const newUser = {
        _id: 'user_' + Math.random().toString(36).substr(2, 9),
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || '',
        address: address || '',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      writeJSON(USERS_FILE, users);
      
      const userObj = { ...newUser };
      delete userObj.password;
      return res.status(201).json(userObj);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email: email.toLowerCase(), password });
      if (!user) return res.status(400).json({ error: 'Invalid email or password' });

      const userObj = user.toObject();
      delete userObj.password;
      return res.json(userObj);
    } else {
      const users = readJSON(USERS_FILE);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) return res.status(400).json({ error: 'Invalid email or password' });

      const userObj = { ...user };
      delete userObj.password;
      return res.json(userObj);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/auth/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (password) updateData.password = password;

    if (isDbConnected()) {
      const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ error: 'User not found' });
      
      const userObj = updated.toObject();
      delete userObj.password;
      return res.json(userObj);
    } else {
      const users = readJSON(USERS_FILE);
      const index = users.findIndex(u => u._id === id);
      if (index === -1) return res.status(404).json({ error: 'User not found' });

      users[index] = { ...users[index], ...updateData, updatedAt: new Date().toISOString() };
      writeJSON(USERS_FILE, users);

      const userObj = { ...users[index] };
      delete userObj.password;
      return res.json(userObj);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================
router.get('/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    if (isDbConnected()) {
      let query = {};
      if (userId) query.userId = userId;
      const orders = await Order.find(query).sort({ createdAt: -1 });
      res.json(orders);
    } else {
      let orders = readJSON(ORDERS_FILE);
      if (userId) {
        orders = orders.filter(o => o.userId === userId);
      }
      // Sort desc by createdAt
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { userId, name, email, phone, address, cartItems, subtotal, shipping, total, paymentMode } = req.body;
    if (!name || !email || !phone || !address || !cartItems || !total || !paymentMode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const orderData = {
      userId: userId || '',
      name,
      email,
      phone,
      address,
      cartItems,
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      total: Number(total),
      paymentMode,
      status: 'Pending'
    };

    if (isDbConnected()) {
      const newOrder = new Order(orderData);
      await newOrder.save();
      res.status(201).json(newOrder);
    } else {
      const orders = readJSON(ORDERS_FILE);
      const newOrder = {
        _id: 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        ...orderData,
        createdAt: new Date().toISOString()
      };
      orders.push(newOrder);
      writeJSON(ORDERS_FILE, orders);
      res.status(201).json(newOrder);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    if (isDbConnected()) {
      const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
      if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
      res.json(updatedOrder);
    } else {
      const orders = readJSON(ORDERS_FILE);
      const index = orders.findIndex(o => o._id === id);
      if (index === -1) return res.status(404).json({ error: 'Order not found' });

      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      writeJSON(ORDERS_FILE, orders);
      res.json(orders[index]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
