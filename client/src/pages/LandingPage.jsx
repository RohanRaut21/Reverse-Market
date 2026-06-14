import React, { useState, useEffect } from 'react';
import heroImage from '../assets/buyer_hero_card.png';
import { 
  ArrowRight, 
  Search, 
  MapPin, 
  Laptop, 
  Home, 
  Shirt, 
  Wrench, 
  Car, 
  Briefcase, 
  Grid,
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Lock,
  Star,
  ExternalLink
} from 'lucide-react';

const LandingPage = ({ onLoginClick, user, onGoToDashboard }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [amazonProducts, setAmazonProducts] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'find-deals', 'features', 'stats', 'about'];
      const scrollPosition = window.scrollY + 120; // Offset for sticky navbar height

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const performSearch = async (query) => {
    if (!query || query.trim() === '') {
      setAmazonProducts([]);
      return;
    }

    try {
      const res = await fetch(`/api/amazon/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAmazonProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch Amazon products:', err);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery);
    }
  };

  const handleCategoryClick = (categoryName) => {
    if (categoryName === 'All Categories') {
      setSearchQuery('');
      setAmazonProducts([]);
    } else {
      setSearchQuery(categoryName);
      performSearch(categoryName);
    }
  };

  const handleImportProduct = async (product) => {
    setToastMessage(`Fetching real-time product specs from Amazon...`);
    
    try {
      const res = await fetch(`/api/amazon/product/${product.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem('reverseMarket_importedProduct', JSON.stringify(data.data));
        setToastMessage(`"${product.title}" saved! Redirecting to login to create request...`);
      } else {
        localStorage.setItem('reverseMarket_importedProduct', JSON.stringify(product));
        setToastMessage(`"${product.title}" saved! Redirecting to login to create request...`);
      }
    } catch (err) {
      console.error('Failed to fetch detailed specifications:', err);
      localStorage.setItem('reverseMarket_importedProduct', JSON.stringify(product));
      setToastMessage(`"${product.title}" saved! Redirecting to login to create request...`);
    }
    
    setTimeout(() => {
      setToastMessage('');
      onLoginClick();
    }, 2000);
  };

  const categories = [
    { name: 'Electronics', icon: Laptop },
    { name: 'Home & Kitchen', icon: Home },
    { name: 'Fashion', icon: Shirt },
    { name: 'Machinery', icon: Wrench },
    { name: 'Vehicles', icon: Car },
    { name: 'Services', icon: Briefcase },
    { name: 'All Categories', icon: Grid },
  ];

  const features = [
    {
      title: 'Buyer in Control',
      desc: 'You post what you need, and sellers compete for your business.',
      icon: CheckCircle
    },
    {
      title: 'Best Prices',
      desc: 'Compare offers and choose the best price that suits you.',
      icon: Zap
    },
    {
      title: 'Verified Sellers',
      desc: 'All sellers are verified for your safety and trust.',
      icon: ShieldCheck
    },
    {
      title: 'Save Time',
      desc: 'Multiple offers in one place, saving you valuable time.',
      icon: Clock
    },
    {
      title: 'Secure Payments',
      desc: 'Escrow protection and safe transactions you can rely on.',
      icon: Lock
    }
  ];

  const stats = [
    { count: '25,000+', label: 'Happy Buyers' },
    { count: '15,000+', label: 'Verified Sellers' },
    { count: '50,000+', label: 'Requests Posted' },
    { count: '1,00,000+', label: 'Offers Received' }
  ];

  return (
    <div className="min-h-screen bg-darkBg text-white overflow-x-hidden font-sans">
      {/* Header / Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0d19]/90 backdrop-blur-md border-b border-darkBg-border/40">
        <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white text-lg">
              R
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Reverse<span className="text-brand">Market</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              { id: 'home', label: 'Home' },
              { id: 'find-deals', label: 'Find Deals' },
              { id: 'features', label: 'How It Works' },
              { id: 'stats', label: 'Stats' },
              { id: 'about', label: 'About Us' }
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`transition-all duration-300 py-1.5 relative ${
                    isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full transition-all duration-300" />
                  )}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button 
                  onClick={() => onGoToDashboard()}
                  className="px-4 py-2 text-sm font-semibold bg-brand hover:bg-brand-hover text-white rounded-xl shadow-lg shadow-brand/20 transition-all"
                >
                  Go to Dashboard
                </button>
                <div className="flex items-center gap-2.5 border-l border-darkBg-border/40 pl-4">
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
                    alt={user.name || 'User Profile'}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand/20"
                  />
                  <span className="text-xs font-semibold text-slate-300 hidden sm:block">
                    {user.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="px-4 py-2 text-sm font-semibold border border-darkBg-border hover:bg-darkBg-hover rounded-xl transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={onLoginClick}
                  className="px-4 py-2 text-sm font-semibold bg-brand hover:bg-brand-hover text-white rounded-xl shadow-lg shadow-brand/20 transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center scroll-mt-24">
        {/* Left Column Hero Copy */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-xs font-bold text-brand">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
            Buyer Driven. Sellers Compete. You Win.
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            You Request.<br />
            <span className="bg-gradient-to-r from-brand via-purple-400 to-brand-blue bg-clip-text text-transparent">
              Sellers Compete.
            </span><br />
            You Win.
          </h1>
          
          <p className="text-slate-400 text-base lg:text-lg max-w-lg leading-relaxed">
            Post what you need, receive competitive offers from verified sellers, compare and choose the best.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button 
              onClick={user ? () => onGoToDashboard('Buyer') : onLoginClick}
              className="w-full sm:w-auto px-6 py-4 bg-brand hover:bg-brand-hover rounded-2xl font-bold flex items-center justify-between sm:justify-center gap-8 shadow-lg shadow-brand/20 transition-all group"
            >
              <div className="text-left">
                <span className="block text-xs text-brand-blue font-bold tracking-wider uppercase">I'm a Buyer</span>
                <span className="text-sm">Post a Request</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </button>

            <button 
              onClick={user ? () => onGoToDashboard('Seller') : onLoginClick}
              className="w-full sm:w-auto px-6 py-4 bg-darkBg-card hover:bg-darkBg-hover border border-darkBg-border rounded-2xl font-bold flex items-center justify-between sm:justify-center gap-8 transition-all group"
            >
              <div className="text-left">
                <span className="block text-xs text-slate-400 font-bold tracking-wider uppercase">I'm a Seller</span>
                <span className="text-sm">Start Bidding</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-darkBg-border flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>

          {/* Micro badges */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-brand-blue" /> 100% Free to Post</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-blue" /> Verified Sellers</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-brand-blue" /> Secure & Safe</span>
          </div>
        </div>

        {/* Right Column Bidding Status Illustration & Floating UI Cards */}
        <div className="lg:col-span-6 flex justify-center items-center relative h-[450px] mt-8 lg:mt-0">
          {/* Background lights */}
          <div className="absolute w-[300px] h-[300px] bg-brand/10 rounded-full blur-3xl -z-10"></div>
          
          {/* Main Illustration Card */}
          <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-3xl overflow-hidden border border-brand/20 bg-darkBg-card shadow-2xl shadow-brand/5 p-1 transition-all hover:border-brand/40 duration-500 group">
            <img 
              src={heroImage} 
              alt="ReverseMarket illustration" 
              className="w-full h-full object-cover rounded-[22px] group-hover:scale-[1.01] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d19]/70 via-transparent to-transparent pointer-events-none rounded-[22px]"></div>
          </div>

          {/* Floating Card 1: Best Offer */}
          <div className="absolute -top-6 -left-8 bg-[#121426]/95 backdrop-blur-md p-3.5 rounded-2xl border border-brand/35 shadow-2xl flex flex-col w-44 transition-all hover:scale-105 hover:-translate-y-1 duration-300">
            <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1">🏆 Best Offer</span>
            <span className="text-sm font-bold text-white mt-1">₹10,800</span>
            <div className="flex items-center justify-between mt-1.5 border-t border-darkBg-border/40 pt-1.5">
              <span className="text-[10px] text-slate-400 font-medium">Shree Traders</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-bold">★ 4.9</span>
            </div>
          </div>

          {/* Floating Card 2: Active Request */}
          <div className="absolute -bottom-6 -right-6 bg-[#121426]/95 backdrop-blur-md p-3.5 rounded-2xl border border-darkBg-border shadow-2xl flex flex-col w-48 transition-all hover:scale-105 hover:translate-y-1 duration-300">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Request</span>
            <span className="text-xs font-bold text-white mt-0.5">Wireless Headphones</span>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 border-t border-darkBg-border/40 pt-1.5">
              <span>Budget: <strong className="text-white font-medium">₹10k</strong></span>
              <span className="text-brand font-bold bg-brand/10 px-1.5 py-0.5 rounded text-[8px]">Active</span>
            </div>
          </div>

          {/* Floating Card 3: Offer Received */}
          <div className="absolute top-1/4 -right-12 bg-[#121426]/95 backdrop-blur-md p-3.5 rounded-2xl border border-darkBg-border shadow-2xl flex flex-col w-40 transition-all hover:scale-105 duration-300">
            <span className="text-[10px] text-slate-400 font-semibold">Offer Received</span>
            <span className="text-sm font-bold text-white mt-0.5">₹9,450</span>
            <div className="flex items-center justify-between mt-1.5 border-t border-darkBg-border/40 pt-1.5">
              <span className="text-[10px] text-slate-300">Global Supplies</span>
              <span className="text-[9px] bg-brand text-white px-1.5 py-0.5 rounded font-bold">★ 4.6</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Categories Bar */}
      <section id="find-deals" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-24">
        <div className="bg-[#121426] border border-darkBg-border rounded-3xl p-8 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white">Find What You Need</h3>
          
          {/* Main Search Panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-9 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  performSearch(e.target.value);
                }}
                onKeyDown={handleSearchKeyPress}
                placeholder="Type a product name (e.g. laptop, phone, chair, shirt)..." 
                className="w-full pl-12 pr-4 py-4 bg-[#0b0d19] border border-darkBg-border rounded-2xl focus:outline-none focus:border-brand text-sm text-white placeholder-slate-500"
              />
            </div>

            <button 
              onClick={() => performSearch(searchQuery)}
              className="md:col-span-3 py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl transition-all shadow-md shadow-brand/20"
            >
              Search Products
            </button>
          </div>

          {/* Category Grid */}
          <div className="flex flex-wrap gap-3 pt-2">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button 
                  key={idx}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex items-center gap-2.5 px-5 py-3 bg-[#0b0d19] hover:bg-darkBg-hover border border-darkBg-border rounded-2xl text-xs font-semibold text-slate-300 hover:text-white transition-all"
                >
                  <Icon className="w-4 h-4 text-brand" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Amazon Products Grid */}
          {amazonProducts.length > 0 && (
            <div className="pt-6 border-t border-darkBg-border/40 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Amazon Deals
                  </span>
                  <h4 className="text-sm font-bold text-slate-300">
                    Results for "{searchQuery || 'Popular Products'}"
                  </h4>
                </div>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setAmazonProducts([]);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors hover:underline"
                >
                  Clear Results
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {amazonProducts.map((prod) => (
                  <div 
                    key={prod.id} 
                    className="bg-[#0b0d19] border border-darkBg-border hover:border-brand/40 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 flex flex-col h-full group shadow-md"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-[#000]/20">
                      <img 
                        src={prod.image} 
                        alt={prod.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="text-[9px] bg-[#000]/70 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-extrabold uppercase">
                          Amazon
                        </span>
                        {prod.rating >= 4.5 && (
                          <span className="text-[9px] bg-brand text-white px-1.5 py-0.5 rounded font-bold">
                            Top Choice
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 flex flex-col flex-1 space-y-2">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h5 className="text-xs font-bold text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-brand transition-colors">
                        {prod.title}
                      </h5>

                      {/* Ratings */}
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < Math.floor(prod.rating) 
                                  ? 'text-amber-400 fill-amber-400' 
                                  : 'text-slate-600'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-300 font-bold ml-1">
                          {prod.rating}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          ({prod.reviews.toLocaleString()})
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-sm font-extrabold text-white">
                          {prod.price}
                        </span>
                        <span className="text-[10px] text-slate-500 line-through">
                          {prod.originalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-1.5 p-3 border-t border-darkBg-border/40 bg-darkBg/10">
                      <a 
                        href={prod.amazonUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="py-2 bg-darkBg hover:bg-darkBg-hover border border-darkBg-border text-[10px] font-semibold text-slate-300 hover:text-white rounded-lg flex items-center justify-center gap-1 transition-all"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <button 
                        onClick={() => handleImportProduct(prod)}
                        className="py-2 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg transition-all shadow-sm"
                      >
                        Import & Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose ReverseMarket */}
      <section id="features" className="bg-[#121426]/50 border-y border-darkBg-border py-20 px-6 scroll-mt-24">
        <div className="max-w-7xl mx-auto space-y-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-center tracking-tight">
            Why Choose Reverse Market?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-[#121426] border border-darkBg-border p-6 rounded-2xl space-y-4 hover:border-brand/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center space-y-2 bg-[#121426]/40 p-8 rounded-2xl border border-darkBg-border/40">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-brand to-brand-blue bg-clip-text text-transparent">
                {stat.count}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-24 border-t border-darkBg-border/40 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: About Text */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] bg-brand/10 text-brand border border-brand/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              About ReverseMarket
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Empowering Buyers, Connecting Sellers.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              ReverseMarket was founded with a single mission: to reverse the traditional buyer-seller dynamic. Instead of buyers searching endlessly for products and comparing prices, we enable buyers to state their requirements clearly and let verified sellers compete for their business.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our platform ensures absolute transparency, competitive pricing, and secure escrow protections so that every transaction is reliable, safe, and mutually beneficial.
            </p>
          </div>

          {/* Right: Key Pillars / Values */}
          <div className="lg:col-span-5 space-y-4">
            {[
              { title: 'Our Vision', desc: 'To build the most trusted and efficient buyer-driven procurement engine globally.' },
              { title: 'Our Mission', desc: 'To lower procurement costs for buyers while creating direct sales channels for sellers.' },
              { title: 'Core Values', desc: 'Transparency, security, seller verification, and buyer-first empowerment.' }
            ].map((pillar, idx) => (
              <div key={idx} className="bg-[#121426] border border-darkBg-border p-5 rounded-2xl space-y-1.5 hover:border-brand/30 transition-all duration-300">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{pillar.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-darkBg-border/40 py-8 bg-[#0b0d19] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">ReverseMarket</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Support Help</a>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121426] border-2 border-brand/50 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideIn">
          <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-brand" />
          </div>
          <div>
            <p className="text-xs font-bold">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
