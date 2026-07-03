import React from 'react';

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout,
  onSelectProduct
}) {
  // Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.discountPrice > 0 && item.discountPrice < item.price 
      ? item.discountPrice 
      : item.price;
    return acc + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <h2 style={{ fontSize: 20 }}>Shopping Cart ({cartItems.length})</h2>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Item List */}
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 80, color: 'var(--text-muted)' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>Your Cart is Empty</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Add products from our catalog to get started.</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const activePrice = item.discountPrice > 0 && item.discountPrice < item.price 
                ? item.discountPrice 
                : item.price;
              
              const itemImgUrl = item.image.startsWith('data:') || item.image.startsWith('http') 
                ? item.image 
                : `http://localhost:5000${item.image}`;

              return (
                <div className="cart-item animate-fade" key={item._id || item.slug}>
                  <img 
                    src={itemImgUrl} 
                    alt={item.title} 
                    className="cart-item-img" 
                    onClick={() => onSelectProduct && onSelectProduct(item)}
                    style={{ cursor: onSelectProduct ? 'pointer' : 'default' }}
                  />
                  
                  <div className="cart-item-details">
                    <h4 
                      className="cart-item-title"
                      onClick={() => onSelectProduct && onSelectProduct(item)}
                      style={{ cursor: onSelectProduct ? 'pointer' : 'default' }}
                    >
                      {item.title}
                    </h4>
                    <p className="cart-item-price">${activePrice.toFixed(2)}</p>
                    
                    <div className="cart-item-controls">
                      {/* Quantity Selector */}
                      <div className="quantity-selector">
                        <button 
                          className="quantity-btn" 
                          onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-val">{item.quantity}</span>
                        <button 
                          className="quantity-btn" 
                          onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => onRemoveItem(item._id)}
                        style={{ color: 'var(--color-danger)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Sums */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            
            {shipping > 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, marginTop: -8 }}>
                * Add ${(150 - subtotal).toFixed(2)} more for FREE shipping!
              </p>
            )}

            <div className="cart-total-row">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: 14, fontSize: 15 }}
              onClick={onCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
