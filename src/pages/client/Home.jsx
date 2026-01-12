import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import ProductCard from '../../components/ProductCard.jsx';
import { useSocket } from '../../context/SocketContext';
import {
  Truck,
  Shield,
  Leaf,
  RotateCcw,
  ShoppingBag,
  Search,
  ArrowRight,
  Gift,
  Clock,
  Star,
  ChevronRight,
  Zap,
  Package,
  BadgeCheck,
  Timer,
  Percent,
  Headphones,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Box,
  Heart,
  TrendingUp,
  Award,
  MapPin,
  Users
} from 'lucide-react';
import './Home.css';

// Custom hook for animated counter
const useAnimatedCounter = (endValue, duration = 2000, shouldAnimate = false) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate) return;

    const numericEnd = parseInt(endValue.replace(/[^0-9]/g, '')) || 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(numericEnd * easeOutQuart);

      setCount(currentCount);

      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };

    countRef.current = requestAnimationFrame(animate);

    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [endValue, duration, shouldAnimate]);

  // Format the counter with suffix
  const suffix = endValue.replace(/[0-9]/g, '');
  return count > 0 ? `${count}${suffix}` : endValue;
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState({});
  const [statsVisible, setStatsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { socket } = useSocket() || {};
  const observerRef = useRef(null);
  const statsRef = useRef(null);
  const heroRef = useRef(null);

  // Mouse tracking for magnetic effect
  const handleMouseMove = useCallback((e) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
            // Check if stats section is visible
            if (entry.target.id === 'hero-stats') {
              setStatsVisible(true);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    // Observe sections for scroll animations
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observerRef.current?.observe(section));

    // Observe stats section
    if (statsRef.current) {
      observerRef.current?.observe(statsRef.current);
    }
  }, [loading]);


  useEffect(() => {
    if (!socket) return;

    const handleProductUpdate = () => fetchData();
    const handleCategoryUpdate = () => fetchData();

    socket.on('product_updated', handleProductUpdate);
    socket.on('category_updated', handleCategoryUpdate);

    return () => {
      socket.off('product_updated', handleProductUpdate);
      socket.off('category_updated', handleCategoryUpdate);
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      setError(null);
      const [featuredRes, categoriesRes] = await Promise.all([
        axios.get('/products/featured').catch(() => ({ data: [] })),
        axios.get('/categories').catch(() => ({ data: [] }))
      ]);
      setFeaturedProducts(featuredRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load content. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/store?category=${categoryId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleQuickSearch = (term) => {
    navigate(`/store?search=${encodeURIComponent(term)}`);
  };

  if (loading) {
    return (
      <div className="hp-loading">
        <div className="hp-loading-container">
          <div className="hp-loading-spinner">
            <div className="hp-spinner-ring"></div>
            <div className="hp-spinner-ring hp-ring-2"></div>
            <div className="hp-spinner-ring hp-ring-3"></div>
            <ShoppingBag size={24} className="hp-loading-icon" />
          </div>
          <div className="hp-loading-text">
            <span>Loading fresh products</span>
            <div className="hp-loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Package, value: '500+', label: 'Products', color: '#10b981' },
    { icon: Users, value: '10K+', label: 'Happy Customers', color: '#6366f1' },
    { icon: Timer, value: '30min', label: 'Avg. Delivery', color: '#f59e0b' },
    { icon: Award, value: '99%', label: 'Satisfaction', color: '#ec4899' }
  ];

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'Orders ₹500+', highlight: true },
    { icon: Shield, title: 'Secure Payment', desc: '100% Protected' },
    { icon: Leaf, title: 'Fresh Quality', desc: 'Farm to Table' },
    { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle Free' }
  ];

  return (
    <div className="hp-container">
      {/* Hero Section */}
      <section
        className="hp-hero"
        ref={heroRef}
        onMouseMove={handleMouseMove}
        style={{
          '--mouse-x': `${mousePosition.x}%`,
          '--mouse-y': `${mousePosition.y}%`
        }}
      >
        <div className="hp-hero-bg">
          <div className="hp-hero-gradient"></div>
          <div className="hp-hero-orb hp-orb-1"></div>
          <div className="hp-hero-orb hp-orb-2"></div>
        </div>

        <div className="hp-hero-inner">
          <div className="hp-hero-content">
            <Link to="/store" className="hp-hero-badge">
              <Zap size={14} />
              <span>Express Delivery Available</span>
              <ArrowRight size={12} />
            </Link>

            <h1 className="hp-hero-title">
              <span className="hp-title-line">Fresh Groceries,</span>
              <span className="hp-title-highlight">Delivered Fast</span>
            </h1>

            <p className="hp-hero-desc">
              Premium quality groceries delivered to your doorstep in 30 minutes.
              Fresh vegetables, fruits, dairy & more — handpicked just for you.
            </p>

            <form className="hp-search" onSubmit={handleSearch}>
              <div className="hp-search-inner">
                <Search size={20} className="hp-search-icon" />
                <input
                  type="text"
                  placeholder="Search for groceries, fruits, vegetables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="hp-search-btn">
                  <Search size={18} />
                  <span>Search</span>
                </button>
              </div>
            </form>

            <div className="hp-quick-tags">
              <span className="hp-tags-label">Trending:</span>
              <div className="hp-tags-list">
                {['Fresh Tomatoes', 'Organic Milk', 'Whole Wheat Bread', 'Basmati Rice'].map((term, i) => (
                  <button key={i} onClick={() => handleQuickSearch(term)} className="hp-tag">
                    <TrendingUp size={12} />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hp-hero-visual">
            <div className="hp-visual-card">
              <div className="hp-visual-header">
                <div className="hp-visual-dot"></div>
                <span>Quick Stats</span>
              </div>
              <div className="hp-visual-stats">
                {stats.map((stat, i) => (
                  <div key={i} className="hp-visual-stat" style={{ '--delay': `${i * 0.1}s`, '--color': stat.color }}>
                    <stat.icon size={18} />
                    <div>
                      <strong className="hp-animated-value">{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hp-hero-stats" id="hero-stats" ref={statsRef} data-animate>

          {stats.map((stat, i) => (
            <div key={i} className="hp-stat" style={{ '--delay': `${i * 0.1}s` }}>
              <div className="hp-stat-icon" style={{ '--color': stat.color }}>
                <stat.icon size={20} />
              </div>
              <div className="hp-stat-info">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="hp-error">
          <Shield size={16} />
          <span>{error}</span>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* Features Bar */}
      <section className="hp-features" id="features" data-animate>
        {features.map((feature, i) => (
          <div
            key={i}
            className={`hp-feature ${feature.highlight ? 'hp-feature-highlight' : ''}`}
            style={{ '--delay': `${i * 0.1}s` }}
          >
            <div className="hp-feature-icon">
              <feature.icon size={22} />
            </div>
            <div className="hp-feature-text">
              <strong>{feature.title}</strong>
              <span>{feature.desc}</span>
            </div>
            {feature.highlight && <span className="hp-feature-badge">Popular</span>}
          </div>
        ))}
      </section>

      {/* Categories Section */}
      <section className="hp-section" id="categories" data-animate>
        <div className="hp-section-header">
          <div className="hp-section-title">
            <div className="hp-section-icon">
              <Box size={20} />
            </div>
            <div>
              <span>Browse Collection</span>
              <h2>Shop by Category</h2>
            </div>
          </div>
          <Link to="/store" className="hp-section-link">
            <span>View All</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="hp-categories">
          {categories.length > 0 ? categories.slice(0, 8).map((category, index) => (
            <article
              key={category._id}
              className="hp-category-card"
              onClick={() => handleCategoryClick(category._id)}
              style={{ '--i': index }}
            >
              <div className="hp-category-img">
                {category.image ? (
                  <img
                    src={category.image.startsWith('http') ? category.image : `${category.image.startsWith('/') ? '' : '/'}${category.image}`}
                    alt={category.name}
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.png'; }}
                  />
                ) : (
                  <ShoppingBag size={28} />
                )}
                <div className="hp-category-overlay">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <div className="hp-category-info">
                <h3>{category.name}</h3>
                <span className="hp-category-cta">Shop Now</span>
              </div>
            </article>
          )) : (
            <div className="hp-empty-small">
              <ShoppingBag size={32} />
              <p>Categories coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="hp-promo" id="promo" data-animate>
        <div className="hp-promo-content">
          <div className="hp-promo-badge">
            <Sparkles size={14} />
            <span>Limited Time Offer</span>
          </div>
          <h3>Get <span className="hp-promo-amount">₹100</span> OFF on your first order!</h3>
          <p>Use code <code>FIRST100</code> at checkout • Min. order ₹299</p>
        </div>
        <Link to="/store" className="hp-promo-btn">
          <Gift size={20} />
          <span>Claim Offer</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Featured Products Section */}
      <section className="hp-section" id="products" data-animate>
        <div className="hp-section-header">
          <div className="hp-section-title">
            <div className="hp-section-icon hp-icon-sparkle">
              <Sparkles size={20} />
            </div>
            <div>
              <span>Handpicked for You</span>
              <h2>Featured Products</h2>
            </div>
          </div>
          <Link to="/store" className="hp-section-link">
            <span>Browse All</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="hp-products">
          {featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
            <div key={product._id} className="hp-product-wrap" style={{ '--i': index }}>
              <ProductCard product={product} />
            </div>
          )) : (
            <div className="hp-empty">
              <div className="hp-empty-icon">
                <Package size={40} />
              </div>
              <h3>No Featured Products Yet</h3>
              <p>We're curating the best products for you.</p>
              <Link to="/store" className="hp-empty-btn">
                Browse Store
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="hp-trust" id="trust" data-animate>
        <div className="hp-trust-header">
          <div className="hp-trust-icon-wrap">
            <BadgeCheck size={24} />
          </div>
          <div>
            <span>Why Choose Us</span>
            <h2>Trusted by 10,000+ Happy Customers</h2>
          </div>
        </div>

        <div className="hp-trust-grid">
          {[
            { icon: Truck, title: 'Express Delivery', desc: 'Get your groceries delivered within 30 minutes. Fast, reliable service every time.', tag: '30 MIN', color: '#14b881ff' },
            { icon: CreditCard, title: 'Secure Payments', desc: 'Multiple payment options including UPI, cards & COD with 100% secure transactions.', tag: '100% SAFE', color: '#6366f1' },
            { icon: CheckCircle2, title: 'Quality Assured', desc: 'Every product is quality-checked before delivery. Farm-fresh guaranteed.', tag: 'CERTIFIED', color: '#f59e0b' },
            { icon: Headphones, title: '24/7 Support', desc: 'Our support team is available round the clock to assist you with any queries.', tag: 'ALWAYS ON', color: '#ec4899' }
          ].map((item, i) => (
            <div key={i} className="hp-trust-card" style={{ '--delay': `${i * 0.1}s`, '--color': item.color }}>
              <div className="hp-trust-icon">
                <item.icon size={24} />
              </div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              <span className="hp-trust-tag">{item.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="hp-cta" id="cta" data-animate>
        <div className="hp-cta-bg"></div>
        <div className="hp-cta-content">
          <div className="hp-cta-icon">
            <Clock size={28} />
          </div>
          <div className="hp-cta-text">
            <h3>Ready to Order Fresh Groceries?</h3>
            <p>Fresh groceries delivered in 30 minutes or less — guaranteed!</p>
          </div>
        </div>
        <Link to="/store" className="hp-cta-btn">
          <span>Start Shopping</span>
          <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
};

export default Home;