import React from 'react';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted, onSelectProduct }) {
  const { title, price, discountPrice, category, image, rating, isDealOfTheDay } = product;

  // Resolve Image Path
  const imageUrl = image.startsWith('data:') || image.startsWith('http') 
    ? image 
    : `http://localhost:5000${image}`;

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
    const rounded = Math.round(ratingVal * 2) / 2; // round to nearest 0.5
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      } else if (i - 0.5 === rounded) {
        stars.push(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: 'url(#half-star-grad)' }}>
            <defs>
              <linearGradient id="half-star-grad">
                <stop offset="50%" stopColor="var(--color-warning)" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div 
      className="product-card animate-slideup"
      onClick={() => onSelectProduct && onSelectProduct(product)}
      style={{ cursor: onSelectProduct ? 'pointer' : 'default' }}
    >
      {/* Product Image */}
      <div className="product-card-image">
        {isDealOfTheDay && (
          <span className="product-badge badge badge-deal">
            DEAL OF THE DAY
          </span>
        )}
        {hasDiscount && (
          <span 
            className="product-badge badge badge-category" 
            style={{ 
              left: 12, 
              top: isDealOfTheDay ? 42 : 12, 
              backgroundColor: 'var(--color-success-light)', 
              color: 'var(--color-success)',
              fontWeight: 700 
            }}
          >
            {discountPercent}% OFF
          </span>
        )}
        
        {/* Wishlist Toggle Heart Button */}
        {onToggleWishlist && (
          <button 
            type="button" 
            className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill={isWishlisted ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        )}
        
        <img src={imageUrl} alt={title} loading="lazy" />
      </div>

      {/* Product Information */}
      <div className="product-card-body">
        <span className="product-card-category">{category}</span>
        <h3 className="product-card-title" title={title}>{title}</h3>
        
        {/* Rating */}
        <div className="product-rating">
          {renderStars(rating)}
          <span>({rating.toFixed(1)})</span>
        </div>

        {/* Pricing & Add Button */}
        <div className="product-card-footer">
          <div className="product-price-box">
            {hasDiscount ? (
              <>
                <span className="product-price">${activePrice.toFixed(2)}</span>
                <span className="product-original-price">${originalPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="product-price">${originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '6px' }}>
            {isWishlisted && onToggleWishlist && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--color-danger)', border: '1px solid var(--color-danger-light)' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleWishlist(product);
                }}
                title="Remove from Wishlist"
              >
                Remove
              </button>
            )}
            <button 
              className="btn btn-primary" 
              style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              title="Add to shopping cart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
