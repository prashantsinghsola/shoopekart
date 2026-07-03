import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  category: { type: String, required: true },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  rating: { type: Number, default: 4.5 },
  isDealOfTheDay: { type: Boolean, default: false }
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'site_settings' },
  logoType: { type: String, enum: ['text', 'image'], default: 'text' },
  logoText: { type: String, default: 'ShopKart' },
  logoImage: { type: String, default: '' },
  heroImages: { type: [String], default: [] },
  footerText: { type: String, default: '© 2026 ShopKart. All rights reserved.' },
  footerEmail: { type: String, default: 'support@shopkart.com' },
  footerPhone: { type: String, default: '+1 (234) 567-890' },
  footerAddress: { type: String, default: '123 ShopKart Ave, Commerce City, USA' }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  userId: { type: String, default: '' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  cartItems: { type: Array, required: true },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMode: { type: String, enum: ['COD', 'Pay Online'], required: true },
  status: { type: String, enum: ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

export const Category = mongoose.model('Category', CategorySchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Settings = mongoose.model('Settings', SettingsSchema);
export const User = mongoose.model('User', UserSchema);
export const Order = mongoose.model('Order', OrderSchema);
