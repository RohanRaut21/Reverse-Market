import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import BidComparisonView from './pages/BidComparisonView';
import MessagesPage from './pages/MessagesPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CreateRequestModal from './components/CreateRequestModal';
import PlaceBidModal from './components/PlaceBidModal';
import { 
  Plus, 
  Search, 
  Clock, 
  Gavel, 
  Check, 
  X, 
  UserCheck, 
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Tag,
  Star,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Briefcase,
  Upload,
  Calendar,
  Lock,
  ChevronRight,
  TrendingDown,
  ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function AppContent() {
  const { user, loading, activeRole, toggleActiveRole, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [viewingHomepage, setViewingHomepage] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPlaceBidModalOpen, setIsPlaceBidModalOpen] = useState(false);
  
  // Shared state for request details / comparison / place bid target
  const [currentCompareRequest, setCurrentCompareRequest] = useState(null);
  const [currentPlaceBidRequest, setCurrentPlaceBidRequest] = useState(null);
  const [defaultChatRecipient, setDefaultChatRecipient] = useState(null);

  // Profile Settings Form State
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsBusinessName, setSettingsBusinessName] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsTier, setSettingsTier] = useState('Free');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Seller browse requests state
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseCategory, setBrowseCategory] = useState('All');
  const [browseRequests, setBrowseRequests] = useState([]);
  const [browseLoading, setBrowseLoading] = useState(false);

  // Seller My Bids state
  const [myBids, setMyBids] = useState([]);
  const [myBidsLoading, setMyBidsLoading] = useState(false);
  const [myBidsFilter, setMyBidsFilter] = useState('All');

  // Buyer requests state (specifically for comparing bids directly)
  const [buyerRequests, setBuyerRequests] = useState([]);
  const [buyerRequestsLoading, setBuyerRequestsLoading] = useState(false);

  // Sync settings inputs when user data loads
  useEffect(() => {
    if (user) {
      setSettingsName(user.name || '');
      setSettingsEmail(user.email || '');
      setSettingsBusinessName(user.businessName || '');
      setSettingsPhone(user.phone || '');
      setSettingsTier(user.tier || 'Free');
    }
  }, [user]);

  // Reset showAuthPage and viewingHomepage to false when user logs out (user becomes null) to redirect to homepage
  useEffect(() => {
    if (!user) {
      setShowAuthPage(false);
      setViewingHomepage(false);
    }
  }, [user]);

  // Load seller browse requests or bids based on tab
  useEffect(() => {
    if (user && activeRole === 'Seller') {
      if (activeTab === 'browseRequests') {
        fetchBrowseRequests();
      } else if (activeTab === 'myBids') {
        fetchMyBids();
      }
    }
  }, [user, activeRole, activeTab, browseCategory]);

  // Load buyer requests when viewing received bids
  useEffect(() => {
    if (user && activeRole === 'Buyer' && activeTab === 'receivedBids') {
      fetchBuyerRequests();
    }
  }, [user, activeRole, activeTab]);

  const fetchBuyerRequests = async () => {
    try {
      setBuyerRequestsLoading(true);
      const res = await fetch('/api/requests/my');
      const data = await res.json();
      if (data.success) {
        setBuyerRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching buyer requests for comparison:', err);
    } finally {
      setBuyerRequestsLoading(false);
    }
  };

  const fetchBrowseRequests = async () => {
    try {
      setBrowseLoading(true);
      const res = await fetch(`/api/requests?status=Active&category=${browseCategory === 'All' ? 'All' : browseCategory}&search=${browseSearch}`);
      const data = await res.json();
      if (data.success) {
        setBrowseRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBrowseLoading(false);
    }
  };

  const fetchMyBids = async () => {
    try {
      setMyBidsLoading(true);
      const res = await fetch('/api/bids/my');
      const data = await res.json();
      if (data.success) {
        setMyBids(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMyBidsLoading(false);
    }
  };

  const handleWithdrawBid = async (bidId) => {
    try {
      const res = await fetch(`/api/bids/${bidId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Withdrawn' })
      });
      const data = await res.json();
      if (data.success) {
        fetchMyBids();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settingsName,
          email: settingsEmail,
          businessName: settingsBusinessName,
          phone: settingsPhone,
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setSettingsSuccess('Profile updated successfully!');
      } else {
        setSettingsError(data.message || 'Error updating profile');
      }
    } catch (err) {
      setSettingsError('Connection error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-semibold">Initializing ReverseMarket...</span>
        </div>
      </div>
    );
  }

  // Not Authenticated flow
  if (!user) {
    if (showAuthPage) {
      return <AuthPage onBackToLanding={() => setShowAuthPage(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowAuthPage(true)} />;
  }

  // Authenticated but viewing Homepage
  if (viewingHomepage) {
    return (
      <LandingPage 
        onLoginClick={() => setViewingHomepage(false)} 
        user={user} 
        onGoToDashboard={(role) => {
          if (role === 'Buyer' && activeRole !== 'Buyer') {
            toggleActiveRole();
          } else if (role === 'Seller' && activeRole !== 'Seller') {
            toggleActiveRole();
          }
          setViewingHomepage(false);
        }} 
      />
    );
  }

  // Helper for rendering content pane based on active tab and role
  const renderContent = () => {
    if (activeRole === 'Buyer') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <BuyerDashboard 
              onCreateRequestClick={() => setIsCreateModalOpen(true)} 
              onRequestClick={(req) => {
                setCurrentCompareRequest(req);
                setActiveTab('receivedBids');
              }}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          );
        
        case 'requests':
          return (
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">My Requests</h2>
                  <p className="text-slate-400 text-sm mt-1">Manage all requirements posted by you.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Request</span>
                </button>
              </div>

              {/* Just load BuyerDashboard table view but stretched */}
              <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl">
                <BuyerDashboard 
                  onCreateRequestClick={() => setIsCreateModalOpen(true)} 
                  onRequestClick={(req) => {
                    setCurrentCompareRequest(req);
                    setActiveTab('receivedBids');
                  }}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
          );

        case 'receivedBids':
          if (currentCompareRequest) {
            return (
              <BidComparisonView 
                request={currentCompareRequest} 
                onBack={() => {
                  setCurrentCompareRequest(null);
                }} 
                onChatClick={(seller) => {
                  setDefaultChatRecipient(seller);
                  setActiveTab('messages');
                }}
              />
            );
          }

          const getRemainingDaysApp = (deadlineStr) => {
            const deadline = new Date(deadlineStr);
            const today = new Date();
            const timeDiff = deadline - today;
            const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (dayDiff < 0) return 'Deadline passed';
            if (dayDiff === 0) return 'Today';
            return `${dayDiff} days left`;
          };

          const getStatusColorApp = (status) => {
            switch (status) {
              case 'Active':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
              case 'Bidding Closed':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
              case 'In Progress':
                return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
              case 'Completed':
                return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
              default:
                return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
            }
          };

          return (
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Gavel className="w-6 h-6 text-brand" />
                  Compare Received Bids
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Select one of your requests below to view and compare bids submitted by sellers.
                </p>
              </div>

              {buyerRequestsLoading ? (
                <div className="bg-darkBg-card border border-darkBg-border p-12 rounded-3xl text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading your requests...</span>
                </div>
              ) : buyerRequests.length === 0 ? (
                <div className="bg-darkBg-card border border-darkBg-border p-12 rounded-3xl text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                  <Gavel className="w-10 h-10 text-slate-600" />
                  <span>You have not posted any requests yet. Create a request on the Dashboard to start receiving bids!</span>
                </div>
              ) : (
                <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="divide-y divide-darkBg-border">
                    {buyerRequests.map((req) => (
                      <div 
                        key={req._id}
                        onClick={() => setCurrentCompareRequest(req)}
                        className="py-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-darkBg-hover/30 px-3 -mx-3 rounded-2xl cursor-pointer transition-all duration-200 group gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img 
                            src={req.images?.[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100'} 
                            alt={req.title} 
                            className="w-14 h-14 rounded-xl object-cover border border-darkBg-border flex-shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white group-hover:text-brand transition-colors">
                                {req.title}
                              </h4>
                              {req.featured && (
                                <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-bold uppercase">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium">
                              {req.category} • Budget: <strong className="text-white font-semibold">₹{req.budget.toLocaleString()}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                              <span className="text-brand font-semibold ml-1">({getRemainingDaysApp(req.deadline)})</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 self-stretch sm:self-auto">
                          <div className="text-left sm:text-right">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block sm:hidden ${getStatusColorApp(req.status)} mb-2`}>
                              {req.status}
                            </span>
                            <div className="flex items-center gap-2 sm:block">
                              <span className="text-sm font-extrabold text-white block">
                                {req.bidCount || 0}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {req.status === 'In Progress' || req.status === 'Completed' ? 'Accepted Bid' : 'Bids Received'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`hidden sm:inline-block text-[11px] px-2.5 py-1 rounded-full font-bold ${getStatusColorApp(req.status)}`}>
                              {req.status}
                            </span>
                            <button className="text-xs font-bold text-brand bg-brand/10 hover:bg-brand hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-1">
                              Compare
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );

        case 'messages':
          return <MessagesPage defaultRecipient={defaultChatRecipient} />;

        case 'notifications':
          return (
            <div className="p-8 space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-darkBg-border/40">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Notifications</h2>
                  <p className="text-slate-400 text-sm mt-1">Stay updated with activity on your requests.</p>
                </div>
                <button className="text-xs text-brand hover:underline font-semibold">Mark all as read</button>
              </div>

              <div className="space-y-4">
                {[
                  { title: "New bid received on 'Wireless Headphones'", desc: "TechWorld India placed a bid of ₹9,800 with 3 days delivery timeline.", time: "2m ago", unread: true },
                  { title: "Seller replied to your message", desc: "Arjun Verma: 'Hi Rohan, I have placed a bid on your wireless headphones...'", time: "1h ago", unread: true },
                  { title: "Request deadline closed", desc: "Bidding is closed for your request 'Gaming Laptop' as it reached its deadline.", time: "2h ago", unread: false },
                  { title: "You accepted a bid", desc: "You accepted Shree Traders' bid of ₹48,000 for 'Interior Design for 2BHK'.", time: "1 day ago", unread: false },
                  { title: "Deadline warning", desc: "Deadline approaching for 'Ergonomic Office Chair' - 3 days left.", time: "3 days ago", unread: false }
                ].map((notif, idx) => (
                  <div key={idx} className={`p-4 border rounded-2xl flex items-start gap-4 transition-all ${
                    notif.unread 
                      ? 'bg-brand/5 border-brand/20' 
                      : 'bg-darkBg-card border-darkBg-border hover:bg-darkBg-hover/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.unread ? 'bg-brand animate-pulse' : 'bg-slate-600'}`}></div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{notif.desc}</p>
                      <span className="text-[10px] text-slate-500 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'savedSellers':
          return (
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Saved Sellers</h2>
                <p className="text-slate-400 text-sm mt-1">Your bookmarked and preferred partners.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "TechWorld India", business: "TechWorld Solutions", rating: 4.8, jobs: 42, image: "https://api.dicebear.com/7.x/initials/svg?seed=TechWorld" },
                  { name: "Apex Electronics", business: "Apex Electronics Ltd", rating: 4.9, jobs: 18, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200" },
                  { name: "FashionHub Corporate", business: "FashionHub Fabrics", rating: 4.7, jobs: 85, image: "https://api.dicebear.com/7.x/initials/svg?seed=FashionHub" }
                ].map((seller, idx) => (
                  <div key={idx} className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl space-y-4 hover:border-brand/30 transition-all flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <img src={seller.image} alt={seller.name} className="w-12 h-12 rounded-xl object-cover border border-darkBg-border" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{seller.business}</h4>
                        <span className="text-xs text-slate-400">{seller.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs border-t border-darkBg-border/40 pt-3 text-slate-400">
                      <span className="flex items-center gap-0.5"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {seller.rating}</span>
                      <span>{seller.jobs} Jobs Completed</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button 
                        onClick={() => {
                          setDefaultChatRecipient({ _id: 'mockSeller' + idx, name: seller.name, businessName: seller.business, role: 'Seller', rating: seller.rating });
                          setActiveTab('messages');
                        }}
                        className="py-2 bg-darkBg hover:bg-darkBg-hover border border-darkBg-border text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>
                      <button className="py-2 bg-brand/10 hover:bg-brand/20 text-brand font-bold rounded-xl text-xs">
                        Invite to Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'orders':
          return (
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">My Orders</h2>
                <p className="text-slate-400 text-sm mt-1">Track orders in progress and view transaction details.</p>
              </div>

              <div className="bg-darkBg-card border border-darkBg-border rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-darkBg-border bg-[#0b0d19]/40 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Item Details</th>
                      <th className="p-4">Seller Partner</th>
                      <th className="p-4 text-right">Escrow Amount</th>
                      <th className="p-4 text-center">Delivery Deadline</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBg-border/40">
                    <tr className="hover:bg-darkBg-hover/10">
                      <td className="p-4">
                        <h4 className="font-bold text-white">Interior Design for 2BHK</h4>
                        <span className="text-[10px] text-slate-400">Services • ID: #ORD-73921</span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-semibold block">Shree Traders</span>
                        <span className="text-[10px] text-slate-500">Completed 15 projects</span>
                      </td>
                      <td className="p-4 text-right font-extrabold text-white">₹48,000</td>
                      <td className="p-4 text-center text-slate-300">15 Days (June 29, 2026)</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">In Progress</span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg transition-all">Mark Completed</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-darkBg-hover/10">
                      <td className="p-4">
                        <h4 className="font-bold text-white">Bulk T-Shirts (100 Pieces)</h4>
                        <span className="text-[10px] text-slate-400">Fashion • ID: #ORD-58193</span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-semibold block">FashionHub</span>
                        <span className="text-[10px] text-slate-500">Completed 85 projects</span>
                      </td>
                      <td className="p-4 text-right font-extrabold text-white">₹11,500</td>
                      <td className="p-4 text-center text-slate-300">Closed (May 17, 2026)</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">Completed</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-slate-400 font-semibold">Reviewed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );

        case 'payments':
          return (
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Payments & Escrow</h2>
                <p className="text-slate-400 text-sm mt-1">Review your invoices, escrow holdings, and spending history.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">Total Deposited</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">₹59,500</span>
                  <span className="text-[10px] text-emerald-400 mt-2 block font-semibold">★ Escrow Protection fully active</span>
                </div>
                <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">In Escrow Holding</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">₹48,000</span>
                  <span className="text-[10px] text-blue-400 mt-2 block font-semibold">1 Active contract</span>
                </div>
                <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">Completed Payouts</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">₹11,500</span>
                  <span className="text-[10px] text-slate-400 mt-2 block font-semibold">1 Released contract</span>
                </div>
              </div>

              <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Payment Transactions Log</h3>
                <div className="divide-y divide-darkBg-border text-xs">
                  <div className="py-3.5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">Released Escrow to FashionHub</h4>
                      <span className="text-[10px] text-slate-500">Invoice: #INV-001 • May 18, 2026</span>
                    </div>
                    <span className="text-red-400 font-extrabold">-₹11,500</span>
                  </div>
                  <div className="py-3.5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">Deposited in Escrow (Shree Traders)</h4>
                      <span className="text-[10px] text-slate-500">Contract: #ORD-73921 • May 15, 2026</span>
                    </div>
                    <span className="text-slate-300 font-extrabold">₹48,000</span>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'reviews':
          return (
            <div className="p-8 space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Reviews & Feedback</h2>
                <p className="text-slate-400 text-sm mt-1">Review ratings submitted by you and received from sellers.</p>
              </div>

              <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase block tracking-wider">Your Buyer Rating</span>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-3xl font-extrabold text-white">5.0</span>
                    <span className="flex items-center text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded text-xs gap-0.5">
                      <Star className="w-3 h-3 fill-current" /> ★★★★★
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <span>Based on 2 jobs completed</span>
                </div>
              </div>
            </div>
          );

        case 'settings':
          return (
            <div className="p-8 space-y-6 max-w-2xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Profile Configuration Settings</h2>
                <p className="text-slate-400 text-sm mt-1">Manage details about your buyer profile and options.</p>
              </div>

              <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-8 shadow-xl">
                {settingsSuccess && <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs">{settingsSuccess}</div>}
                {settingsError && <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">{settingsError}</div>}
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={settingsEmail}
                      onChange={(e) => setSettingsEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Phone Number</label>
                    <input 
                      type="tel"
                      value={settingsPhone}
                      onChange={(e) => setSettingsPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Membership Tier</label>
                    <div className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      {settingsTier} MEMBER
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 transition-all mt-4"
                  >
                    Save Settings
                  </button>
                </form>
              </div>
            </div>
          );

        default:
          return <div className="p-8 text-slate-400 text-sm">Tab {activeTab} coming soon...</div>;
      }
    } else {
      // SELLER ROLE TABS
      switch (activeTab) {
        case 'dashboard':
          return (
            <SellerDashboard 
              user={user}
              onPlaceBidClick={(req) => {
                setCurrentPlaceBidRequest(req);
                setIsPlaceBidModalOpen(true);
              }}
              onViewRequestClick={(req) => {
                setCurrentCompareRequest(req);
                setActiveTab('browseRequests');
              }}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          );

        case 'browseRequests':
          if (currentCompareRequest) {
            return (
              <div className="p-8 space-y-6 max-w-4xl mx-auto">
                <button 
                  onClick={() => setCurrentCompareRequest(null)}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
                >
                  ← Back to Browse Feed
                </button>

                <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-8 space-y-6 shadow-xl">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full border border-brand/20 font-bold uppercase">{currentCompareRequest.category}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Bidding</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{currentCompareRequest.title}</h3>
                  
                  <div className="bg-[#0b0d19] p-4 rounded-xl border border-darkBg-border/50 text-xs text-slate-400 leading-relaxed">
                    {currentCompareRequest.description}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-darkBg-border/40 pt-4">
                    <div>
                      <span className="text-slate-500 font-semibold block">Maximum Budget</span>
                      <strong className="text-white text-base">₹{currentCompareRequest.budget?.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Deadline Date</span>
                      <strong className="text-white text-base flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-brand" />
                        {new Date(currentCompareRequest.deadline).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setCurrentCompareRequest(null)}
                      className="px-5 py-3 border border-darkBg-border hover:bg-darkBg-hover text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      Close Detail
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentPlaceBidRequest(currentCompareRequest);
                        setIsPlaceBidModalOpen(true);
                      }}
                      className="px-5 py-3 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-md shadow-brand/20"
                    >
                      Place Bid Now
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Browse Requests Feed</h2>
                  <p className="text-slate-400 text-sm mt-1">Discover requests published by buyers matching your parameters.</p>
                </div>
              </div>

              {/* Filter controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 relative">
                  <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search keywords..." 
                    value={browseSearch}
                    onChange={(e) => setBrowseSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchBrowseRequests()}
                    className="w-full pl-10 pr-4 py-2.5 bg-darkBg-card border border-darkBg-border rounded-xl text-xs focus:outline-none focus:border-brand text-white"
                  />
                </div>
                <div className="md:col-span-3">
                  <select
                    value={browseCategory}
                    onChange={(e) => setBrowseCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-darkBg-card border border-darkBg-border rounded-xl text-xs text-slate-300 font-semibold focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Services">Services</option>
                    <option value="Vehicles">Vehicles</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <button 
                    onClick={fetchBrowseRequests}
                    className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl"
                  >
                    Search Opportunities
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-6">
                <div className="divide-y divide-darkBg-border">
                  {browseLoading ? (
                    <div className="py-12 text-center text-slate-500 text-xs">Loading available opportunities...</div>
                  ) : browseRequests.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">No active buyer requests found matching search parameters.</div>
                  ) : (
                    browseRequests.map((req) => (
                      <div key={req._id} className="py-5 flex flex-col md:flex-row md:items-center md:justify-between px-3 -mx-3 rounded-2xl hover:bg-darkBg-hover/20 gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <img src={req.images[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100'} alt={req.title} className="w-14 h-14 rounded-xl object-cover border border-darkBg-border flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-white hover:text-brand cursor-pointer" onClick={() => setCurrentCompareRequest(req)}>{req.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 pr-4">{req.description}</p>
                            <div className="flex gap-2 pt-2 text-[10px] text-slate-500">
                              <span className="bg-darkBg border border-darkBg-border px-2 py-0.5 rounded-md text-[9px] font-semibold">{req.category}</span>
                              <span>Posted by: {req.buyer?.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t border-darkBg-border/40 md:border-t-0">
                          <div className="text-left md:text-right text-xs">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Max Budget</span>
                            <span className="text-sm font-extrabold text-white">₹{req.budget?.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                setCurrentPlaceBidRequest(req);
                                setIsPlaceBidModalOpen(true);
                              }}
                              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand/10"
                            >
                              Place Bid
                            </button>
                            <button
                              onClick={() => setCurrentCompareRequest(req)}
                              className="px-4 py-1 text-slate-400 hover:text-white text-xs font-semibold hover:underline"
                            >
                              View Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );

        case 'myBids':
          const filteredBids = myBids.filter(bid => {
            if (myBidsFilter === 'All') return true;
            return bid.status === myBidsFilter;
          });
          return (
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">My Bids & Proposals</h2>
                  <p className="text-slate-400 text-sm mt-1">Review all active, outbid, or accepted proposals submitted by you.</p>
                </div>

                {/* Filter list */}
                <div className="flex bg-darkBg-card border border-darkBg-border p-0.5 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
                  {['All', 'Pending', 'Shortlisted', 'Outbid', 'Withdrawn', 'Accepted'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setMyBidsFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                        myBidsFilter === tab 
                          ? 'bg-brand text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid or table listing */}
              <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl">
                {myBidsLoading ? (
                  <div className="py-12 text-center text-slate-500 text-xs">Loading proposal entries...</div>
                ) : filteredBids.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">No bids found for filter: {myBidsFilter}.</div>
                ) : (
                  <div className="divide-y divide-darkBg-border text-xs">
                    {filteredBids.map((bid) => {
                      const req = bid.request;
                      if (!req) return null;
                      return (
                        <div key={bid._id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <img src={req.images?.[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100'} alt={req.title} className="w-12 h-12 rounded-xl object-cover border border-darkBg-border flex-shrink-0" />
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-white text-sm">{req.title}</h4>
                              <p className="text-slate-400 font-medium">{req.category} • Client: {req.buyer?.name || 'Rohan Sharma'}</p>
                              <p className="text-slate-500 leading-relaxed italic mt-1 font-mono">Proposal: "{bid.proposalMessage}"</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t border-darkBg-border/40 md:border-t-0">
                            <div className="text-left md:text-right">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Your Offer</span>
                              <span className="text-sm font-extrabold text-white block">₹{bid.bidAmount?.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400">Delivery: {bid.deliveryTime} Days</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                                bid.status === 'Accepted'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : bid.status === 'Shortlisted'
                                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                  : bid.status === 'Outbid'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : bid.status === 'Withdrawn'
                                  ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              }`}>
                                {bid.status}
                              </span>

                              {bid.status === 'Pending' && (
                                <button
                                  onClick={() => handleWithdrawBid(bid._id)}
                                  className="px-2.5 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg transition-all"
                                >
                                  Withdraw
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );

        case 'acceptedOrders':
          // List accepted seller bids
          const wonBids = myBids.filter(b => b.status === 'Accepted');
          return (
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Accepted Orders (Orders Won)</h2>
                <p className="text-slate-400 text-sm mt-1">Review contracts currently under execution.</p>
              </div>

              <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl">
                {wonBids.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">No won orders yet. Keep bidding to win orders!</div>
                ) : (
                  <div className="divide-y divide-darkBg-border text-xs">
                    {wonBids.map((bid) => {
                      const req = bid.request;
                      if (!req) return null;
                      return (
                        <div key={bid._id} className="py-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-white text-sm">{req.title}</h4>
                            <span className="text-slate-400 font-medium block">Category: {req.category} • Client: {req.buyer?.name}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Agreement Price: ₹{bid.bidAmount} • Timeline: {bid.deliveryTime} Days</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setDefaultChatRecipient(req.buyer);
                                setActiveTab('messages');
                              }}
                              className="px-3.5 py-2 bg-brand/10 hover:bg-brand/20 border border-brand/20 text-brand text-xs font-bold rounded-xl flex items-center gap-1"
                            >
                              <MessageSquare className="w-4 h-4" /> Open Chat
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );

        case 'messages':
          return <MessagesPage defaultRecipient={defaultChatRecipient} />;

        case 'notifications':
          return (
            <div className="p-8 space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-darkBg-border/40">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Notifications Feed</h2>
                  <p className="text-slate-400 text-sm mt-1">Stay updated with feedback from buyers and bid statuses.</p>
                </div>
                <button className="text-xs text-brand hover:underline font-semibold">Mark all as read</button>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Your bid was shortlisted!", desc: "Rohan Sharma shortlisted your bid of ₹72,000 for 'Gaming Laptop'. Details being reviewed.", time: "10 May 2026", unread: true },
                  { title: "Bid Accepted! Contract Created!", desc: "Shree Traders accepted your bid of ₹48,000 for 'Interior Design'. Escrow holding initialized.", time: "15 May 2026", unread: true },
                  { title: "New Request posted in Electronics", desc: "A buyer has requested 'Office Workstation setup' with a budget of ₹45,000.", time: "20 May 2026", unread: false },
                  { title: "Outbid notification", desc: "Your bid for 'Wireless Headphones' was outbid by Shree Traders.", time: "25 May 2026", unread: false }
                ].map((notif, idx) => (
                  <div key={idx} className={`p-4 border rounded-2xl flex items-start gap-4 transition-all ${
                    notif.unread 
                      ? 'bg-brand/5 border-brand/20' 
                      : 'bg-darkBg-card border-darkBg-border hover:bg-darkBg-hover/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.unread ? 'bg-brand animate-pulse' : 'bg-slate-600'}`}></div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{notif.desc}</p>
                      <span className="text-[10px] text-slate-500 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'settings':
          return (
            <div className="p-8 space-y-6 max-w-2xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Business Settings</h2>
                <p className="text-slate-400 text-sm mt-1">Configure your corporate credentials and tier details.</p>
              </div>

              <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-8 shadow-xl">
                {settingsSuccess && <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs">{settingsSuccess}</div>}
                {settingsError && <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">{settingsError}</div>}
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Business / Company Name</label>
                    <input 
                      type="text" 
                      required
                      value={settingsBusinessName}
                      onChange={(e) => setSettingsBusinessName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={settingsEmail}
                      onChange={(e) => setSettingsEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Phone Number</label>
                    <input 
                      type="tel"
                      value={settingsPhone}
                      onChange={(e) => setSettingsPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Business Tier</label>
                    <div className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      {settingsTier} ACCOUNT
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 transition-all mt-4"
                  >
                    Save Settings
                  </button>
                </form>
              </div>
            </div>
          );

        default:
          return <div className="p-8 text-slate-400 text-sm">Tab {activeTab} coming soon...</div>;
      }
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-white flex font-sans overflow-x-hidden">
      {/* Side Navigation Panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setDefaultChatRecipient(null); setCurrentCompareRequest(null); }} 
        onLogoClick={() => setViewingHomepage(true)}
      />

      {/* Main Container Shell */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onReturnToHomepage={() => setViewingHomepage(true)}
        />
        
        {/* Dynamic Inner Panel Viewport */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Form Modals */}
      <CreateRequestModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onRequestCreated={() => {
          // Triggers refresh of dashboards
          setActiveTab('dashboard');
          window.location.reload(); // Quick refresh to sync state
        }} 
      />

      <PlaceBidModal
        isOpen={isPlaceBidModalOpen}
        onClose={() => setIsPlaceBidModalOpen(false)}
        request={currentPlaceBidRequest}
        onBidPlaced={() => {
          setActiveTab('myBids');
          if (activeTab === 'myBids') {
            fetchMyBids();
          } else {
            window.location.reload(); // Sync
          }
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
