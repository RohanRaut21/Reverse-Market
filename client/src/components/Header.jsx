import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, MessageSquare, Search, Menu, ChevronDown } from 'lucide-react';

const Header = ({ activeTab, setActiveTab, onReturnToHomepage }) => {
  const { user, activeRole, toggleActiveRole, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-20 bg-darkBg border-b border-darkBg-border flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Search Input Bar */}
      <div className="flex items-center gap-4 w-96">
        <button className="text-slate-400 hover:text-white lg:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search requests, sellers, categories..."
            className="w-full pl-11 pr-4 py-2.5 bg-darkBg-card border border-darkBg-border rounded-xl text-sm text-white focus:outline-none focus:border-brand transition-all placeholder-slate-500"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] bg-darkBg text-slate-500 px-1.5 py-0.5 rounded border border-darkBg-border font-mono">
              ⌘ K
            </span>
          </div>
        </div>
      </div>

      {/* Right Navigation Actions */}
      <div className="flex items-center gap-6">
        {/* Mode Indicator Badge */}
        <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
          activeRole === 'Buyer' 
            ? 'bg-brand/5 border-brand/20 text-brand' 
            : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            activeRole === 'Buyer' ? 'bg-brand animate-pulse' : 'bg-blue-400 animate-pulse'
          }`}></span>
          <span>{activeRole} Console</span>
        </div>

        {/* Notifications & Chats Quick Links */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button 
            onClick={() => setActiveTab('notifications')}
            className="w-10 h-10 rounded-xl bg-darkBg-card hover:bg-darkBg-hover border border-darkBg-border flex items-center justify-center text-slate-400 hover:text-white relative transition-all"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand"></span>
          </button>

          {/* Messages */}
          <button 
            onClick={() => setActiveTab('messages')}
            className="w-10 h-10 rounded-xl bg-darkBg-card hover:bg-darkBg-hover border border-darkBg-border flex items-center justify-center text-slate-400 hover:text-white relative transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand"></span>
          </button>
        </div>

        {/* User profile dropdown info */}
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 border-l border-darkBg-border pl-6 cursor-pointer group"
          >
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
              alt={user?.name || 'User Profile'}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand/20 group-hover:ring-brand transition-all"
            />
            <div className="text-left hidden md:block">
              <h5 className="text-sm font-semibold text-white leading-none mb-1 group-hover:text-brand transition-colors">
                {user?.name || 'Guest User'}
              </h5>
              <span className="text-[11px] text-slate-400 block font-medium">
                {activeRole}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>

          {/* Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3.5 w-48 bg-[#121426] border border-darkBg-border rounded-xl shadow-xl py-2 z-50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-darkBg-hover font-semibold transition-all"
              >
                Profile Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleActiveRole();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-brand hover:text-brand-hover hover:bg-brand/5 font-semibold transition-all border-t border-darkBg-border/40"
              >
                Switch to {activeRole === 'Buyer' ? 'Seller' : 'Buyer'} Console
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onReturnToHomepage) onReturnToHomepage();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-darkBg-hover font-semibold transition-all border-t border-darkBg-border/40"
              >
                Return to Homepage
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold transition-all border-t border-darkBg-border/40"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
