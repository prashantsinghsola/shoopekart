import React, { useState, useEffect } from 'react';

export default function Checkout({ 
  cartItems, 
  currentUser, 
  onOrderSuccess, 
  onBackToShopping, 
  addToast,
  isUsingFallback
}) {
  const [step, setStep] = useState(1); // 1: Verification, 2: Address, 3: Payment, 4: Success
  const [verificationInput, setVerificationInput] = useState(currentUser?.email || currentUser?.phone || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Shipping details form
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [useProfileDetails, setUseProfileDetails] = useState(!!currentUser);

  // Payment state
  const [paymentMode, setPaymentMode] = useState('COD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.discountPrice > 0 && item.discountPrice < item.price 
      ? item.discountPrice 
      : item.price;
    return acc + (price * item.quantity);
  }, 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  // Pre-fill profile details when selection changes
  useEffect(() => {
    if (useProfileDetails && currentUser) {
      setFullName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [useProfileDetails, currentUser]);

  // Step 1: Handle Verification simulation
  const handleVerify = (e) => {
    e.preventDefault();
    if (!verificationInput.trim()) {
      addToast('Please enter an email or phone number', 'error');
      return;
    }
    
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      addToast('Verification code verified successfully!', 'success');
    }, 1500);
  };

  // Step 2: Handle Personal Details submission
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      addToast('Please fill in all personal details', 'error');
      return;
    }
    setStep(3);
  };

  // Step 3: Handle Final Buy Now Submit
  const handlePlaceOrder = async () => {
    if (paymentMode === 'Pay Online') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        addToast('Please fill in your payment card details', 'error');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        addToast('Please enter a valid 16-digit card number', 'error');
        return;
      }
    }

    setIsSubmittingOrder(true);
    
    const orderPayload = {
      userId: currentUser ? currentUser._id : 'guest',
      name: fullName,
      email,
      phone,
      address,
      cartItems: cartItems.map(item => ({
        _id: item._id,
        title: item.title,
        price: item.discountPrice > 0 && item.discountPrice < item.price ? item.discountPrice : item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal,
      shipping,
      total,
      paymentMode
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to save order to database');
      }

      const orderData = await response.json();
      setPlacedOrder(orderData);
      setStep(4);
      onOrderSuccess(); // Clears shopping cart in parent App
      addToast('Your order was placed successfully!', 'success');
    } catch (err) {
      console.warn('API database order failed, placing offline:', err.message);
      
      // Resilient local fallback
      const offlineOrder = {
        _id: 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        ...orderPayload,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage history as guest/resilient sync
      try {
        const savedOrders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
        savedOrders.push(offlineOrder);
        localStorage.setItem('offline_orders', JSON.stringify(savedOrders));
      } catch (e) {
        console.error(e);
      }

      setPlacedOrder(offlineOrder);
      setStep(4);
      onOrderSuccess(); // Clears shopping cart in parent App
      addToast('Order placed locally in Offline Mode!', 'success');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ padding: '40px 0', minHeight: '80vh' }}>
      
      {/* Visual Stepper Header */}
      {step < 4 && (
        <div style={{ maxWidth: 600, margin: '0 auto 40px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', backgroundColor: 'var(--color-border)', zIndex: 1 }}>
            <div style={{ 
              height: '100%', 
              backgroundColor: '#ff708a', 
              width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
              transition: 'width 0.3s ease' 
            }} />
          </div>
          
          {[
            { label: 'Verification', stepNum: 1 },
            { label: 'Address details', stepNum: 2 },
            { label: 'Payment mode', stepNum: 3 }
          ].map((s) => {
            const isActive = step >= s.stepNum;
            const isCurrent = step === s.stepNum;
            return (
              <div key={s.stepNum} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#ff708a' : '#ffffff',
                  border: `2px solid ${isActive ? '#ff708a' : 'var(--color-border)'}`,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: isCurrent ? '0 0 12px rgba(255, 112, 138, 0.4)' : 'none',
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
                }}>
                  {s.stepNum}
                </div>
                <span style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  fontWeight: isCurrent ? '700' : '500', 
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 1: VERIFICATION SCREEN */}
      {step === 1 && (
        <div style={{ maxWidth: 450, margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '40px 32px', boxShadow: 'var(--shadow-md)' }} className="animate-slideup">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Verification</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Verify your email or phone number to secure your order checkout</p>
          </div>
          
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label>Phone Number or Email address</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. customer@shopkart.com or +12345678"
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                disabled={isVerifying || isVerified}
                required
              />
            </div>

            {!isVerified ? (
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ backgroundColor: '#ff708a', height: 44, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                    Sending Verification Code...
                  </>
                ) : 'Verify Account'}
              </button>
            ) : (
              <div style={{ 
                backgroundColor: 'var(--color-success-light)', 
                color: 'var(--color-success)', 
                borderRadius: 'var(--radius-md)', 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: 14, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Verification Completed!
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, height: 40 }}
                onClick={onBackToShopping}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1, height: 40, backgroundColor: isVerified ? '#ff708a' : 'var(--text-muted)' }}
                disabled={!isVerified}
                onClick={() => setStep(2)}
              >
                Next Step &rarr;
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: PERSONAL DETAILS / DELIVERY ADDRESS */}
      {step === 2 && (
        <div style={{ maxWidth: 650, margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '36px', boxShadow: 'var(--shadow-md)' }} className="animate-slideup">
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 16, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Personal & Delivery Details</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Enter the destination details where we should ship your items</p>
          </div>

          <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {currentUser && (
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer'
                }}
                onClick={() => setUseProfileDetails(!useProfileDetails)}
              >
                <input 
                  type="checkbox" 
                  checked={useProfileDetails}
                  onChange={() => {}} // toggled by parent div click
                  style={{ width: 16, height: 16, accentColor: '#ff708a', cursor: 'pointer' }}
                />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Use saved account profile details</span>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {currentUser.name} | {currentUser.phone || 'No phone'} | {currentUser.address || 'No address'}
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Full Name*</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={useProfileDetails && !!currentUser}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Phone*</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={useProfileDetails && !!currentUser}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address*</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={useProfileDetails && !!currentUser}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="form-group">
              <label>Delivery Address*</label>
              <textarea 
                className="form-control" 
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={useProfileDetails && !!currentUser}
                placeholder="Enter complete delivery street, apartment number, state, city and zip code"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--color-border)', paddingTop: 20, marginTop: 10 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: 120, height: 40 }}
                onClick={() => setStep(1)}
              >
                &larr; Back
              </button>
              <div style={{ flex: 1 }} />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: 160, height: 40, backgroundColor: '#ff708a' }}
              >
                Go to Payment &rarr;
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: PAYMENT MODE & SUMMARY */}
      {step === 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'flex-start', maxWidth: 950, margin: '0 auto' }}>
          
          {/* Payment Card Options */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-md)' }} className="animate-slideup">
            <h2 style={{ fontSize: 18, fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: 16, marginBottom: 24 }}>Select Payment Method</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              {/* COD Option */}
              <div 
                style={{
                  border: `2px solid ${paymentMode === 'COD' ? '#ff708a' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  cursor: 'pointer',
                  backgroundColor: paymentMode === 'COD' ? 'rgba(255, 112, 138, 0.04)' : '#ffffff',
                  boxShadow: paymentMode === 'COD' ? '0 4px 12px rgba(255, 112, 138, 0.1)' : 'none',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
                onClick={() => setPaymentMode('COD')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={paymentMode === 'COD' ? '#ff708a' : 'currentColor'} strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="2"></circle>
                    <path d="M6 12h.01M18 12h.01"></path>
                  </svg>
                  <input 
                    type="radio" 
                    checked={paymentMode === 'COD'}
                    onChange={() => {}}
                    style={{ accentColor: '#ff708a' }}
                  />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Cash on Delivery</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Pay cash when your order is delivered to your doorstep.</span>
              </div>

              {/* Pay Online Option */}
              <div 
                style={{
                  border: `2px solid ${paymentMode === 'Pay Online' ? '#ff708a' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  cursor: 'pointer',
                  backgroundColor: paymentMode === 'Pay Online' ? 'rgba(255, 112, 138, 0.04)' : '#ffffff',
                  boxShadow: paymentMode === 'Pay Online' ? '0 4px 12px rgba(255, 112, 138, 0.1)' : 'none',
                  transition: 'border-color 0.2s, background-color 0.2s'
                }}
                onClick={() => setPaymentMode('Pay Online')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={paymentMode === 'Pay Online' ? '#ff708a' : 'currentColor'} strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <input 
                    type="radio" 
                    checked={paymentMode === 'Pay Online'}
                    onChange={() => {}}
                    style={{ accentColor: '#ff708a' }}
                  />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Pay Online</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Secure checkout via Debit/Credit card instantly.</span>
              </div>
            </div>

            {/* Pay Online input panel */}
            {paymentMode === 'Pay Online' && (
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20 }} className="animate-fade">
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Card details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-group">
                    <label style={{ fontSize: 11 }}>Card Number</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => {
                        // Formatting: Add space every 4 digits
                        const v = e.target.value.replace(/\D/g, '').match(/.{1,4}/g);
                        setCardNumber(v ? v.join(' ') : '');
                      }}
                      style={{ fontSize: 13, height: 38 }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label style={{ fontSize: 11 }}>Expiry Date</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '');
                          if (v.length > 2) {
                            setCardExpiry(v.slice(0, 2) + '/' + v.slice(2, 4));
                          } else {
                            setCardExpiry(v);
                          }
                        }}
                        style={{ fontSize: 13, height: 38 }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: 11 }}>CVV</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="***"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        style={{ fontSize: 13, height: 38 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: 120, height: 40 }}
                onClick={() => setStep(2)}
              >
                &larr; Address
              </button>
              <div style={{ flex: 1 }} />
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: 180, height: 42, backgroundColor: '#ff708a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(255, 112, 138, 0.3)' }}
                onClick={handlePlaceOrder}
                disabled={isSubmittingOrder}
              >
                {isSubmittingOrder ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14, border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Buy Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Checkout Order Summary Column */}
          <aside style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-md)' }} className="animate-slideup">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Order Summary</h3>
            
            {/* Items scrollbox */}
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 16, marginBottom: 16 }}>
              {cartItems.map(item => {
                const img = item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`;
                const activePrice = item.discountPrice > 0 && item.discountPrice < item.price ? item.discountPrice : item.price;
                return (
                  <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={img} alt={item.title} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.title}>{item.title}</h4>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Qty: {item.quantity} &bull; ${activePrice.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sum breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid var(--color-border)', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              <span>Grand Total:</span>
              <span style={{ color: '#ff708a' }}>${total.toFixed(2)}</span>
            </div>
          </aside>

        </div>
      )}

      {/* STEP 4: ORDER SUCCESS */}
      {step === 4 && placedOrder && (
        <div style={{ maxWidth: 550, margin: '60px auto', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '50px 40px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }} className="animate-slideup">
          {/* Animated Success Circle Checkmark */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-success-light)', 
            color: 'var(--color-success)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px auto',
            boxShadow: '0 4px 20px rgba(46, 213, 115, 0.2)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Order Placed Successfully!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: '400px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
            Thank you for shopping with ShopKart! We have received your order details and our fulfillment staff are preparing your package.
          </p>

          {/* Details Summary Card */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Order ID:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 14, color: '#ff708a' }}>{placedOrder._id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Customer Name:</span>
              <span style={{ fontWeight: 600 }}>{placedOrder.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Shipping Destination:</span>
              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }} title={placedOrder.address}>{placedOrder.address}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 4 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Grand Total Amount:</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>${placedOrder.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Payment Method:</span>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 12, backgroundColor: 'rgba(255, 112, 138, 0.1)', color: '#ff708a', padding: '2px 8px', borderRadius: 4 }}>{placedOrder.paymentMode}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentUser ? (
              <button 
                className="btn btn-primary" 
                style={{ backgroundColor: '#ff708a', height: 44, fontWeight: 600 }}
                onClick={() => onBackToShopping('profile')} // Goes to User Profile Track tab
              >
                Track My Order inside Profile
              </button>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                💡 Tip: Sign in or register to track your orders inside your customer profile account.
              </p>
            )}
            <button 
              className="btn btn-secondary" 
              style={{ height: 44, fontWeight: 600 }}
              onClick={() => onBackToShopping('store')}
            >
              Continue Store Shopping
            </button>
          </div>
        </div>
      )}

      {/* CSS Animation Keyframes for Simulating Verification Spinner */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

    </div>
  );
}
