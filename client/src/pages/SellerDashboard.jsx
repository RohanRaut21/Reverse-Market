import React, { useState, useEffect } from "react";
import {
  Gavel,
  Clock,
  ShoppingBag,
  CheckCircle2,
  Search,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Bell,
} from "lucide-react";

const SellerDashboard = ({
  user,
  onPlaceBidClick,
  onViewRequestClick,
  activeTab,
  setActiveTab,
  notifications = [],
}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("All Requests");
  const [stats, setStats] = useState({
    totalBids: 0,
    inProgress: 0,
    ordersWon: 0,
    completedOrders: 0,
    totalContractValue: 0,
    shortlistedCount: 0
  });

  const [bidsSummary, setBidsSummary] = useState({
    all: 0,
    inProgress: 0,
    shortlisted: 0,
    outbid: 0,
    withdrawn: 0,
    accepted: 0,
  });

  useEffect(() => {
    fetchAvailableRequests();
    fetchSellerBidsAndStats();
  }, [currentCategory]);

  const fetchSellerBidsAndStats = async () => {
    try {
      const res = await fetch('/api/bids/my');
      const data = await res.json();
      if (data.success) {
        const myBids = data.data || [];
        
        let totalBids = myBids.length;
        let inProgressBids = 0;
        let ordersWon = 0;
        let completedOrders = 0;
        let totalContractValue = 0;
        let shortlistedCount = 0;
        let outbidCount = 0;
        let withdrawnCount = 0;

        myBids.forEach(bid => {
          if (bid.status === 'Pending' || bid.status === 'Shortlisted') {
            inProgressBids++;
          }
          if (bid.status === 'Shortlisted') {
            shortlistedCount++;
          }
          if (bid.status === 'Accepted') {
            ordersWon++;
            totalContractValue += bid.bidAmount || 0;
          }
          if (bid.status === 'Outbid') {
            outbidCount++;
          }
          if (bid.status === 'Withdrawn') {
            withdrawnCount++;
          }
          if (bid.status === 'Completed' || bid.request?.status === 'Completed') {
            completedOrders++;
          }
        });

        setStats({
          totalBids,
          inProgress: inProgressBids,
          ordersWon,
          completedOrders,
          totalContractValue,
          shortlistedCount
        });

        setBidsSummary({
          all: totalBids,
          inProgress: inProgressBids,
          shortlisted: shortlistedCount,
          outbid: outbidCount,
          withdrawn: withdrawnCount,
          accepted: ordersWon,
        });
      }
    } catch (err) {
      console.error('Error fetching seller stats:', err);
    }
  };

  const fetchAvailableRequests = async () => {
    try {
      setLoading(true);

      // Fetch active buyer requests
      const categoryParam =
        currentCategory === "All Requests" ? "All" : currentCategory;
      const res = await fetch(
        `/api/requests?status=Active&category=${categoryParam}`,
      );
      const data = await res.json();

      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error("Error fetching available requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingDays = (deadlineStr) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const timeDiff = deadline - today;
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff < 0) return "Closed";
    if (dayDiff === 0) return "Today";
    return `${dayDiff} days left`;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Copy */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Welcome back, {user?.name || "Seller"}! 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Find new opportunities and grow your business.
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bids */}
        <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Total Bids
            </span>
            <span className="text-3xl font-extrabold text-white block">
              {stats.totalBids}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              • {stats.totalBids === 0 ? 'No bids placed' : `${stats.totalBids} proposal${stats.totalBids === 1 ? '' : 's'} submitted`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Gavel className="w-6 h-6" />
          </div>
        </div>

        {/* Bids in Progress */}
        <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Bids in Progress
            </span>
            <span className="text-3xl font-extrabold text-white block">
              {stats.inProgress}
            </span>
            <span className="text-[11px] text-blue-400 font-semibold block">
              • {stats.shortlistedCount > 0 ? `${stats.shortlistedCount} shortlisted` : stats.inProgress === 0 ? 'No pending bids' : `${stats.inProgress} active quote${stats.inProgress === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Orders Won */}
        <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Orders Won
            </span>
            <span className="text-3xl font-extrabold text-white block">
              {stats.ordersWon}
            </span>
            <span className="text-[11px] text-purple-400 font-semibold block">
              • {stats.ordersWon === 0 ? 'No contracts won yet' : `Worth ₹${stats.totalContractValue.toLocaleString()}`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-brand-purple">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-darkBg-card border border-darkBg-border p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Completed Orders
            </span>
            <span className="text-3xl font-extrabold text-white block">
              {stats.completedOrders}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              • {stats.completedOrders === 0 ? 'No completed projects' : `${stats.completedOrders} fulfilled contract${stats.completedOrders === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main split dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Available Buyer Requests feed */}
        <div className="lg:col-span-8 bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-white">
              Latest Buyer Requests
            </h3>

            {/* Filter Tabs */}
            <div className="flex bg-darkBg border border-darkBg-border p-0.5 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
              {[
                "All Requests",
                "Electronics",
                "Home & Kitchen",
                "Fashion",
                "Services",
                "Vehicles",
                "Others",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentCategory(tab)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    currentCategory === tab
                      ? "bg-brand text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List content */}
          <div className="divide-y divide-darkBg-border">
            {loading ? (
              <div className="py-12 text-center text-slate-500">
                Loading requests feed...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No active buyer requests found in this category.
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req._id}
                  className="py-5 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-darkBg-hover/30 px-3 -mx-3 rounded-2xl transition-all duration-200 gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={
                        req.images[0] ||
                        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100"
                      }
                      alt={req.title}
                      className="w-16 h-16 rounded-xl object-cover border border-darkBg-border flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className="text-sm font-bold text-white hover:text-brand transition-colors cursor-pointer"
                          onClick={() => onViewRequestClick(req)}
                        >
                          {req.title}
                        </h4>
                        {req.featured && (
                          <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-bold uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 pr-4">
                        {req.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-400">
                        <span className="bg-darkBg border border-darkBg-border px-2 py-0.5 rounded-md">
                          {req.category}
                        </span>
                        {req.tags &&
                          req.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-darkBg border border-darkBg-border px-2 py-0.5 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Budget & Deadline details */}
                  <div className="flex items-center justify-between md:justify-end gap-8 border-t border-darkBg-border/40 md:border-t-0 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                        Budget
                      </span>
                      <span className="text-sm font-extrabold text-white block">
                        ₹{req.budget.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Deadline: {getRemainingDays(req.deadline)} (
                        {req.bidCount || 0} bids placed)
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => onPlaceBidClick(req)}
                        className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand/10"
                      >
                        Place Bid
                      </button>
                      <button
                        onClick={() => onViewRequestClick(req)}
                        className="px-4 py-1 text-slate-400 hover:text-white text-xs font-semibold hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Activity Log, My Bids Summary & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Activity */}
          <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-[10px] text-brand hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-[11px]">No activity yet.</div>
              ) : (
                notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className="flex gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${notif.unread ? 'bg-brand/10 text-brand' : 'bg-slate-500/10 text-slate-400'}`}>
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-300 font-medium leading-relaxed pr-2">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Bids Summary checklist */}
          <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">My Bids Summary</h3>
              <button
                onClick={() => setActiveTab('myBids')}
                className="text-[10px] text-brand hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-darkBg-border text-xs">
              {[
                {
                  label: "All Bids",
                  count: bidsSummary.all,
                  color: "bg-brand/20 text-brand",
                },
                {
                  label: "In Progress",
                  count: bidsSummary.inProgress,
                  color: "bg-blue-500/20 text-blue-400",
                },
                {
                  label: "Shortlisted",
                  count: bidsSummary.shortlisted,
                  color: "bg-yellow-500/20 text-yellow-400",
                },
                {
                  label: "Outbid",
                  count: bidsSummary.outbid,
                  color: "bg-red-500/20 text-red-400",
                },
                {
                  label: "Withdrawn",
                  count: bidsSummary.withdrawn,
                  color: "bg-slate-500/20 text-slate-400",
                },
                {
                  label: "Accepted",
                  count: bidsSummary.accepted,
                  color: "bg-emerald-500/20 text-emerald-400",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0 cursor-pointer group hover:bg-darkBg-hover/30 px-1.5 -mx-1.5 rounded-lg transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${item.color.split(" ")[1]}`}
                    ></span>
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-bold text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCurrentCategory("All Requests")}
                className="p-3 bg-darkBg hover:bg-darkBg-hover border border-darkBg-border rounded-2xl text-center space-y-2 group transition-all"
              >
                <Search className="w-5 h-5 text-brand mx-auto group-hover:scale-105 transition-transform" />
                <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                  Browse Requests
                </span>
              </button>

              <button
                onClick={() => setActiveTab("myBids")}
                className="p-3 bg-darkBg hover:bg-[#1b1e38] border border-darkBg-border rounded-2xl text-center space-y-2 group transition-all"
              >
                <Gavel className="w-5 h-5 text-blue-400 mx-auto group-hover:scale-105 transition-transform" />
                <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                  My Bids
                </span>
              </button>

              <button
                onClick={() => setActiveTab("messages")}
                className="p-3 bg-darkBg hover:bg-darkBg-hover border border-darkBg-border rounded-2xl text-center space-y-2 group transition-all"
              >
                <MessageSquare className="w-5 h-5 text-emerald-400 mx-auto group-hover:scale-105 transition-transform" />
                <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                  Messages
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
