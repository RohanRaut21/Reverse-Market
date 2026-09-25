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
  ExternalLink,
  ShoppingBag
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

  // Buyer received bids state (actual bids submitted by sellers for buyer's requests)
  const [receivedBids, setReceivedBids] = useState([]);
  const [receivedBidsLoading, setReceivedBidsLoading] = useState(false);
  const [receivedBidsFilter, setReceivedBidsFilter] = useState('All');

  // Message & Notification count states
  const [messageCount, setMessageCount] = useState(0);
  const [buyerNotifications, setBuyerNotifications] = useState([]);
  const [sellerNotifications, setSellerNotifications] = useState([]);
  const [hasOpenedMessages, setHasOpenedMessages] = useState(false);
  const [hasOpenedNotifications, setHasOpenedNotifications] = useState(false);

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

  // Auto-open create request modal if there is an imported product in localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem('reverseMarket_importedProduct');
      if (stored) {
        if (activeRole !== 'Buyer') {
          toggleActiveRole();
          return;
        }
        if (viewingHomepage) {
          setViewingHomepage(false);
        }
        setActiveTab('dashboard');
        setIsCreateModalOpen(true);
      }
    }
  }, [user, activeRole, viewingHomepage]);

  // Reset tab and active selection when switching roles between Buyer and Seller console
  useEffect(() => {
    setActiveTab('dashboard');
    setCurrentCompareRequest(null);
    setCurrentPlaceBidRequest(null);
  }, [activeRole]);

  // Load seller browse requests or bids based on tab
  useEffect(() => {
    if (user && activeRole === 'Seller') {
      if (activeTab === 'browseRequests') {
        fetchBrowseRequests();
      } else if (activeTab === 'myBids' || activeTab === 'acceptedOrders') {
        fetchMyBids();
      }
    }
  }, [user, activeRole, activeTab, browseCategory]);

  // Load buyer received bids and requests when viewing received bids tab
  useEffect(() => {
    if (user && activeRole === 'Buyer' && activeTab === 'receivedBids') {
      fetchReceivedBids();
      fetchBuyerRequests();
    }
  }, [user, activeRole, activeTab]);

  // Fetch active conversations count for badges
  const fetchConversationsCount = async () => {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      if (data.success) {
        setMessageCount(data.data.length);
      }
    } catch (err) {
      console.error('Error fetching conversations count:', err);
    }
  };

  // Helper to format relative time for dynamic notifications
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Fetch notifications dynamically based on bids and requests from the database
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      if (activeRole === 'Buyer') {
        const res = await fetch('/api/requests/my');
        const data = await res.json();
        if (data.success) {
          const requests = data.data;
          const allNotifications = [];
          
          for (const req of requests) {
            if (req.bidCount > 0) {
              const bidsRes = await fetch(`/api/bids/request/${req._id}`);
              const bidsData = await bidsRes.json();
              if (bidsData.success) {
                bidsData.data.forEach((bid) => {
                  const timeAgo = formatRelativeTime(new Date(bid.createdAt));
                  allNotifications.push({
                    id: `bid-${bid._id}`,
                    title: `New bid received on '${req.title}'`,
                    desc: `${bid.seller?.businessName || bid.seller?.name || 'A seller'} placed a bid of ₹${bid.bidAmount.toLocaleString()} with ${bid.deliveryTime} days delivery timeline.`,
                    time: timeAgo,
                    unread: !hasOpenedNotifications && bid.status === 'Pending',
                    createdAt: bid.createdAt
                  });
                });
              }
            }
          }
          
          allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setBuyerNotifications(allNotifications);
        }
      } else {
        const res = await fetch('/api/bids/my');
        const data = await res.json();
        if (data.success) {
          const bids = data.data;
          const allNotifications = [];
          
          bids.forEach((bid) => {
            const timeAgo = formatRelativeTime(new Date(bid.updatedAt || bid.createdAt));
            if (bid.status === 'Accepted') {
              allNotifications.push({
                id: `status-accepted-${bid._id}`,
                title: `Bid Accepted! Contract Created!`,
                desc: `The buyer accepted your bid of ₹${bid.bidAmount.toLocaleString()} for '${bid.request?.title}'.`,
                time: timeAgo,
                unread: !hasOpenedNotifications,
                createdAt: bid.updatedAt || bid.createdAt
              });
            } else if (bid.status === 'Shortlisted') {
              allNotifications.push({
                id: `status-shortlisted-${bid._id}`,
                title: `Your bid was shortlisted!`,
                desc: `The buyer shortlisted your bid of ₹${bid.bidAmount.toLocaleString()} for '${bid.request?.title}'.`,
                time: timeAgo,
                unread: !hasOpenedNotifications,
                createdAt: bid.updatedAt || bid.createdAt
              });
            } else if (bid.status === 'Outbid') {
              allNotifications.push({
                id: `status-outbid-${bid._id}`,
                title: `Outbid notification`,
                desc: `Your bid of ₹${bid.bidAmount.toLocaleString()} for '${bid.request?.title}' was outbid.`,
                time: timeAgo,
                unread: false,
                createdAt: bid.updatedAt || bid.createdAt
              });
            }
          });
          
          allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setSellerNotifications(allNotifications);
        }
      }
    } catch (err) {
      console.error('Error fetching dynamic notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'messages') {
        setHasOpenedMessages(true);
        setMessageCount(0);
      } else {
        fetchConversationsCount();
      }

      if (activeTab === 'notifications') {
        setHasOpenedNotifications(true);
      }

      fetchNotifications();
    }
  }, [user, activeTab, activeRole, hasOpenedNotifications]);

  const fetchBuyerRequests = async () => {
    try {
      setBuyerRequestsLoading(true);
      const res = await fetch('/api/requests/my');
      const data = await res.json();
      if (data.success) {
        // Only show requests created by this buyer
        const currentUserId = String(user?._id || user?.id || '');
        const myRequests = (data.data || []).filter(req => {
          const reqBuyerId = String(req.buyer?._id || req.buyer || '');
          return !currentUserId || reqBuyerId === currentUserId;
        });
        setBuyerRequests(myRequests);
      }
    } catch (err) {
      console.error('Error fetching buyer requests for comparison:', err);
    } finally {
      setBuyerRequestsLoading(false);
    }
  };

  const fetchReceivedBids = async () => {
    try {
      setReceivedBidsLoading(true);
      const res = await fetch('/api/bids/received');
      const data = await res.json();
      if (data.success) {
        setReceivedBids(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching received bids:', err);
    } finally {
      setReceivedBidsLoading(false);
    }
  };

  const handleBuyerUpdateBidStatus = async (bidId, nextStatus) => {
    try {
      const res = await fetch(`/api/bids/${bidId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchReceivedBids();
        fetchBuyerRequests();
      }
    } catch (err) {
      console.error('Error updating bid status:', err);
    }
  };

  const fetchBrowseRequests = async () => {
    try {
      setBrowseLoading(true);
      const res = await fetch(`/api/requests?status=Active&category=${browseCategory === 'All' ? 'All' : browseCategory}&search=${browseSearch}`);
      const data = await res.json();
      if (data.success) {
        // Exclude own requests when browsing in seller console
        const currentUserId = String(user?._id || user?.id || '');
        const otherUsersRequests = (data.data || []).filter(req => {
          const reqBuyerId = String(req.buyer?._id || req.buyer || '');
          return !currentUserId || reqBuyerId !== currentUserId;
        });
        setBrowseRequests(otherUsersRequests);
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
              notifications={buyerNotifications}
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
                  notifications={buyerNotifications}
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

          const filteredReceivedBids = receivedBids.filter(bid => {
            if (receivedBidsFilter === 'All') return true;
            return bid.status === receivedBidsFilter;
          });

          return (
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Gavel className="w-6 h-6 text-brand" />
                    Received Bids from Sellers
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Review and evaluate proposals submitted by verified sellers on your posted requirements.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-darkBg border border-darkBg-border p-0.5 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
                  {['All', 'Pending', 'Shortlisted', 'Accepted'].map((tab) => {
                    const count = tab === 'All' 
                      ? receivedBids.length 
                      : receivedBids.filter(b => b.status === tab).length;
                    return (
                      <button
                        key={tab}
                        onClick={() => setReceivedBidsFilter(tab)}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          receivedBidsFilter === tab 
                            ? 'bg-brand text-white font-bold' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{tab === 'All' ? 'All Bids' : tab}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          receivedBidsFilter === tab ? 'bg-white/20 text-white' : 'bg-darkBg-card text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {receivedBidsLoading ? (
                <div className="bg-darkBg-card border border-darkBg-border p-12 rounded-3xl text-center text-slate-500 text-xs flex flex-col items-center gap-3 shadow-xl">
                  <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading received bids...</span>
                </div>
              ) : receivedBids.length === 0 ? (
                <div className="bg-darkBg-card border border-darkBg-border p-12 rounded-3xl text-center text-slate-500 text-xs flex flex-col items-center gap-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <Gavel className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-base font-bold text-white">No Bids Received Yet</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      You haven't received any bids on your active requests yet. As soon as sellers submit proposals, they will appear here with price offers and quality match scores.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand/20"
                  >
                    View My Requests
                  </button>
                </div>
              ) : filteredReceivedBids.length === 0 ? (
                <div className="bg-darkBg-card border border-darkBg-border p-12 rounded-3xl text-center text-slate-500 text-xs shadow-xl">
                  No {receivedBidsFilter.toLowerCase()} bids found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReceivedBids.map((bid) => {
                    const score = bid.qualityScore !== undefined ? bid.qualityScore : 100;
                    let scoreBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                    if (score < 70) {
                      scoreBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                    } else if (score < 90) {
                      scoreBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                    }

                    const isBelowBudget = bid.request?.budget && bid.bidAmount < bid.request.budget;
                    const diffAmount = bid.request?.budget ? Math.abs(bid.request.budget - bid.bidAmount) : 0;

                    return (
                      <div 
                        key={bid._id}
                        className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-4 hover:border-brand/30 transition-all duration-200"
                      >
                        {/* Top: Seller Info + Target Request Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-darkBg-border/40">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand text-sm flex-shrink-0">
                              {bid.seller?.name ? bid.seller.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">
                                  {bid.seller?.businessName || bid.seller?.name || 'Verified Seller'}
                                </h4>
                                <span className="flex items-center gap-0.5 text-yellow-400 text-xs font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>{bid.seller?.rating || '5.0'}</span>
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {bid.seller?.email || 'Seller Partner'}
                              </span>
                            </div>
                          </div>

                          {/* Request badge & Status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {bid.request && (
                              <button
                                onClick={() => setCurrentCompareRequest(bid.request)}
                                className="text-xs bg-darkBg border border-darkBg-border px-3 py-1 rounded-xl text-slate-300 hover:text-brand hover:border-brand/40 transition-colors flex items-center gap-1.5 group"
                              >
                                <span className="text-slate-500 group-hover:text-brand">For:</span>
                                <span className="font-bold text-white group-hover:text-brand line-clamp-1 max-w-[200px]">
                                  {bid.request.title}
                                </span>
                                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand" />
                              </button>
                            )}

                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                              bid.status === 'Accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : bid.status === 'Shortlisted'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : bid.status === 'Outbid'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {bid.status}
                            </span>
                          </div>
                        </div>

                        {/* Middle: Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          {/* Price Offer & Savings */}
                          <div className="md:col-span-3 bg-[#0b0d19] p-3.5 rounded-2xl border border-darkBg-border/50 space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Price Offer</span>
                            <span className="text-xl font-extrabold text-white block">₹{bid.bidAmount.toLocaleString()}</span>
                            {bid.request?.budget && (
                              <span className={`text-[10px] font-semibold block ${isBelowBudget ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {isBelowBudget ? `₹${diffAmount.toLocaleString()} below budget` : `Budget: ₹${bid.request.budget.toLocaleString()}`}
                              </span>
                            )}
                          </div>

                          {/* Quality Match Score */}
                          <div className="md:col-span-3 bg-[#0b0d19] p-3.5 rounded-2xl border border-darkBg-border/50 space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Quality Match (QARM)</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs px-2.5 py-1 rounded-lg font-extrabold border ${scoreBadgeColor}`}>
                                ⭐ {score}% Match
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {score >= 90 ? 'High Specification Match' : score >= 70 ? 'Good Match' : 'Partial Match'}
                            </span>
                          </div>

                          {/* Delivery timeline */}
                          <div className="md:col-span-2 bg-[#0b0d19] p-3.5 rounded-2xl border border-darkBg-border/50 space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Delivery</span>
                            <span className="text-sm font-bold text-white block flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand" />
                              {bid.deliveryTime} Days
                            </span>
                            <span className="text-[10px] text-slate-500 block">Fast Turnaround</span>
                          </div>

                          {/* Proposal Message & Chips */}
                          <div className="md:col-span-4 bg-[#0b0d19] p-3.5 rounded-2xl border border-darkBg-border/50 space-y-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Proposal Details</span>
                            <p className="text-xs text-slate-300 line-clamp-2 italic">
                              "{bid.proposalMessage || 'I am ready to fulfill this requirement with top quality guarantee.'}"
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {bid.specsCompliance && bid.specsCompliance.length > 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                                  ✓ {bid.specsCompliance.filter(c => c.satisfied).length}/{bid.specsCompliance.length} Mandatory Met
                                </span>
                              )}
                              {bid.preferredOffered && bid.preferredOffered.length > 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                                  ★ {bid.preferredOffered.filter(p => p.included).length} Perks Included
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                          <span className="text-[10px] text-slate-500">
                            Submitted {formatRelativeTime(new Date(bid.createdAt))}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {bid.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleBuyerUpdateBidStatus(bid._id, 'Shortlisted')}
                                  className="px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all"
                                >
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => handleBuyerUpdateBidStatus(bid._id, 'Accepted')}
                                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept Proposal</span>
                                </button>
                              </>
                            )}

                            {bid.status === 'Shortlisted' && (
                              <button
                                onClick={() => handleBuyerUpdateBidStatus(bid._id, 'Accepted')}
                                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept Proposal</span>
                              </button>
                            )}

                            {bid.seller && (
                              <button
                                onClick={() => {
                                  setDefaultChatRecipient(bid.seller);
                                  setActiveTab('messages');
                                }}
                                className="px-3.5 py-1.5 border border-darkBg-border hover:bg-darkBg-hover text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-brand" />
                                <span>Chat</span>
                              </button>
                            )}

                            {bid.request && (
                              <button
                                onClick={() => setCurrentCompareRequest(bid.request)}
                                className="px-3.5 py-1.5 bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <span>Compare Matrix</span>
                                <ChevronRight className="w-3.5 h-3.5" />
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
                <button 
                  onClick={() => setBuyerNotifications(buyerNotifications.map(n => ({ ...n, unread: false })))}
                  className="text-xs text-brand hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-4">
                {buyerNotifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs bg-darkBg-card border border-darkBg-border rounded-2xl">
                    No notifications yet.
                  </div>
                ) : (
                  buyerNotifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border rounded-2xl flex items-start gap-4 transition-all ${
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
                  ))
                )}
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
              notifications={sellerNotifications}
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

                  {/* Quality Specifications Display */}
                  {((currentCompareRequest.mandatorySpecs && currentCompareRequest.mandatorySpecs.length > 0) || (currentCompareRequest.preferredSpecs && currentCompareRequest.preferredSpecs.length > 0)) && (
                    <div className="bg-[#0b0d19] p-4 rounded-xl border border-darkBg-border/50 space-y-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Quality-Aware Criteria (QARM)
                      </span>
                      
                      {currentCompareRequest.mandatorySpecs && currentCompareRequest.mandatorySpecs.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Mandatory Criteria (Must Comply):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentCompareRequest.mandatorySpecs.map((spec, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                • {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentCompareRequest.preferredSpecs && currentCompareRequest.preferredSpecs.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-darkBg-border/30">
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Preferred Value-Adds (Bonus Perks):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {currentCompareRequest.preferredSpecs.map((spec, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                ★ {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-brand" />
                  Accepted Orders
                </h2>
                <p className="text-slate-400 text-sm mt-1">Review contracts and requests you won that are currently under execution.</p>
              </div>

              {myBidsLoading ? (
                <div className="bg-darkBg-card border border-darkBg-border p-12 rounded-3xl text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading accepted orders...</span>
                </div>
              ) : wonBids.length === 0 ? (
                <div className="bg-darkBg-card border border-darkBg-border p-12 rounded-3xl text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                  <ShoppingBag className="w-10 h-10 text-slate-600" />
                  <span>No won orders yet. Keep bidding and competing on active requests to win contracts!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wonBids.map((bid) => {
                    const req = bid.request;
                    if (!req) return null;
                    return (
                      <div 
                        key={bid._id} 
                        className="bg-darkBg-card border border-darkBg-border hover:border-brand/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                      >
                        {/* Top Decorative bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                              Active Order
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(bid.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-white text-base group-hover:text-brand transition-colors line-clamp-1">{req.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{req.description}</p>
                          </div>

                          {/* Client details card */}
                          <div className="flex items-center gap-3 bg-[#0b0d19] p-3 rounded-2xl border border-darkBg-border/50">
                            <img 
                              src={req.buyer?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${req.buyer?.name}`} 
                              alt={req.buyer?.name} 
                              className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand/10"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-white block truncate">{req.buyer?.name}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{req.buyer?.email}</span>
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-darkBg-border/40 text-xs">
                            <div>
                              <span className="text-slate-500 font-semibold block">Deal Price</span>
                              <span className="text-white font-extrabold text-sm block mt-0.5">₹{bid.bidAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block">Delivery</span>
                              <span className="text-white font-extrabold text-sm block mt-0.5">{bid.deliveryTime} Days</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 mt-4 border-t border-darkBg-border/40 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setDefaultChatRecipient(req.buyer);
                              setActiveTab('messages');
                            }}
                            className="flex-1 py-2.5 bg-brand/10 hover:bg-brand text-brand hover:text-white border border-brand/20 hover:border-brand text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all"
                          >
                            <MessageSquare className="w-4 h-4" /> Message Client
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  <h2 className="text-2xl font-bold tracking-tight text-white">Notifications Feed</h2>
                  <p className="text-slate-400 text-sm mt-1">Stay updated with feedback from buyers and bid statuses.</p>
                </div>
                <button 
                  onClick={() => setSellerNotifications(sellerNotifications.map(n => ({ ...n, unread: false })))}
                  className="text-xs text-brand hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-4">
                {sellerNotifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs bg-darkBg-card border border-darkBg-border rounded-2xl">
                    No notifications yet.
                  </div>
                ) : (
                  sellerNotifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border rounded-2xl flex items-start gap-4 transition-all ${
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
                  ))
                )}
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

  const notificationCount = activeRole === 'Buyer'
    ? buyerNotifications.filter(n => n.unread).length
    : sellerNotifications.filter(n => n.unread).length;

  const displayMessageCount = hasOpenedMessages ? 0 : messageCount;
  const displayNotificationCount = hasOpenedNotifications ? 0 : notificationCount;

  return (
    <div className="min-h-screen bg-darkBg text-white flex font-sans overflow-x-hidden">
      {/* Side Navigation Panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setDefaultChatRecipient(null); setCurrentCompareRequest(null); }} 
        onLogoClick={() => setViewingHomepage(true)}
        messageCount={displayMessageCount}
        notificationCount={displayNotificationCount}
        receivedBidsCount={receivedBids.length}
      />

      {/* Main Container Shell */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onReturnToHomepage={() => setViewingHomepage(true)}
          messageCount={displayMessageCount}
          notificationCount={displayNotificationCount}
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
