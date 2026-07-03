import React, { useState, useEffect } from 'react';
import ImageCropper from './ImageCropper';

export default function AdminPanel({
  settings,
  onUpdateSettings,
  categories,
  onAddCategory,
  onDeleteCategory,
  products,
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
  addToast,
  onViewStore,
  onAdminLogout
}) {
  const [activeTab, setActiveTab] = useState('settings');

  // Orders State & Handlers
  const [adminOrders, setAdminOrders] = useState([]);
  const [isAdminOrdersLoading, setIsAdminOrdersLoading] = useState(false);

  const fetchAdminOrders = async () => {
    setIsAdminOrdersLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setAdminOrders(data);
    } catch (err) {
      console.warn('Failed to fetch admin orders from DB, trying offline storage:', err.message);
      
      // Resilient local fallback from localStorage
      const savedOrders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
      savedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAdminOrders(savedOrders);
    } finally {
      setIsAdminOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchAdminOrders();
    }
  }, [activeTab]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      
      setAdminOrders(prev => prev.map(o => o._id === orderId ? updated : o));
      addToast(`Order status updated to "${newStatus}"`, 'success');
    } catch (err) {
      console.warn('Failed to update status in DB, updating locally:', err.message);
      
      // Update local storage offline orders
      const savedOrders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
      const updatedOrders = savedOrders.map(o => {
        if (o._id === orderId) {
          return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return o;
      });
      localStorage.setItem('offline_orders', JSON.stringify(updatedOrders));

      setAdminOrders(prev => prev.map(o => {
        if (o._id === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      }));
      addToast(`Offline Order updated to "${newStatus}"`, 'success');
    }
  };

  // Cropper Modal State
  const [cropState, setCropState] = useState({
    isOpen: false,
    imageSrc: '',
    aspectRatio: 1,
    onCrop: null
  });

  // Helper: Convert Base64 data-URL to Blob File
  const base64ToBlob = (base64Data, filename) => {
    const arr = base64Data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Helper: Upload Cropped Image File to Server
  const uploadImageToServer = async (base64Image, filename) => {
    try {
      const file = base64ToBlob(base64Image, filename);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload server error');
      const data = await res.json();
      return data.url; // Relative path, e.g., /uploads/image-123.jpg
    } catch (err) {
      console.warn('Multer upload failed, falling back to base64 storing:', err.message);
      return base64Image; // Fallback to raw base64 string
    }
  };

  // ==========================================
  // TAB 1: SITE SETTINGS STATE & HANDLERS
  // ==========================================
  const [logoType, setLogoType] = useState(settings.logoType || 'text');
  const [logoText, setLogoText] = useState(settings.logoText || 'ShopKart');
  const [logoImage, setLogoImage] = useState(settings.logoImage || '');
  const [footerText, setFooterText] = useState(settings.footerText || '');
  const [footerEmail, setFooterEmail] = useState(settings.footerEmail || '');
  const [footerPhone, setFooterPhone] = useState(settings.footerPhone || '');
  const [footerAddress, setFooterAddress] = useState(settings.footerAddress || '');

  useEffect(() => {
    if (settings) {
      setLogoType(settings.logoType || 'text');
      setLogoText(settings.logoText || 'ShopKart');
      setLogoImage(settings.logoImage || '');
      setFooterText(settings.footerText || '');
      setFooterEmail(settings.footerEmail || '');
      setFooterPhone(settings.footerPhone || '');
      setFooterAddress(settings.footerAddress || '');
    }
  }, [settings]);

  const handleLogoImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropState({
        isOpen: true,
        imageSrc: reader.result,
        aspectRatio: 3, // Logo aspect ratio (wide)
        onCrop: async (croppedBase64) => {
          addToast('Processing logo crop...', 'info');
          const finalUrl = await uploadImageToServer(croppedBase64, 'logo.jpg');
          setLogoImage(finalUrl);
          setCropState(prev => ({ ...prev, isOpen: false }));
          addToast('Logo crop completed!', 'success');
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    onUpdateSettings({
      logoType,
      logoText,
      logoImage,
      footerText,
      footerEmail,
      footerPhone,
      footerAddress
    });
  };

  // ==========================================
  // TAB 2: HERO SLIDER HANDLERS
  // ==========================================
  const handleAddHeroSlide = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropState({
        isOpen: true,
        imageSrc: reader.result,
        aspectRatio: 21 / 9, // Banner aspect ratio (very wide)
        onCrop: async (croppedBase64) => {
          addToast('Uploading cropped slide...', 'info');
          const uploadedUrl = await uploadImageToServer(croppedBase64, `slide-${Date.now()}.jpg`);

          try {
            const res = await fetch('http://localhost:5000/api/settings/hero', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl: uploadedUrl })
            });
            if (!res.ok) throw new Error('Failed to save slide');
            const updatedSettings = await res.json();
            onUpdateSettings(updatedSettings); // Sync settings globally
            addToast('Hero slide added successfully!', 'success');
          } catch (err) {
            addToast('Error saving hero slide', 'error');
          }
          setCropState(prev => ({ ...prev, isOpen: false }));
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleDeleteHeroSlide = async (url) => {
    if (!window.confirm('Delete this banner slide?')) return;
    try {
      const res = await fetch('http://localhost:5000/api/settings/hero', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url })
      });
      if (!res.ok) throw new Error('Failed to delete slide');
      const updatedSettings = await res.json();
      onUpdateSettings(updatedSettings);
      addToast('Hero slide removed!', 'success');
    } catch (err) {
      addToast('Error deleting hero slide', 'error');
    }
  };

  // ==========================================
  // TAB 3: CATEGORY STATE & HANDLERS
  // ==========================================
  const [newCatName, setNewCatName] = useState('');

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName);
    setNewCatName('');
  };

  // ==========================================
  // TAB 4: PRODUCT STATE & HANDLERS
  // ==========================================
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodImage2, setProdImage2] = useState('');
  const [prodImage3, setProdImage3] = useState('');
  const [prodRating, setProdRating] = useState('4.5');
  const [prodDeal, setProdDeal] = useState(false);

  // Default to first category if available
  useEffect(() => {
    if (categories.length > 0 && !prodCat) {
      setProdCat(categories[0].name);
    }
  }, [categories, prodCat]);

  const handleProductImageSelectIndexed = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropState({
        isOpen: true,
        imageSrc: reader.result,
        aspectRatio: 1, // Products are always square
        onCrop: async (croppedBase64) => {
          addToast(`Uploading cropped product image ${index}...`, 'info');
          const uploadedUrl = await uploadImageToServer(croppedBase64, `product-${index}-${Date.now()}.jpg`);
          if (index === 1) {
            setProdImage(uploadedUrl);
          } else if (index === 2) {
            setProdImage2(uploadedUrl);
          } else if (index === 3) {
            setProdImage3(uploadedUrl);
          }
          setCropState(prev => ({ ...prev, isOpen: false }));
          addToast(`Product image ${index} cropped and ready!`, 'success');
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!prodTitle || !prodPrice || !prodCat || !prodImage) {
      addToast('Please fill out all required product details and select/crop the main image (Image 1)', 'warning');
      return;
    }

    onAddProduct({
      title: prodTitle,
      description: prodDesc,
      price: Number(prodPrice),
      discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : 0,
      category: prodCat,
      image: prodImage,
      images: [prodImage, prodImage2, prodImage3].filter(Boolean),
      rating: Number(prodRating),
      isDealOfTheDay: prodDeal
    });

    // Reset Form
    setProdTitle('');
    setProdDesc('');
    setProdPrice('');
    setProdDiscountPrice('');
    setProdImage('');
    setProdImage2('');
    setProdImage3('');
    setProdRating('4.5');
    setProdDeal(false);
  };

  const toggleProductDealStatus = (product) => {
    onUpdateProduct(product._id, { isDealOfTheDay: !product.isDealOfTheDay });
  };

  return (
    <div className="container animate-fade">
      <div className="admin-layout">
        {/* Admin Sidebar Navigation */}
        <aside className="admin-sidebar">
          <h3 style={{ fontSize: 16, marginBottom: 12, paddingLeft: 8, color: 'var(--text-muted)' }}>MANAGEMENT</h3>
          <button
            className={`admin-sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Site Settings
          </button>
          <button
            className={`admin-sidebar-btn ${activeTab === 'hero' ? 'active' : ''}`}
            onClick={() => setActiveTab('hero')}
          >
            Hero Banner Slider
          </button>
          <button
            className={`admin-sidebar-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Store Categories
          </button>
          <button
            className={`admin-sidebar-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products Catalog
          </button>
          <button
            className={`admin-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders Manager
          </button>

          <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="admin-sidebar-btn"
              onClick={onAdminLogout}
              style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout Admin
            </button>
          </div>
        </aside>

        {/* Admin Main Content Window */}
        <main className="admin-content">

          {/* TAB 1: SITE SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <div className="admin-card-header">
                <h2>General Store Settings</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Configure navigation logo details and footer listings.</p>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label>Logo Display Type</label>
                    <select
                      className="form-control"
                      value={logoType}
                      onChange={(e) => setLogoType(e.target.value)}
                    >
                      <option value="text">Custom Text Logo</option>
                      <option value="image">Uploaded Image Logo</option>
                    </select>
                  </div>

                  {logoType === 'text' ? (
                    <div className="form-group">
                      <label>Navbar Logo Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        placeholder="e.g., ShopKart"
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Navbar Logo Image (Click to Upload & Crop)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <input
                          type="file"
                          accept="image/*"
                          id="logo-upload"
                          style={{ display: 'none' }}
                          onChange={handleLogoImageChange}
                        />
                        <label htmlFor="logo-upload" className="crop-preview-box" style={{ width: 150, height: 50, cursor: 'pointer' }}>
                          {logoImage ? (
                            <img
                              src={logoImage.startsWith('data:') || logoImage.startsWith('http') ? logoImage : `http://localhost:5000${logoImage}`}
                              alt="Navbar logo preview"
                              style={{ objectFit: 'contain' }}
                            />
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Choose Logo Image</span>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                  <h4 style={{ fontSize: 16, marginBottom: 16 }}>Footer Details Settings</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="form-group">
                      <label>Support Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={footerEmail}
                        onChange={(e) => setFooterEmail(e.target.value)}
                        placeholder="support@shopkart.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={footerPhone}
                        onChange={(e) => setFooterPhone(e.target.value)}
                        placeholder="+1 (234) 567-890"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Store Office Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={footerAddress}
                      onChange={(e) => setFooterAddress(e.target.value)}
                      placeholder="123 ShopKart Ave, NY"
                    />
                  </div>

                  <div className="form-group">
                    <label>Copyright / Footer Notice Text</label>
                    <input
                      type="text"
                      className="form-control"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="© 2026 ShopKart. All rights reserved."
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', alignSelf: 'flex-end' }}>
                  Save Site Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: HERO BANNER SLIDER */}
          {activeTab === 'hero' && (
            <div>
              <div className="admin-card-header">
                <h2>Hero Carousel Slider Settings</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Add panoramic banners (21:9 ratio) which auto-change on the homepage hero section.</p>
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="hero-slide-upload"
                  style={{ display: 'none' }}
                  onChange={handleAddHeroSlide}
                />
                <label htmlFor="hero-slide-upload" className="btn btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Upload & Crop Banner Slide (21:9)
                </label>
              </div>

              <div style={{ marginTop: 30 }}>
                <h4 style={{ fontSize: 15, marginBottom: 16 }}>Current Rotating Banners</h4>
                {(!settings.heroImages || settings.heroImages.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--color-border)', padding: 24, textAlign: 'center', borderRadius: 8 }}>
                    Currently using default system demo banners. Upload custom banners above to overwrite.
                  </p>
                ) : (
                  <div className="admin-hero-gallery">
                    {settings.heroImages.map((imgUrl, i) => {
                      const finalSrc = imgUrl.startsWith('data:') || imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`;
                      return (
                        <div key={i} className="admin-hero-card">
                          <img src={finalSrc} alt={`Hero slide ${i + 1}`} />
                          <button
                            className="admin-hero-card-delete"
                            onClick={() => handleDeleteHeroSlide(imgUrl)}
                            title="Delete slide"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STORE CATEGORIES */}
          {activeTab === 'categories' && (
            <div>
              <div className="admin-card-header">
                <h2>Product Categories Manager</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Manage product categories. Default suggested: Men's Clothes, Women's Clothes, Electronics, Shoes.</p>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', gap: 12, marginBottom: 30 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="New Category Name (e.g., Electronics)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ maxWidth: 400 }}
                />
                <button type="submit" className="btn btn-primary">Add Category</button>
              </form>

              {/* Categories list */}
              <div>
                <h4 style={{ fontSize: 15, marginBottom: 12 }}>Existing Categories</h4>
                {categories.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No categories configured. Please add one above.</p>
                ) : (
                  categories.map((cat) => (
                    <div className="admin-list-item" key={cat._id || cat.slug}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                        <span style={{ marginLeft: 16, fontSize: 12, color: 'var(--text-muted)' }}>slug: {cat.slug}</span>
                      </div>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => onDeleteCategory(cat._id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div>
              <div className="admin-card-header">
                <h2>Products Inventory Manager</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Add new products with prices, toggle Deal of the Day, and crop product images to 1:1 aspect ratio.</p>
              </div>

              {/* Add product form */}
              <form onSubmit={handleAddProductSubmit} style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, marginBottom: 40, backgroundColor: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Add New Product</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

                  {/* Left Column Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Product Title*</label>
                      <input
                        type="text"
                        className="form-control"
                        value={prodTitle}
                        onChange={(e) => setProdTitle(e.target.value)}
                        placeholder="e.g., Wireless Noise-Cancelling Headphones"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Description</label>
                      <textarea
                        className="form-control"
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        placeholder="Product detailed description..."
                        rows="3"
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Category*</label>
                        <select
                          className="form-control"
                          value={prodCat}
                          onChange={(e) => setProdCat(e.target.value)}
                          required
                        >
                          {categories.map((c) => (
                            <option key={c._id || c.slug} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Mock Rating (1.0 to 5.0)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          className="form-control"
                          value={prodRating}
                          onChange={(e) => setProdRating(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Price ($)*</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          placeholder="e.g., 99.99"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Discount Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={prodDiscountPrice}
                          onChange={(e) => setProdDiscountPrice(e.target.value)}
                          placeholder="e.g., 79.99"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
                      <input
                        type="checkbox"
                        id="deal-check"
                        checked={prodDeal}
                        onChange={(e) => setProdDeal(e.target.checked)}
                        style={{ width: 16, height: 16, marginRight: 8, accentColor: 'var(--color-accent)' }}
                      />
                      <label htmlFor="deal-check" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>
                        Mark as "Deal of the Day"
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Three Product Banners with Crop */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, alignSelf: 'flex-start', color: 'var(--text-primary)' }}>Product Images (Up to 3)</label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%' }}>

                      {/* Image 1 (Required) */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>Image 1*</span>
                        <input
                          type="file"
                          accept="image/*"
                          id="product-upload-1"
                          style={{ display: 'none' }}
                          onChange={(e) => handleProductImageSelectIndexed(e, 1)}
                        />
                        <label htmlFor="product-upload-1" className="crop-preview-box" style={{ width: '100%', aspectRatio: '1/1', minHeight: 90, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {prodImage ? (
                            <img
                              src={prodImage.startsWith('data:') || prodImage.startsWith('http') ? prodImage : `http://localhost:5000${prodImage}`}
                              alt="Product 1 preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: 4 }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Choose</span>
                            </div>
                          )}
                        </label>
                        {prodImage && (
                          <button type="button" onClick={() => setProdImage('')} className="btn-icon" style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 2, background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                        )}
                      </div>

                      {/* Image 2 (Optional) */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>Image 2</span>
                        <input
                          type="file"
                          accept="image/*"
                          id="product-upload-2"
                          style={{ display: 'none' }}
                          onChange={(e) => handleProductImageSelectIndexed(e, 2)}
                        />
                        <label htmlFor="product-upload-2" className="crop-preview-box" style={{ width: '100%', aspectRatio: '1/1', minHeight: 90, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {prodImage2 ? (
                            <img
                              src={prodImage2.startsWith('data:') || prodImage2.startsWith('http') ? prodImage2 : `http://localhost:5000${prodImage2}`}
                              alt="Product 2 preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: 4 }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Choose</span>
                            </div>
                          )}
                        </label>
                        {prodImage2 && (
                          <button type="button" onClick={() => setProdImage2('')} className="btn-icon" style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 2, background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                        )}
                      </div>

                      {/* Image 3 (Optional) */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>Image 3</span>
                        <input
                          type="file"
                          accept="image/*"
                          id="product-upload-3"
                          style={{ display: 'none' }}
                          onChange={(e) => handleProductImageSelectIndexed(e, 3)}
                        />
                        <label htmlFor="product-upload-3" className="crop-preview-box" style={{ width: '100%', aspectRatio: '1/1', minHeight: 90, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {prodImage3 ? (
                            <img
                              src={prodImage3.startsWith('data:') || prodImage3.startsWith('http') ? prodImage3 : `http://localhost:5000${prodImage3}`}
                              alt="Product 3 preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: 4 }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Choose</span>
                            </div>
                          )}
                        </label>
                        {prodImage3 && (
                          <button type="button" onClick={() => setProdImage3('')} className="btn-icon" style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 2, background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">Add Product to Catalog</button>
                </div>
              </form>

              {/* Products listing */}
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Inventory Listings ({products.length})</h3>
                {products.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No products in the catalog. Use the form above to add products.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                          <th style={{ padding: '12px 8px' }}>Image</th>
                          <th style={{ padding: '12px 8px' }}>Title</th>
                          <th style={{ padding: '12px 8px' }}>Category</th>
                          <th style={{ padding: '12px 8px' }}>Price</th>
                          <th style={{ padding: '12px 8px' }}>Deal of the Day</th>
                          <th style={{ padding: '12px 8px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => {
                          const pImgUrl = p.image.startsWith('data:') || p.image.startsWith('http')
                            ? p.image
                            : `http://localhost:5000${p.image}`;
                          return (
                            <tr key={p._id || p.slug} style={{ borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
                              <td style={{ padding: '8px' }}>
                                <img src={pImgUrl} alt={p.title} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                              </td>
                              <td style={{ padding: '8px', fontWeight: 600 }}>{p.title}</td>
                              <td style={{ padding: '8px' }}>{p.category}</td>
                              <td style={{ padding: '8px' }}>
                                {p.discountPrice > 0 ? (
                                  <div>
                                    <span style={{ fontWeight: 700 }}>${p.discountPrice}</span>{' '}
                                    <span style={{ textDecoration: 'line-through', fontSize: 11, color: 'var(--text-muted)' }}>${p.price}</span>
                                  </div>
                                ) : (
                                  <span>${p.price}</span>
                                )}
                              </td>
                              <td style={{ padding: '8px' }}>
                                <button
                                  className={`badge ${p.isDealOfTheDay ? 'badge-deal' : 'badge-category'}`}
                                  onClick={() => toggleProductDealStatus(p)}
                                  title="Click to toggle"
                                >
                                  {p.isDealOfTheDay ? 'Yes (Active)' : 'No (Click to set)'}
                                </button>
                              </td>
                              <td style={{ padding: '8px' }}>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '6px 12px', fontSize: 12 }}
                                  onClick={() => { if (window.confirm('Remove this product from store?')) onDeleteProduct(p._id); }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS MANAGER */}
          {activeTab === 'orders' && (
            <div>
              <div className="admin-card-header">
                <h2>Customer Orders Management</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                  Track storefront checkouts, view shipping details, and modify package fulfillment statuses.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                {isAdminOrdersLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <span className="spinner" style={{ width: 30, height: 30, border: '3px solid var(--color-border)', borderTop: '3px solid #ff708a', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                    <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>Loading all catalog orders...</p>
                  </div>
                ) : adminOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontWeight: 600 }}>No orders have been placed yet.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', fontWeight: '700' }}>
                          <th style={{ padding: '12px 8px' }}>Date</th>
                          <th style={{ padding: '12px 8px' }}>Order ID</th>
                          <th style={{ padding: '12px 8px' }}>Customer</th>
                          <th style={{ padding: '12px 8px' }}>Delivery Address</th>
                          <th style={{ padding: '12px 8px' }}>Items Summary</th>
                          <th style={{ padding: '12px 8px' }}>Total</th>
                          <th style={{ padding: '12px 8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders.map((order) => (
                          <tr key={order._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontWeight: 600, color: '#ff708a' }}>
                              {order._id}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ fontWeight: 600 }}>{order.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{order.phone}</div>
                            </td>
                            <td style={{ padding: '12px 8px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.address}>
                              {order.address}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {order.cartItems.map((item, idx) => (
                                  <div key={idx} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    {item.title} (x{item.quantity})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: '12px 8px', fontWeight: 700 }}>
                              ${order.total.toFixed(2)}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <select
                                className="form-control"
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                style={{ 
                                  fontSize: 12, 
                                  padding: '4px 8px', 
                                  borderRadius: 'var(--radius-sm)', 
                                  backgroundColor: order.status === 'Delivered' ? 'var(--color-success-light)' : order.status === 'Pending' ? 'rgba(255, 112, 138, 0.1)' : 'var(--bg-secondary)',
                                  color: order.status === 'Delivered' ? 'var(--color-success)' : order.status === 'Pending' ? '#ff708a' : 'var(--text-primary)',
                                  fontWeight: 600,
                                  border: '1px solid var(--color-border)',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Global Image Cropper Modal Wrapper */}
      {cropState.isOpen && (
        <ImageCropper
          imageSrc={cropState.imageSrc}
          aspectRatio={cropState.aspectRatio}
          onCrop={cropState.onCrop}
          onClose={() => setCropState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
