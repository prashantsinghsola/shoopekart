import React from 'react';

export default function Footer({ settings }) {
  const email = settings.footerEmail || 'support@shopkart.com';
  const phone = settings.footerPhone || '+1 (234) 567-890';
  const address = settings.footerAddress || '123 ShopKart Ave, Commerce City, USA';
  const footerText = settings.footerText || '© 2026 ShopKart. All rights reserved.';

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Company Brand Column */}
          <div>
            <div className="footer-logo">
              {settings.logoType === 'text' ? (
                settings.logoText || 'ShopKart'
              ) : (
                'ShopKart'
              )}
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: 16 }}>
              Experience the best in online retail. ShopKart brings you curated categories, handpicked styles, and secure checkout, all in one premium shopping destination.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="footer-heading">Shop Directory</h4>
            <ul className="footer-links">
              <li><a href="#men">Men's Clothes</a></li>
              <li><a href="#women">Women's Clothes</a></li>
              <li><a href="#electronics">Electronics</a></li>
              <li><a href="#shoes">Shoes Collection</a></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h4 className="footer-heading">Customer Support</h4>
            <ul className="footer-links">
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#shipping">Shipping & Returns</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <h4 className="footer-heading">Get in Touch</h4>
            <p style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <a href={`tel:${phone}`}>{phone}</a>
            </p>
            <p style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 4 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{address}</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>{footerText}</p>
          <div className="footer-socials">
            <a href="#fb" className="footer-social-icon" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#tw" className="footer-social-icon" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a href="#ig" className="footer-social-icon" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
