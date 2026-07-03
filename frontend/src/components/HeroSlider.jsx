import React, { useState, useEffect, useRef } from 'react';

// Default gorgeous slides if database has no hero images configured yet
const DEFAULT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    title: 'Summer Collection 2026',
    subtitle: 'Revamp your wardrobe with up to 50% off on premium apparel.'
  },
  {
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80',
    title: 'Smart Tech Electronics',
    subtitle: 'Discover cutting-edge gadgets and premium sound systems designed for tomorrow.'
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
    title: 'Step into Comfort',
    subtitle: 'Unmatched durability and sleek style with our new high-performance activewear footwear.'
  }
];

export default function HeroSlider({ heroImages = [] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Compile active slides list
  const slides = heroImages.length > 0 
    ? heroImages.map((img, idx) => ({
        image: img.startsWith('data:') || img.startsWith('http') ? img : `http://localhost:5000${img}`,
        title: idx === 0 ? 'Fresh New Arrivals' : idx === 1 ? 'Curated Just For You' : 'Unbeatable Price Drops',
        subtitle: 'Handpicked products crafted for premium living.'
      }))
    : DEFAULT_SLIDES;

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section 
      className="container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-section">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div 
              key={index} 
              className={`hero-slide ${isActive ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
            </div>
          );
        })}

        {/* Slide navigation dots */}
        {slides.length > 1 && (
          <div className="hero-dots">
            {slides.map((_, index) => (
              <button 
                key={index} 
                className={`hero-dot ${index === current ? 'active' : ''}`}
                onClick={() => setCurrent(index)}
                title={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
