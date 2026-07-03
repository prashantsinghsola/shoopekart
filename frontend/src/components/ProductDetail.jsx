import React, { useState, useEffect } from 'react';

export default function ProductDetail({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted,
  onBack 
}) {
  const { title, description, price, discountPrice, category, image, images, rating, isDealOfTheDay } = product;
  const [quantity, setQuantity] = useState(1);

  // Resolve all images listing
  const allImages = images && images.length > 0 ? images : [image];
  const [activeImage, setActiveImage] = useState(allImages[0] || image);

  // Sync active image when product updates
  useEffect(() => {
    const defaultImg = product.images && product.images.length > 0 ? product.images[0] : product.image;
    setActiveImage(defaultImg);
  }, [product]);

  // Resolve Image Path
  const imageUrl = activeImage && (activeImage.startsWith('data:') || activeImage.startsWith('http'))
    ? activeImage 
    : `http://localhost:5000${activeImage}`;

  // Price calculations
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const activePrice = hasDiscount ? discountPrice : price;
  const originalPrice = price;
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) 
    : 0;

  // Render Star Ratings
  const renderStars = (ratingVal) => {
    const stars = [];
    const rounded = Math.round(ratingVal * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--color-warning)' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      } else if (i - 0.5 === rounded) {
        stars.push(
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-warning)', fill: 'url(#detail-half-star)' }}>
            <defs>
              <linearGradient id="detail-half-star">
                <stop offset="50%" stopColor="var(--color-warning)" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      }
    }
    return stars;
  };

  const handleAddToBag = () => {
    // Add multiple quantities to cart
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
  };

  return (
    <div className="container animate-fade" style={{ padding: '40px 0' }}>
      
      {/* Subpage Breadcrumbs & Back arrow link */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{ fontWeight: 500 }}>Products</a>
        <span>&gt;</span>
        <span style={{ color: 'var(--text-muted)' }}>{title}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 480px) 1fr',
        gap: '40px',
        alignItems: 'flex-start',
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* LEFT COLUMN: PRODUCT IMAGE VIEW & THUMBNAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            {isDealOfTheDay && (
              <span className="badge badge-deal" style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, padding: '4px 10px', fontSize: '12px' }}>
                DEAL OF THE DAY
              </span>
            )}
            {hasDiscount && (
              <span className="badge badge-category" style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, padding: '4px 10px', fontSize: '12px', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: '700' }}>
                {discountPercent}% OFF
              </span>
            )}
            <img 
              src={imageUrl} 
              alt={title} 
              style={{ 
                width: '100%', 
                aspectRatio: '1/1', 
                objectFit: 'cover', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--bg-secondary)'
              }} 
            />
          </div>

          {/* Thumbnails Row */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {allImages.map((img, index) => {
                const thumbUrl = img.startsWith('data:') || img.startsWith('http') 
                  ? img 
                  : `http://localhost:5000${img}`;
                const isActive = img === activeImage;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '70px',
                      height: '70px',
                      padding: 0,
                      border: isActive ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-secondary)',
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    <img src={thumbUrl} alt={`Thumbnail ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAIL DESCRIPTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div>
            <span className="badge badge-category" style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{category}</span>
            <h1 style={{ fontSize: '32px', marginTop: '10px', marginBottom: '8px', lineHeight: '1.2' }}>{title}</h1>
            
            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)' }}>
              <span style={{ display: 'flex' }}>{renderStars(rating)}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {rating.toFixed(1)} / 5.0 Rating (Customer Choice)
              </span>
            </div>
          </div>

          {/* Pricing section */}
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            padding: '16px 20px', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px'
          }}>
            {hasDiscount ? (
              <>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>${activePrice.toFixed(2)}</span>
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>${originalPrice.toFixed(2)}</span>
              </>
            ) : (
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>${originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '15px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product Overview</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {description || "No description provided for this product. High quality materials, built for durability and sleek modern aesthetic."}
            </p>
          </div>

          {/* Actions & Add items form */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            
            {/* Quantity Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity</span>
              <div className="quantity-selector" style={{ height: '40px' }}>
                <button 
                  type="button" 
                  className="quantity-btn"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  style={{ width: '36px' }}
                >
                  -
                </button>
                <span className="quantity-val" style={{ width: '40px' }}>{quantity}</span>
                <button 
                  type="button" 
                  className="quantity-btn"
                  onClick={() => setQuantity(prev => prev + 1)}
                  style={{ width: '36px' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Bag Button */}
            <div style={{ display: 'flex', gap: '12px', flexGrow: 1, paddingTop: '18px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddToBag}
                style={{ 
                  flexGrow: 1, 
                  height: '42px', 
                  backgroundColor: '#ff708a', 
                  boxShadow: '0 4px 10px rgba(255, 112, 138, 0.2)' 
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Add to Shopping Bag
              </button>

              {/* Wishlist Heart Toggle */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onToggleWishlist(product)}
                style={{
                  height: '42px',
                  width: '42px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isWishlisted ? '#ff4757' : 'var(--text-secondary)',
                  borderColor: isWishlisted ? '#ffe5ea' : 'var(--color-border)'
                }}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill={isWishlisted ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
