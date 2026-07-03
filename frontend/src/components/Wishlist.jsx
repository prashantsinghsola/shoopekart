import React from 'react';
import ProductCard from './ProductCard';

export default function Wishlist({ 
  wishlistItems, 
  onAddToCart, 
  onToggleWishlist,
  onSelectProduct
}) {
  return (
    <div className="container animate-fade" style={{ padding: '40px 0', minHeight: '60vh' }}>
      <div className="admin-card-header" style={{ marginBottom: '32px' }}>
        <h2>My Wishlist ({wishlistItems.length})</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: 4 }}>
          Products you've saved to buy later. Click "Add" to add them to your shopping bag.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-secondary)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', color: '#ff708a' }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Your Wishlist is Empty</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Tap the heart icon on any product in the catalog to add it here.
          </p>
        </div>
      ) : (
        <div className="product-grid animate-fade">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product._id || product.slug}
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={true}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
