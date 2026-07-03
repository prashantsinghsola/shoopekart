import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';

export default function BrowseCatalog({ 
  products, 
  categories, 
  activeCategory, 
  setActiveCategory, 
  searchQuery, 
  setSearchQuery, 
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
  onSelectProduct
}) {
  // Filter States
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('default');

  // Find the absolute maximum price in catalog to calibrate slider limit
  const absoluteMaxPrice = useMemo(() => {
    if (products.length === 0) return 500;
    return Math.ceil(Math.max(...products.map(p => p.price)));
  }, [products]);

  // Sync maxPrice when absolute max price changes
  useEffect(() => {
    setMaxPrice(absoluteMaxPrice);
  }, [absoluteMaxPrice]);

  // Reset all active filters
  const handleClearFilters = () => {
    setActiveCategory(null);
    setSearchQuery('');
    setMaxPrice(absoluteMaxPrice);
    setMinRating(0);
    setSortBy('default');
  };

  // Filter & Sort Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Category Filter
    if (activeCategory) {
      const selectedCatObj = categories.find(c => c.slug === activeCategory);
      if (selectedCatObj) {
        result = result.filter(p => p.category.toLowerCase() === selectedCatObj.name.toLowerCase());
      }
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 3. Price Filter (check active sale price)
    result = result.filter(p => {
      const activePrice = p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price;
      return activePrice <= maxPrice;
    });

    // 4. Rating Filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // 5. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pA = a.discountPrice > 0 && a.discountPrice < a.price ? a.discountPrice : a.price;
        const pB = b.discountPrice > 0 && b.discountPrice < b.price ? b.discountPrice : b.price;
        return pA - pB;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pA = a.discountPrice > 0 && a.discountPrice < a.price ? a.discountPrice : a.price;
        const pB = b.discountPrice > 0 && b.discountPrice < b.price ? b.discountPrice : b.price;
        return pB - pA;
      });
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, categories, activeCategory, searchQuery, maxPrice, minRating, sortBy]);

  return (
    <div className="container animate-fade" style={{ padding: '30px 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '30px',
        alignItems: 'flex-start'
      }}>
        {/* SIDEBAR FILTERS COLUMN */}
        <aside style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px' }}>Filters</h3>
            <button 
              onClick={handleClearFilters}
              style={{ fontSize: '12px', fontWeight: '600', color: '#ff708a' }}
            >
              Clear All
            </button>
          </div>

          {/* Categories list */}
          <div>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setActiveCategory(null)}
                style={{
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: activeCategory === null ? '600' : '400',
                  color: activeCategory === null ? '#ff708a' : 'var(--text-secondary)',
                  padding: '4px 0'
                }}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id || cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  style={{
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: activeCategory === cat.slug ? '600' : '400',
                    color: activeCategory === cat.slug ? '#ff708a' : 'var(--text-secondary)',
                    padding: '4px 0'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Max Price</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="range"
                min="0"
                max={absoluteMaxPrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ff708a' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                <span>$0</span>
                <span style={{ color: '#ff708a', fontSize: '13px' }}>Up to ${maxPrice}</span>
              </div>
            </div>
          </div>

          {/* Star Ratings Filter */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Customer Rating</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: minRating === stars ? '#ff708a' : 'var(--text-secondary)',
                    fontWeight: minRating === stars ? '600' : '400',
                    textAlign: 'left'
                  }}
                >
                  {/* Render Stars */}
                  <span style={{ display: 'flex', color: 'var(--color-warning)' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg 
                        key={i} 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill={i < stars ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </span>
                  <span>& Up</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CATALOG CATALOG GRID COLUMN */}
        <main>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 20px'
          }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                Showing {filteredAndSortedProducts.length} of {products.length} products
              </span>
              {searchQuery && (
                <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  for "{searchQuery}"
                </span>
              )}
            </div>

            {/* Sorting controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Sort by:</label>
              <select 
                className="form-control" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)', width: '160px' }}
              >
                <option value="default">Default Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Grid of Product Cards */}
          {filteredAndSortedProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 0',
              backgroundColor: '#ffffff',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No products match your criteria</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Try relaxing your search keywords, price limits, or rating filters.
              </p>
              <button 
                className="btn btn-primary"
                style={{ backgroundColor: '#ff708a' }}
                onClick={handleClearFilters}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid animate-fade">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlistItems.some(item => item._id === product._id)}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
