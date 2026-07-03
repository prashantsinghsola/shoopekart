import React, { useState } from 'react';

export default function LoginSignup({ onLogin, addToast, isUsingFallback }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }
    if (!isLoginTab && !name) {
      addToast('Please enter your name.', 'warning');
      return;
    }

    setIsLoading(true);
    const endpoint = isLoginTab ? '/auth/login' : '/auth/register';
    const payload = isLoginTab 
      ? { email, password }
      : { name, email, password, phone, address };

    if (isUsingFallback) {
      // Offline fallback login handler
      setTimeout(() => {
        setIsLoading(false);
        if (isLoginTab) {
          // Check if mock user
          const mockUser = {
            _id: 'user_fallback',
            name: 'Alex Mercer',
            email: email.toLowerCase(),
            phone: '123-456-7890',
            address: '742 Evergreen Terrace, Springfield'
          };
          onLogin(mockUser);
          addToast(`Logged in successfully as ${mockUser.name} (Offline Mode)`, 'success');
        } else {
          const newUser = {
            _id: 'user_' + Math.random().toString(36).substr(2, 9),
            name,
            email: email.toLowerCase(),
            phone,
            address
          };
          onLogin(newUser);
          addToast(`Account registered successfully for ${name}! (Offline Mode)`, 'success');
        }
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin(data);
      addToast(isLoginTab ? `Welcome back, ${data.name}!` : `Account created! Welcome, ${data.name}!`, 'success');
    } catch (err) {
      setIsLoading(false);
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="auth-page-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 20px',
      backgroundColor: '#ffffff',
      '--color-accent': '#ff708a',
      '--color-accent-hover': '#e04f67',
      '--color-accent-light': '#fff0f2'
    }}>
      <div className="animate-slideup" style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xl)',
        padding: '40px 32px',
        textAlign: 'center'
      }}>
        
        {/* BRAND LOGO RECREATION */}
        <div style={{ marginBottom: 32, userSelect: 'none' }}>
          {/* Stylized Pink S */}
          <div style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '96px',
            fontWeight: '900',
            color: '#ff708a',
            lineHeight: '1',
            margin: '0 auto',
            transform: 'skewX(-6deg)',
            textShadow: '0 4px 10px rgba(255, 112, 138, 0.2)'
          }}>
            S
          </div>
          {/* Outlined SHOPKART */}
          <div style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '28px',
            fontWeight: '800',
            letterSpacing: '3px',
            color: '#ffffff',
            transform: 'skewX(-6deg) scaleY(0.95)',
            textShadow: '-1px -1px 0 #79b9eb, 1px -1px 0 #79b9eb, -1px 1px 0 #79b9eb, 1px 1px 0 #79b9eb', // light blue outline
            lineHeight: '1.2',
            margin: '4px 0'
          }}>
            SHOPKART
          </div>
          {/* BE SMILE BE HAPPY */}
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: '800',
            fontStyle: 'italic',
            letterSpacing: '4px',
            color: '#ff708a',
            marginTop: '6px',
            transform: 'scaleY(0.9)'
          }}>
            BE SMILE BE HAPPY
          </div>
        </div>

        {/* Auth Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 28
        }}>
          <button 
            type="button"
            onClick={() => setIsLoginTab(true)}
            style={{
              flex: 1,
              padding: '12px 0',
              fontWeight: '600',
              fontSize: '15px',
              color: isLoginTab ? '#ff708a' : 'var(--text-secondary)',
              borderBottom: isLoginTab ? '2px solid #ff708a' : '2px solid transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            Login Account
          </button>
          <button 
            type="button"
            onClick={() => setIsLoginTab(false)}
            style={{
              flex: 1,
              padding: '12px 0',
              fontWeight: '600',
              fontSize: '15px',
              color: !isLoginTab ? '#ff708a' : 'var(--text-secondary)',
              borderBottom: !isLoginTab ? '2px solid #ff708a' : '2px solid transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Full Name (Sign Up only) */}
          {!isLoginTab && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Full Name*</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email Address */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Email Address*</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Password*</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Phone Number (Sign Up only) */}
          {!isLoginTab && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Phone Number (Optional)</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="+1 (234) 567-890" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          {/* Address (Sign Up only) */}
          {!isLoginTab && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Delivery Address (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="123 Main St, New York, NY" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              backgroundColor: '#ff708a', 
              color: '#ffffff', 
              padding: '12px', 
              fontWeight: '600', 
              fontSize: '15px',
              borderRadius: 'var(--radius-md)',
              marginTop: '10px',
              boxShadow: '0 4px 12px rgba(255, 112, 138, 0.25)'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isLoginTab ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: 20,
          lineHeight: '1.5'
        }}>
          {isLoginTab 
            ? "By signing in, you agree to ShopKart's Terms of Service and Privacy Policy." 
            : "Registration saves your details. You can update your profile directly from your profile settings."}
        </p>

      </div>
    </div>
  );
}
