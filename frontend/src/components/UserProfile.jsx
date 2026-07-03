import React, { useState, useEffect } from 'react';

export default function UserProfile({ 
  currentUser, 
  onUpdateProfile, 
  onLogout, 
  addToast, 
  isUsingFallback,
  initialTab = 'details'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Profile settings state
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Sync initialTab when props change
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Fetch orders from API/LocalStorage
  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders?userId=${currentUser._id}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.warn('Failed to fetch orders from database, checking local storage:', err.message);
      
      // Resilient local fallback from local storage
      const savedOrders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
      const userOrders = savedOrders.filter(o => o.userId === currentUser._id);
      userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(userOrders);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && currentUser) {
      fetchOrders();
    }
  }, [activeTab, currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      addToast('Name and email are required fields.', 'warning');
      return;
    }

    setIsLoading(true);

    const payload = { name, email, phone, address };
    if (password) payload.password = password;

    if (isUsingFallback) {
      setTimeout(() => {
        setIsLoading(false);
        const updatedUser = { ...currentUser, name, email, phone, address };
        onUpdateProfile(updatedUser);
        setIsEditing(false);
        setPassword('');
        addToast('Profile updated locally successfully!', 'success');
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/profile/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      onUpdateProfile(data);
      setIsEditing(false);
      setPassword('');
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      setIsLoading(false);
      addToast(err.message, 'error');
    }
  };

  // Stepper Visual Status Indicator helper
  const renderStatusStepper = (currentStatus) => {
    const statuses = ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus);

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', position: 'relative', padding: '0 10px' }}>
        {/* Progress connector line */}
        <div style={{ position: 'absolute', top: '11px', left: '8%', right: '8%', height: '2px', backgroundColor: 'var(--color-border)', zIndex: 1 }}>
          <div style={{ 
            height: '100%', 
            backgroundColor: '#ff708a', 
            width: `${currentIndex >= 0 ? (currentIndex / (statuses.length - 1)) * 100 : 0}%`,
            transition: 'width 0.4s ease' 
          }} />
        </div>

        {statuses.map((status, index) => {
          const isPassed = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={status} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: isPassed ? '#ff708a' : '#ffffff',
                border: `2px solid ${isPassed ? '#ff708a' : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isCurrent ? '0 0 8px rgba(255, 112, 138, 0.6)' : 'none',
                transition: 'background-color 0.3s, border-color 0.3s'
              }}>
                {isPassed && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span style={{ 
                marginTop: '6px', 
                fontSize: '11px', 
                fontWeight: isCurrent ? '700' : '500', 
                color: isPassed ? 'var(--text-primary)' : 'var(--text-muted)',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                {status}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container animate-fade" style={{ maxWidth: '750px', padding: '40px 0' }}>
      <div style={{
        backgroundColor: 'transparent',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '32px',
        boxShadow: 'none',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Profile Account Settings</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: 4 }}>Manage shipping coordinates and track active orders.</p>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ fontSize: '12px', padding: '8px 16px', fontWeight: 600 }}
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>

        {/* Tab Selection Row */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '28px' }}>
          <button
            type="button"
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: activeTab === 'details' ? '700' : '500',
              color: activeTab === 'details' ? '#ff708a' : 'var(--text-secondary)',
              borderBottom: activeTab === 'details' ? '3px solid #ff708a' : 'none',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'color 0.2s, border-bottom-color 0.2s'
            }}
            onClick={() => setActiveTab('details')}
          >
            My Details
          </button>
          <button
            type="button"
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: activeTab === 'orders' ? '700' : '500',
              color: activeTab === 'orders' ? '#ff708a' : 'var(--text-secondary)',
              borderBottom: activeTab === 'orders' ? '3px solid #ff708a' : 'none',
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'color 0.2s, border-bottom-color 0.2s'
            }}
            onClick={() => setActiveTab('orders')}
          >
            Track My Order
          </button>
        </div>

        {/* TAB 1: DETAILS SETTINGS FORM */}
        {activeTab === 'details' && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade">
            <div className="form-group">
              <label>Full Name*</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address*</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                className="form-control" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                disabled={!isEditing}
                placeholder="e.g., +1 (234) 567-890"
              />
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea 
                className="form-control" 
                rows="3"
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                disabled={!isEditing}
                placeholder="e.g., 123 Main St, New York, NY"
                style={{ resize: 'vertical' }}
              />
            </div>

            {isEditing && (
              <div className="form-group">
                <label>Update Password (leave blank to keep current)</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="New Password"
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              {isEditing ? (
                <>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setName(currentUser.name || '');
                      setEmail(currentUser.email || '');
                      setPhone(currentUser.phone || '');
                      setAddress(currentUser.address || '');
                      setPassword('');
                      setIsEditing(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ backgroundColor: '#ff708a' }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Profile Details'}
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ backgroundColor: '#ff708a' }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile Info
                </button>
              )}
            </div>
          </form>
        )}

        {/* TAB 2: ORDER HISTORY & STEPS TRACKING */}
        {activeTab === 'orders' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {isOrdersLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span className="spinner" style={{ width: 30, height: 30, border: '3px solid var(--color-border)', borderTop: '3px solid #ff708a', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>Retrieving your order histories...</p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                border: '1px dashed var(--color-border)', 
                borderRadius: 'var(--radius-lg)', 
                backgroundColor: 'var(--bg-secondary)' 
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                  <path d="M12 2v1"></path>
                </svg>
                <h4 style={{ fontSize: 16, marginBottom: 4, fontWeight: 700 }}>No Orders Placed Yet</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fulfill a shopping cart checkout to track your items here.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order._id} 
                  style={{ 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '24px', 
                    backgroundColor: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Top Details Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Placed:</span>
                      <p style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order ID:</span>
                      <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#ff708a', marginTop: 2 }}>{order._id}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Grand Total:</span>
                      <p style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>${order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payment Mode:</span>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#ffffff', backgroundColor: '#ff708a', padding: '1px 8px', borderRadius: 4, marginTop: 3, display: 'inline-block' }}>{order.paymentMode}</p>
                    </div>
                  </div>

                  {/* Visual Status Stepper */}
                  <div style={{ margin: '24px 0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff', padding: '16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 6 }}>Fulfillment Tracking Timeline:</span>
                    {renderStatusStepper(order.status)}
                  </div>

                  {/* Items expansion */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Items Ordered:</span>
                    {order.cartItems.map((item, index) => {
                      const img = item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`;
                      return (
                        <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <img src={img} alt={item.title} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: '#ffffff' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quantity: {item.quantity} &bull; Price: ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
      
      {/* CSS Animation Keyframes for Simulating Spinner */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
