import React, { useState } from 'react';
import { X, Gavel, Calendar } from 'lucide-react';

const PlaceBidModal = ({ isOpen, onClose, request, onBidPlaced }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('3'); // Default 3 days
  const [proposalMessage, setProposalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const bidData = {
      requestId: request._id,
      bidAmount: Number(bidAmount),
      deliveryTime: Number(deliveryTime),
      proposalMessage
    };

    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bidData)
      });
      const data = await res.json();

      if (data.success) {
        onBidPlaced();
        onClose();
        // Clear inputs
        setBidAmount('');
        setProposalMessage('');
      } else {
        setError(data.message || 'Error placing bid');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="relative bg-[#121426] border border-darkBg-border/80 rounded-3xl w-full max-w-lg p-8 shadow-2xl z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-darkBg-border/40">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-brand" />
              <span>Place Your Bid</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Provide your best offer for this requirement.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-darkBg hover:bg-darkBg-hover flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Context Card */}
        <div className="bg-[#0b0d19] border border-darkBg-border/60 p-4 rounded-2xl flex items-center gap-4">
          <img 
            src={request.images?.[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=100'} 
            alt={request.title} 
            className="w-12 h-12 rounded-xl object-cover border border-darkBg-border/80"
          />
          <div>
            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Requesting For</h4>
            <h5 className="text-sm font-bold text-white mt-0.5">{request.title}</h5>
            <div className="flex gap-4 text-[10px] text-slate-500 mt-1">
              <span>Budget: <strong className="text-white">₹{request.budget?.toLocaleString()}</strong></span>
              <span>Category: <strong className="text-white">{request.category}</strong></span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Bid Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">Your Bid Amount (INR)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-sm font-bold">
                  ₹
                </span>
                <input 
                  type="number" 
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={request.budget}
                  className="w-full pl-9 pr-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white font-bold"
                />
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block">Delivery Time</label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-slate-300 font-semibold"
              >
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="5">5 Days</option>
                <option value="7">7 Days</option>
                <option value="10">10 Days</option>
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
          </div>

          {/* Proposal Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block">Proposal / Message</label>
            <textarea
              required
              rows={4}
              maxLength={500}
              value={proposalMessage}
              onChange={(e) => setProposalMessage(e.target.value)}
              placeholder="Describe your offer. What features can you provide? Mention warranty, quality, configurations, etc."
              className="w-full px-4 py-3 bg-[#0b0d19] border border-darkBg-border rounded-xl text-sm focus:outline-none focus:border-brand text-white resize-none"
            ></textarea>
            <span className="text-[10px] text-slate-500 block text-right mt-1">
              {proposalMessage.length}/500 characters
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-darkBg-border hover:bg-darkBg-hover text-slate-300 text-sm font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand/20"
            >
              {loading ? 'Submitting...' : 'Submit Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceBidModal;
