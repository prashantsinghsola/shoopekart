import React from 'react';

export default function CategoryBar({ categories, activeCategory, setActiveCategory, onGoHome, isHomeActive = false }) {
  return (
    <div className="category-bar-wrapper">
      <div className="container category-bar">
        {/* Home Link */}
        <button
          className={`category-item ${isHomeActive ? 'active' : ''}`}
          onClick={() => onGoHome && onGoHome()}
        >
          Home
        </button>

        {/* All Products Item */}
        <button 
          className={`category-item ${activeCategory === null ? 'active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All Categories
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button 
              key={cat._id || cat.slug}
              className={`category-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(isActive ? null : cat.slug)}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
