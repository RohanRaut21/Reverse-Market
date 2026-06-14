import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Gavel, 
  ShoppingBag, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  Clock, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Week 1', spent: 5000 },
  { name: 'Week 2', spent: 12000 },
  { name: 'Week 3', spent: 8000 },
  { name: 'Week 4', spent: 24500 },
];

const BuyerDashboard = ({ onCreateRequestClick, onRequestClick, activeTab, setActiveTab, notifications = [] }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [stats, setStats] = useState({
    active: 0,
    totalBids: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    fetchBuyerDashboardData();
  }, []);

  const fetchBuyerDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch user requests
      const reqRes = await fetch('/api/requests/my');
      const reqData = await reqRes.json();

      if (reqData.success) {
        const myRequests = reqData.data;
        setRequests(myRequests);

        // Fetch bids to compute total bids received across requests
        let totalBids = 0;
        let active = 0;
        let inProgress = 0;
        let completed = 0;

        for (const req of myRequests) {
          totalBids += req.bidCount || 0;
          if (req.status === 'Active') active++;
          else if (req.status === 'In Progress') inProgress++;
          else if (req.status === 'Completed') completed++;
        }

        setStats({
          active: active || 8, // Fallback to mockup data if empty
          totalBids: totalBids || 32,
          inProgress: inProgress || 3,
          completed: completed || 15
        });
      }
    } catch (err) {
      console.error('Error fetching buyer dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (currentFilter === 'All') return true;
    return req.status === currentFilter;
  });

  const getRemainingDays = (deadlineStr) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const timeDiff = deadline - today;
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff < 0) return 'Deadline passed';
    if (dayDiff === 0) return 'Today';
    return `${dayDiff} days left`;
  };

  const getStatusColor = (status) => {
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome back, Rohan! 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Post your requirements and let verified sellers compete for your business.
          </p>
        </div>
        <button
          onClick={onCreateRequestClick}
          className="px-5 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand/20 transition-all"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Post New Request</span>
        </button>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Requests */}
        <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Active Requests</span>
            <span className="text-3xl font-extrabold text-white block">{stats.active}</span>
            <span className="text-[11px] text-emerald-400 font-semibold block">• 2 new bids today</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Bids */}
        <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Bids Received</span>
            <span className="text-3xl font-extrabold text-white block">{stats.totalBids}</span>
            <span className="text-[11px] text-emerald-400 font-semibold block">+12 this week</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Gavel className="w-6 h-6" />
          </div>
        </div>

        {/* Orders In Progress */}
        <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Orders In Progress</span>
            <span className="text-3xl font-extrabold text-white block">{stats.inProgress}</span>
            <span className="text-[11px] text-brand-purple font-semibold block">Worth ₹24,500</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-brand-purple">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Completed Orders</span>
            <span className="text-3xl font-extrabold text-white block">{stats.completed}</span>
            <span className="text-[11px] text-emerald-400 font-semibold block">+3 this month</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Splitted Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Requests List */}
        <div className="lg:col-span-8 bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-white">My Requests</h3>
            
            {/* Filter Tabs */}
            <div className="flex bg-darkBg border border-darkBg-border p-0.5 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
              {['All', 'Active', 'Bidding Closed', 'In Progress', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    currentFilter === tab 
                      ? 'bg-brand text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-darkBg-border">
            {loading ? (
              <div className="py-12 text-center text-slate-500">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500">No requests found. Create a request to get bids!</div>
            ) : (
              filteredRequests.map((req) => (
                <div 
                  key={req._id}
                  onClick={() => onRequestClick(req)}
                  className="py-5 flex items-center justify-between hover:bg-darkBg-hover/30 px-3 -mx-3 rounded-2xl cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={req.images[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100'} 
                      alt={req.title} 
                      className="w-16 h-16 rounded-xl object-cover border border-darkBg-border"
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
                        <span className="text-brand font-semibold ml-1">({getRemainingDays(req.deadline)})</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white block">
                        {req.bidCount || 0}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {req.status === 'In Progress' || req.status === 'Completed' ? 'Accepted Bid' : 'Bids Received'}
                      </span>
                    </div>
                    
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>

                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center pt-2">
            <button 
              onClick={() => setActiveTab('requests')}
              className="text-xs text-brand hover:underline font-semibold flex items-center gap-1.5 mx-auto"
            >
              <span>View All Requests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Activity Log, Notifications & Chart */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Activity */}
          <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <a href="#" className="text-[10px] text-brand hover:underline font-semibold">View All</a>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                  <Gavel className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-slate-300">New bid received on <strong>"Wireless Headphones"</strong> by TechWorld India</p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">2m ago</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-slate-300">Your request <strong>"Gaming Laptop"</strong> is now bidding closed</p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">1h ago</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-slate-300">You accepted a bid for <strong>"Bulk T-Shirts"</strong> from FashionHub</p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">2h ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notifications Feed */}
          <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              <button 
                onClick={() => setActiveTab('notifications')}
                className="text-[10px] text-brand hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-[11px]">No notifications yet.</div>
              ) : (
                notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className="flex gap-3 items-start">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.unread ? 'bg-brand' : 'bg-slate-600'}`}></div>
                    <div>
                      <h5 className="font-bold text-white">{notif.title}</h5>
                      <p className="text-slate-400 text-[11px] mt-0.5">{notif.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
