import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Gavel, 
  MessageSquare, 
  Bell, 
  Bookmark, 
  ShoppingBag, 
  CreditCard, 
  Star, 
  Settings, 
  Sparkles,
  ArrowRight,
  LogOut,
  Search,
  Home
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogoClick }) => {
  const { activeRole, logout, user, toggleActiveRole } = useAuth();

  const buyerMenu = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests', name: 'My Requests', icon: FileText },
    { id: 'receivedBids', name: 'Received Bids', icon: Gavel },
    { id: 'messages', name: 'Messages', icon: MessageSquare, badge: 5 },
    { id: 'notifications', name: 'Notifications', icon: Bell, badge: 3 },
    { id: 'savedSellers', name: 'Saved Sellers', icon: Bookmark },
    { id: 'orders', name: 'My Orders', icon: ShoppingBag },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'reviews', name: 'Reviews', icon: Star },
    { id: 'settings', name: 'Profile Settings', icon: Settings },
    { id: 'homepage', name: 'Return to Homepage', icon: Home },
  ];

  const sellerMenu = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'browseRequests', name: 'Browse Requests', icon: Search },
    { id: 'myBids', name: 'My Bids', icon: Gavel },
    { id: 'acceptedOrders', name: 'Accepted Orders', icon: ShoppingBag },
    { id: 'messages', name: 'Messages', icon: MessageSquare, badge: 5 },
    { id: 'notifications', name: 'Notifications', icon: Bell, badge: 3 },
    { id: 'settings', name: 'Profile Settings', icon: Settings },
    { id: 'homepage', name: 'Return to Homepage', icon: Home },
  ];

  const menuItems = activeRole === 'Buyer' ? buyerMenu : sellerMenu;

  return (
    <aside className="w-64 bg-darkBg-card border-r border-darkBg-border flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-darkBg-border">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick || (() => setActiveTab('dashboard'))}>
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white text-lg">
            R
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center">
            Reverse<span className="text-brand">Market</span>
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => item.id === 'homepage' ? (onLogoClick && onLogoClick()) : setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-brand text-white font-medium shadow-md shadow-brand/20' 
                  : 'text-slate-400 hover:text-white hover:bg-darkBg-hover'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="text-sm">{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white text-brand' : 'bg-brand text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Switch Console / Logout */}
      <div className="p-4 border-t border-darkBg-border space-y-3">
        <button
          onClick={toggleActiveRole}
          className={`w-full py-2.5 border rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md ${
            activeRole === 'Buyer'
              ? 'bg-brand/10 hover:bg-brand/20 border-brand/20 text-brand shadow-brand/5'
              : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400 shadow-blue-500/5'
          }`}
        >
          <span>Switch to {activeRole === 'Buyer' ? 'Seller' : 'Buyer'} Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
