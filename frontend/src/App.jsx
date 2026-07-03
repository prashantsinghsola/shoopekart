import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import HeroSlider from './components/HeroSlider';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import LoginSignup from './components/LoginSignup';
import UserProfile from './components/UserProfile';
import BrowseCatalog from './components/BrowseCatalog';
import Wishlist from './components/Wishlist';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';

// Default initial data for resilient local fallback
const DEFAULT_CATEGORIES = [
  { _id: 'c1', name: "Men's Clothes", slug: 'men-s-clothes' },
  { _id: 'c2', name: "Women's Clothes", slug: 'women-s-clothes' },
  { _id: 'c3', name: 'Electronics', slug: 'electronics' },
  { _id: 'c4', name: 'Shoes', slug: 'shoes' }
];

const DEFAULT_PRODUCTS = [
  {
    _id: 'p1',
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
    _id: 'p2',
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
    _id: 'p3',
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
    _id: 'p4',
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
    _id: 'p5',
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
    _id: 'p6',
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

const DEFAULT_SETTINGS = {
  logoType: 'text',
  logoText: 'ShopKart',
  logoImage: '',
  heroImages: [],
  footerText: '© 2026 ShopKart. All rights reserved.',
  footerEmail: 'support@shopkart.com',
  footerPhone: '+1 (234) 567-890',
  footerAddress: '123 ShopKart Ave, Commerce City, USA'
};

const API_BASE_URL = 'http://localhost:5000/api';

// =====================================================
// PROTECTED ROUTE: Only for logged-in admin
// =====================================================
function AdminRoute({ isAdminAuthenticated, children }) {
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}

// =====================================================
// PROTECTED ROUTE: Only for logged-in users
// =====================================================
function UserRoute({ currentUser, children }) {
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

// =====================================================
// STOREFRONT PAGE
// =====================================================
function StorePage({ products, categories, settings, cartItems, wishlistItems, isCartOpen, setIsCartOpen, handleAddToCart, handleUpdateCartQuantity, handleRemoveCartItem, handleCheckout, handleSelectProduct, handleToggleWishlist, suggestedProducts, setSuggestedProducts, addToast, activeCategory, setActiveCategory, searchQuery, setSearchQuery }) {
  const dealProducts = products.filter(p => p.isDealOfTheDay);
  const navigate = useNavigate();
  return (
    <main style={{ flexGrow: 1 }}>
      <HeroSlider heroImages={settings.heroImages} />

      {dealProducts.length > 0 && (
        <section className="container home-section">
          <div className="section-title-container">
            <h2 className="section-title">Deals of the Day</h2>
          </div>
          <div className="product-grid">
            {dealProducts.slice(0, 4).map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlistItems.some(i => i._id === product._id)}
                onSelectProduct={handleSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {suggestedProducts.length > 0 && (
        <section className="container home-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '40px 24px', borderRadius: 'var(--radius-lg)', margin: '20px auto', maxWidth: 'calc(100% - 48px)' }}>
          <div className="section-title-container">
            <h2 className="section-title">Suggestions for You</h2>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={() => {
                const shuffled = [...products].sort(() => 0.5 - Math.random());
                setSuggestedProducts(shuffled.slice(0, 4));
                addToast('Updated suggestion list!', 'info');
              }}
            >
              Refresh Items
            </button>
          </div>
          <div className="product-grid">
            {suggestedProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlistItems.some(i => i._id === product._id)}
                onSelectProduct={handleSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      <section className="container home-section" style={{ textAlign: 'center', padding: '60px 20px', borderTop: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Explore Our Complete Inventory</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '500px', marginInline: 'auto' }}>
          Find high-quality clothing, electronics, and shoes with advanced price and rating filters.
        </p>
        <button
          className="btn btn-primary"
          style={{ backgroundColor: '#ff708a', padding: '12px 28px' }}
          onClick={() => { setActiveCategory(null); setSearchQuery(''); navigate('/catalog'); }}
        >
          Browse Full Catalog
        </button>
      </section>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        onSelectProduct={handleSelectProduct}
      />
    </main>
  );
}

// =====================================================
// ADMIN LOGIN PAGE
// =====================================================
function AdminLoginPage({ addToast, setIsAdminAuthenticated }) {
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adminIdInput === 'prashantsinghsola' && adminPasswordInput === 'pssola1234') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('isAdminAuthenticated', 'true');
      addToast('Welcome back, Admin!', 'success');
      navigate('/admin');
    } else {
      addToast('Invalid Admin credentials!', 'error');
    }
  };

  return (
    <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="auth-card animate-slideup" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '40px 32px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ color: '#ff708a', fontWeight: '900', fontSize: '28px', fontFamily: "'Outfit', sans-serif", transform: 'skewX(-6deg)', display: 'inline-block' }}>
            ShopKart Admin
          </span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>Enter your administrator credentials to access dashboard</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Admin ID</label>
            <input type="text" className="form-control" value={adminIdInput} onChange={e => setAdminIdInput(e.target.value)} placeholder="Enter Admin ID" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} placeholder="Enter Password" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#ff708a', color: '#ffffff', width: '100%', padding: '12px', marginTop: '8px', fontWeight: '600' }}>
            Access Admin Panel
          </button>
        </form>
      </div>
    </main>
  );
}

// =====================================================
// MAIN APP
// =====================================================
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dark mode state — persisted in localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('darkMode') === 'true'; } catch { return false; }
  });

  // Apply dark mode class to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const handleToggleDark = () => setIsDarkMode(prev => !prev);

  // Global States
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [profileTab, setProfileTab] = useState('details');
  const [toasts, setToasts] = useState([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try { return localStorage.getItem('isAdminAuthenticated') === 'true'; } catch { return false; }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = localStorage.getItem('currentUser'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [wishlistItems, setWishlistItems] = useState(() => {
    try { const s = localStorage.getItem('wishlist'); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // Track whether the current user has any orders (controls navbar Track Order button)
  const [hasOrders, setHasOrders] = useState(false);

  // Check for orders whenever user logs in/out
  useEffect(() => {
    if (!currentUser) { setHasOrders(false); return; }
    const checkOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders?userId=${currentUser._id}`);
        if (res.ok) {
          const data = await res.json();
          setHasOrders(data.length > 0);
          return;
        }
      } catch {}
      // Fallback: check localStorage offline orders
      try {
        const saved = JSON.parse(localStorage.getItem('offline_orders') || '[]');
        setHasOrders(saved.some(o => o.userId === currentUser._id));
      } catch { setHasOrders(false); }
    };
    checkOrders();
  }, [currentUser]);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Sync tabs via localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      if (e.key === 'wishlist') setWishlistItems(e.newValue ? JSON.parse(e.newValue) : []);
      if (e.key === 'isAdminAuthenticated') setIsAdminAuthenticated(e.newValue === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load suggestions
  useEffect(() => {
    if (products.length > 0) {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setSuggestedProducts(shuffled.slice(0, 4));
    }
  }, [products]);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const [settingsRes, categoriesRes, productsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/settings`),
        fetch(`${API_BASE_URL}/categories`),
        fetch(`${API_BASE_URL}/products`)
      ]);
      if (!settingsRes.ok || !categoriesRes.ok || !productsRes.ok) throw new Error('API failed');
      setSettings(await settingsRes.json());
      setCategories(await categoriesRes.json());
      setProducts(await productsRes.json());
      setIsUsingFallback(false);
    } catch (err) {
      console.warn('API fetch failed, running offline:', err.message);
      setIsUsingFallback(true);
    }
  };
  useEffect(() => { fetchData(); }, []);

  // Toast system
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts([{ id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Cart functions
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i._id === product._id);
      if (exists) {
        addToast(`Increased quantity of ${product.title} in cart.`, 'success');
        return prev.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      addToast(`${product.title} added to cart!`, 'success');
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  const handleUpdateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) { handleRemoveCartItem(productId); return; }
    setCartItems(prev => prev.map(i => i._id === productId ? { ...i, quantity } : i));
  };
  const handleRemoveCartItem = (productId) => {
    const item = cartItems.find(i => i._id === productId);
    setCartItems(prev => prev.filter(i => i._id !== productId));
    if (item) addToast(`${item.title} removed from cart.`, 'info');
  };
  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // Wishlist
  const handleToggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.find(i => i._id === product._id);
      const updated = exists ? prev.filter(i => i._id !== product._id) : [...prev, product];
      if (exists) addToast(`Removed "${product.title}" from wishlist.`, 'info');
      else addToast(`Added "${product.title}" to wishlist!`, 'success');
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Product navigation
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    navigate(`/product/${product._id}`);
  };

  // Settings API
  const handleUpdateSettings = async (updatedData) => {
    if (isUsingFallback) { setSettings(updatedData); addToast('Settings saved locally!', 'success'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
      if (!res.ok) throw new Error('Failed to update settings');
      setSettings(await res.json());
      addToast('Site settings updated successfully!', 'success');
    } catch { addToast('Failed to update settings', 'error'); }
  };

  // Categories API
  const handleAddCategory = async (name) => {
    if (isUsingFallback) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) { addToast('Category already exists!', 'error'); return; }
      setCategories(prev => [...prev, { _id: 'cat_' + Math.random().toString(36).substr(2, 9), name, slug }]);
      addToast(`Category "${name}" added!`, 'success'); return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const newCat = await res.json();
      setCategories(prev => [...prev, newCat]);
      addToast(`Category "${name}" added!`, 'success');
    } catch (err) { addToast(err.message, 'error'); }
  };
  const handleDeleteCategory = async (id) => {
    if (isUsingFallback) { setCategories(prev => prev.filter(c => c._id !== id)); addToast('Category deleted.', 'info'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setCategories(prev => prev.filter(c => c._id !== id));
      addToast('Category deleted!', 'success');
    } catch { addToast('Error deleting category', 'error'); }
  };

  // Products API
  const handleAddProduct = async (productData) => {
    if (isUsingFallback) {
      setProducts(prev => [{ _id: 'prod_' + Math.random().toString(36).substr(2, 9), ...productData }, ...prev]);
      addToast(`Product "${productData.title}" added locally!`, 'success'); return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
      if (!res.ok) throw new Error('Failed to save product');
      const saved = await res.json();
      setProducts(prev => [saved, ...prev]);
      addToast(`Product "${productData.title}" saved!`, 'success');
    } catch { addToast('Error saving product', 'error'); }
  };
  const handleDeleteProduct = async (id) => {
    if (isUsingFallback) { setProducts(prev => prev.filter(p => p._id !== id)); addToast('Product removed locally.', 'info'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts(prev => prev.filter(p => p._id !== id));
      addToast('Product removed!', 'success');
    } catch { addToast('Error removing product', 'error'); }
  };
  const handleUpdateProduct = async (id, updateData) => {
    if (isUsingFallback) {
      setProducts(prev => prev.map(p => p._id === id ? { ...p, ...updateData } : p));
      addToast('Product updated locally.', 'success'); return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setProducts(prev => prev.map(p => p._id === id ? updated : p));
      addToast('Product updated!', 'success');
    } catch { addToast('Error updating product', 'error'); }
  };

  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/auth';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div className={`toast ${t.type}`} key={t.id}>
            {t.type === 'success' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--color-success)' }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            {t.type === 'error' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--color-danger)' }}>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <Navbar
        settings={settings}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onCartOpen={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentPage={location.pathname.replace('/', '') || 'store'}
        setCurrentPage={(page) => navigate(page === 'store' ? '/' : `/${page}`)}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
          navigate('/');
          addToast('Logged out successfully.', 'info');
        }}
        products={products}
        onSelectProduct={handleSelectProduct}
        hasOrders={hasOrders}
        onTrackOrder={() => {
          setProfileTab('orders');
          navigate('/profile');
        }}
        isDarkMode={isDarkMode}
        onToggleDark={handleToggleDark}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLogout={() => {
          setIsAdminAuthenticated(false);
          localStorage.removeItem('isAdminAuthenticated');
          navigate('/');
          addToast('Logged out of admin panel.', 'info');
        }}
      />

      {/* Offline Banner */}
      {isUsingFallback && (
        <div style={{ backgroundColor: 'var(--color-warning)', color: '#000', fontSize: 13, padding: '6px 24px', fontWeight: 600, textAlign: 'center' }}>
          Running in Offline Demo Mode. Start the server on port 5000 to enable database persistence.
        </div>
      )}

      {/* Category Bar (hidden on admin/auth pages) */}
      {!isAdminPage && !isAuthPage && (
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={(slug) => {
            setActiveCategory(slug);
            navigate(slug ? `/catalog?category=${slug}` : '/catalog');
          }}
          onGoHome={() => {
            setActiveCategory(null);
            setSearchQuery('');
            navigate('/');
          }}
          isHomeActive={location.pathname === '/'}
        />
      )}

      {/* ===================== ROUTES ===================== */}
      <Routes>

        {/* HOME / STORE */}
        <Route path="/" element={
          <StorePage
            products={products}
            categories={categories}
            settings={settings}
            cartItems={cartItems}
            wishlistItems={wishlistItems}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            handleAddToCart={handleAddToCart}
            handleUpdateCartQuantity={handleUpdateCartQuantity}
            handleRemoveCartItem={handleRemoveCartItem}
            handleCheckout={handleCheckout}
            handleSelectProduct={handleSelectProduct}
            handleToggleWishlist={handleToggleWishlist}
            suggestedProducts={suggestedProducts}
            setSuggestedProducts={setSuggestedProducts}
            addToast={addToast}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        } />

        {/* CATALOG */}
        <Route path="/catalog" element={
          <main style={{ flexGrow: 1 }}>
            <BrowseCatalog
              products={products}
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistItems={wishlistItems}
              onSelectProduct={handleSelectProduct}
            />
            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onCheckout={handleCheckout}
              onSelectProduct={handleSelectProduct}
            />
          </main>
        } />

        {/* PRODUCT DETAIL */}
        <Route path="/product/:id" element={
          <main style={{ flexGrow: 1 }}>
            <ProductDetailRoute
              products={products}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistItems={wishlistItems}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
              cartItems={cartItems}
              handleUpdateCartQuantity={handleUpdateCartQuantity}
              handleRemoveCartItem={handleRemoveCartItem}
              handleCheckout={handleCheckout}
              handleSelectProduct={handleSelectProduct}
            />
          </main>
        } />

        {/* WISHLIST */}
        <Route path="/wishlist" element={
          <main style={{ flexGrow: 1 }}>
            <Wishlist
              wishlistItems={wishlistItems}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onSelectProduct={handleSelectProduct}
            />
            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onCheckout={handleCheckout}
              onSelectProduct={handleSelectProduct}
            />
          </main>
        } />

        {/* AUTH */}
        <Route path="/auth" element={
          currentUser ? <Navigate to="/profile" replace /> :
          <LoginSignup
            onLogin={(user) => {
              setCurrentUser(user);
              localStorage.setItem('currentUser', JSON.stringify(user));
              navigate('/');
            }}
            addToast={addToast}
            isUsingFallback={isUsingFallback}
          />
        } />

        {/* USER PROFILE */}
        <Route path="/profile" element={
          <UserRoute currentUser={currentUser}>
            <UserProfile
              currentUser={currentUser}
              onUpdateProfile={(updatedUser) => {
                setCurrentUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
              }}
              onLogout={() => {
                setCurrentUser(null);
                localStorage.removeItem('currentUser');
                navigate('/');
                addToast('Logged out successfully.', 'info');
              }}
              addToast={addToast}
              isUsingFallback={isUsingFallback}
              initialTab={profileTab}
            />
          </UserRoute>
        } />

        {/* CHECKOUT */}
        <Route path="/checkout" element={
          <main style={{ flexGrow: 1 }}>
            <Checkout
              cartItems={cartItems}
              currentUser={currentUser}
              onOrderSuccess={() => { setCartItems([]); setHasOrders(true); }}
              onBackToShopping={(targetPage) => {
                if (targetPage === 'profile') {
                  setProfileTab('orders');
                  navigate('/profile');
                } else {
                  navigate('/');
                }
              }}
              addToast={addToast}
              isUsingFallback={isUsingFallback}
            />
          </main>
        } />

        {/* ADMIN LOGIN */}
        <Route path="/admin-login" element={
          isAdminAuthenticated ? <Navigate to="/admin" replace /> :
          <AdminLoginPage addToast={addToast} setIsAdminAuthenticated={setIsAdminAuthenticated} />
        } />

        {/* ADMIN PANEL */}
        <Route path="/admin" element={
          <AdminRoute isAdminAuthenticated={isAdminAuthenticated}>
            <main style={{ flexGrow: 1 }}>
              <AdminPanel
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                categories={categories}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                products={products}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateProduct={handleUpdateProduct}
                addToast={addToast}
                onAdminLogout={() => {
                  setIsAdminAuthenticated(false);
                  localStorage.removeItem('isAdminAuthenticated');
                  navigate('/');
                  addToast('Logged out of admin panel.', 'info');
                }}
                onViewStore={() => navigate('/')}
              />
            </main>
          </AdminRoute>
        } />

        {/* CATCH ALL - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {/* Footer */}
      <Footer settings={settings} />
    </div>
  );
}

// =====================================================
// Product Detail Route Handler (reads :id from URL)
// =====================================================
function ProductDetailRoute({ products, selectedProduct, setSelectedProduct, onAddToCart, onToggleWishlist, wishlistItems, isCartOpen, setIsCartOpen, cartItems, handleUpdateCartQuantity, handleRemoveCartItem, handleCheckout, handleSelectProduct }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find product from URL param
  const product = selectedProduct?._id === id
    ? selectedProduct
    : products.find(p => p._id === id);

  useEffect(() => {
    if (product) setSelectedProduct(product);
  }, [product]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="btn btn-primary" style={{ backgroundColor: '#ff708a', marginTop: 20 }} onClick={() => navigate('/')}>
          Back to Store
        </button>
      </div>
    );
  }

  return (
    <>
      <ProductDetail
        product={product}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isWishlisted={wishlistItems.some(i => i._id === product._id)}
        onBack={() => navigate(-1)}
      />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        onSelectProduct={handleSelectProduct}
      />
    </>
  );
}

export default App;
