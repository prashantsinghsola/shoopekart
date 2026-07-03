import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({ 
  settings, 
  cartCount, 
  onCartOpen, 
  searchQuery, 
  setSearchQuery, 
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
  products = [],
  onSelectProduct,
  hasOrders = false,
  onTrackOrder,
  isDarkMode = false,
  onToggleDark,
  isAdminAuthenticated = false,
  onAdminLogout
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchContainerRef = useRef(null);
  const profileContainerRef = useRef(null);

  // Click outside listener for search & profile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter products for suggestions dropdown
  const suggestions = searchQuery.trim()
    ? products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  // Logo renderer
  const renderLogo = () => {
    if (settings.logoType === 'image' && settings.logoImage) {
      const src = settings.logoImage.startsWith('data:') || settings.logoImage.startsWith('http') 
        ? settings.logoImage 
        : `http://localhost:5000${settings.logoImage}`;
      return <img src={src} alt="ShopKart Logo" />;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1' }}>
        <span style={{ 
          color: '#ff708a', 
          fontWeight: '900', 
          fontSize: '24px', 
          fontFamily: "'Outfit', sans-serif",
          transform: 'skewX(-6deg)'
        }}>
          {settings.logoText || 'ShopKart'}
        </span>
        <span style={{ 
          fontSize: '7px', 
          fontWeight: '800', 
          letterSpacing: '2.5px', 
          color: '#ff708a', 
          marginTop: '3px',
          fontFamily: "'Inter', sans-serif"
        }}>
          BE SMILE BE HAPPY
        </span>
      </div>
    );
  };

  const isAdminView = currentPage === 'admin';

  return (
    <header className="header">
      <div className="container navbar">
        {/* Logo */}
        <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); setCurrentPage('store'); }}>
          {renderLogo()}
        </a>

        {/* Search Bar (Only display when not in Admin view) */}
        {!isAdminView ? (
          <div className="navbar-search" ref={searchContainerRef}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-dropdown">
                {suggestions.map((prod) => {
                  const imgUrl = prod.image.startsWith('data:') || prod.image.startsWith('http') 
                    ? prod.image 
                    : `http://localhost:5000${prod.image}`;
                  const hasDiscount = prod.discountPrice > 0 && prod.discountPrice < prod.price;
                  const displayPrice = hasDiscount ? prod.discountPrice : prod.price;

                  return (
                    <div 
                      key={prod._id || prod.slug} 
                      className="search-dropdown-item animate-fade"
                      onClick={() => {
                        if (onSelectProduct) onSelectProduct(prod);
                        setShowSuggestions(false);
                      }}
                    >
                      <img src={imgUrl} alt={prod.title} />
                      <div className="search-dropdown-item-details">
                        <span className="search-dropdown-item-title">{prod.title}</span>
                        <span className="search-dropdown-item-price">${displayPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: '#ff708a' }}>
            Admin Management Dashboard
          </div>
        )}

        {/* Actions */}
        <div className="navbar-actions">

          {/* Track My Order Button — only shown to logged-in users, disabled if no orders */}
          {currentUser && !isAdminView && (
            <button
              onClick={() => hasOrders && onTrackOrder && onTrackOrder()}
              title={hasOrders ? 'Track your active orders' : 'No orders placed yet'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 13px',
                borderRadius: '20px',
                border: `1.5px solid ${hasOrders ? '#ff708a' : 'var(--color-border)'}`,
                background: hasOrders ? 'rgba(255,112,138,0.08)' : 'var(--bg-secondary)',
                color: hasOrders ? '#ff708a' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: hasOrders ? 'pointer' : 'not-allowed',
                opacity: hasOrders ? 1 : 0.5,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => {
                if (hasOrders) {
                  e.currentTarget.style.background = 'rgba(255,112,138,0.16)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(255,112,138,0.2)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = hasOrders ? 'rgba(255,112,138,0.08)' : 'var(--bg-secondary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Package / truck icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1"></rect>
                <path d="M16 8h4l3 3v5h-7V8z"></path>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Track Order
              {/* Live pulse dot when order is active */}
              {hasOrders && (
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#ff708a',
                  animation: 'trackPulse 1.5s infinite',
                  flexShrink: 0
                }} />
              )}
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1.5px solid var(--color-border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = isDarkMode ? '#fbbf24' : '#818cf8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {isDarkMode ? (
              /* Sun icon */
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              /* Moon icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {/* Cart Trigger (Only when not in Admin view) */}
          {!isAdminView && (
            <button className="btn-icon cart-trigger" onClick={onCartOpen} title="Shopping Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}

          {/* Profile Access */}
          {isAdminAuthenticated ? (
            <button
              className="btn btn-primary"
              style={{ backgroundColor: '#ff708a', color: '#ffffff', fontSize: 13, padding: '8px 16px' }}
              onClick={onAdminLogout}
            >
              Logout
            </button>
          ) : currentUser ? (
            <div className="profile-dropdown-container" ref={profileContainerRef}>
              <button 
                className="btn-icon" 
                onClick={() => setProfileOpen(!profileOpen)}
                title="User Profile"
                style={{ padding: 0, overflow: 'hidden' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: 'auto' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              
              <div className={`profile-dropdown ${profileOpen ? 'active' : ''}`}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{currentUser.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentUser.email}</p>
                </div>
                <a href="#" className="profile-dropdown-item" onClick={(e) => { e.preventDefault(); setCurrentPage('profile'); setProfileOpen(false); }}>
                  My Profile Settings
                </a>
                {/* Track My Order inside dropdown too */}
                <a
                  href="#"
                  className="profile-dropdown-item"
                  style={{
                    color: hasOrders ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: hasOrders ? 'pointer' : 'not-allowed',
                    opacity: hasOrders ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (hasOrders && onTrackOrder) { onTrackOrder(); setProfileOpen(false); }
                  }}
                >
                  {hasOrders && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ff708a', animation: 'trackPulse 1.5s infinite', flexShrink: 0 }} />
                  )}
                  Track My Order {!hasOrders && '(No orders yet)'}
                </a>
                <a href="#" className="profile-dropdown-item" onClick={(e) => { e.preventDefault(); setCurrentPage('catalog'); setProfileOpen(false); }}>
                  Browse Catalog
                </a>
                <a href="#" className="profile-dropdown-item" onClick={(e) => { e.preventDefault(); setCurrentPage('wishlist'); setProfileOpen(false); }}>
                  My Wishlist
                </a>
                <a 
                  href="#" 
                  className="profile-dropdown-item" 
                  style={{ color: 'var(--color-danger)' }}
                  onClick={(e) => { e.preventDefault(); onLogout(); setProfileOpen(false); }}
                >
                  Log Out
                </a>
              </div>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              style={{ backgroundColor: '#ff708a', color: '#ffffff', fontSize: 13, padding: '8px 16px' }}
              onClick={() => setCurrentPage('auth')}
            >
              Sign In
            </button>
          )}

        </div>
      </div>

      {/* Pulse animation for the live order dot */}
      <style>{`
        @keyframes trackPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </header>
  );
}
