import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Star, 
  Check, 
  UserCheck, 
  MessageSquare, 
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

const BidComparisonView = ({ request, onBack, onChatClick }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBids();
  }, [request]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bids/request/${request._id}`);
      const data = await res.json();
      if (data.success) {
        setBids(data.data);
      }
    } catch (err) {
      console.error('Error fetching bids for matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bidId, nextStatus) => {
    try {
      setActionLoading(true);
      setError('');
      
      const res = await fetch(`/api/bids/${bidId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      
      const data = await res.json();
      if (data.success) {
        // Refresh bids
        fetchBids();
      } else {
        setError(data.message || 'Failed to update bid status');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Back Header */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Grid: Request Detail + Bid Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Request Summary Card */}
        <div className="lg:col-span-4 bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand/10 text-brand border border-brand/20`}>
                {request.category}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {request.status}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white">{request.title}</h3>
            
            <p className="text-xs text-slate-400 leading-relaxed bg-[#0b0d19] p-4 rounded-2xl border border-darkBg-border/50">
              {request.description}
            </p>
          </div>

          <div className="space-y-3 border-t border-darkBg-border/40 pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Budget Limit</span>
              <span className="text-white font-extrabold">₹{request.budget?.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Deadline Date</span>
              <span className="text-white font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand" />
                {new Date(request.deadline).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Bid Submissions</span>
              <span className="text-brand font-bold">{bids.length} Offers</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-darkBg-border/40">
            {request.tags && request.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 bg-darkBg border border-darkBg-border px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-400">
                <Tag className="w-3 h-3 text-brand-blue" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          {request.images && request.images.length > 0 && (
            <div className="space-y-2 border-t border-darkBg-border/40 pt-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Attachments</span>
              <img 
                src={request.images[0]} 
                alt="attachment" 
                className="w-full h-32 rounded-xl object-cover border border-darkBg-border"
              />
            </div>
          )}
        </div>

        {/* Right Side: Bid Comparison Grid Matrix */}
        <div className="lg:col-span-8 bg-darkBg-card border border-darkBg-border rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Compare Bids - {request.title}</h3>
            <p className="text-xs text-slate-400 mt-1">Review proposals, compare pricing and delivery, and accept the best offer.</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading bids comparison matrix...</div>
          ) : bids.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No bids submitted yet for this request. Active sellers will bid soon.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-darkBg-border/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 pr-4">Seller Details</th>
                    <th className="py-3 px-4 text-right">Price Offer</th>
                    <th className="py-3 px-4 text-center">Delivery Time</th>
                    <th className="py-3 px-4">Proposal Message</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBg-border/40 text-xs">
                  {bids.map((bid) => {
                    const isAccepted = bid.status === 'Accepted';
                    const isShortlisted = bid.status === 'Shortlisted';
                    return (
                      <tr 
                        key={bid._id} 
                        className={`hover:bg-darkBg-hover/10 transition-colors ${
                          isAccepted ? 'bg-emerald-500/5' : isShortlisted ? 'bg-yellow-500/5' : ''
                        }`}
                      >
                        {/* Seller Metadata */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={bid.seller?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${bid.seller?.name}`}
                              alt={bid.seller?.name}
                              className="w-9 h-9 rounded-xl object-cover border border-darkBg-border/80 flex-shrink-0"
                            />
                            <div>
                              <h5 className="font-bold text-white leading-snug">
                                {bid.seller?.businessName || bid.seller?.name}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400">{bid.seller?.name}</span>
                                <span className="flex items-center gap-0.5 bg-yellow-500/10 text-yellow-400 px-1 rounded text-[9px] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-current" /> {bid.seller?.rating || 5.0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price Offer */}
                        <td className="py-4 px-4 text-right font-extrabold text-white">
                          ₹{bid.bidAmount.toLocaleString()}
                        </td>

                        {/* Delivery Time */}
                        <td className="py-4 px-4 text-center text-slate-300 font-semibold">
                          {bid.deliveryTime} Days
                        </td>

                        {/* Proposal Message */}
                        <td className="py-4 px-4 text-slate-400 max-w-xs truncate leading-relaxed">
                          {bid.proposalMessage}
                        </td>

                        {/* Actions Matrix */}
                        <td className="py-4 pl-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Chat button */}
                            <button
                              onClick={() => onChatClick(bid.seller)}
                              title="Chat with Seller"
                              className="p-2 rounded-lg bg-darkBg hover:bg-darkBg-hover border border-darkBg-border text-slate-400 hover:text-white transition-all"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            {/* Shortlist button */}
                            {bid.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateStatus(bid._id, 'Shortlisted')}
                                disabled={actionLoading}
                                title="Shortlist Bid"
                                className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 transition-all"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Accept button */}
                            {bid.status !== 'Accepted' ? (
                              <button
                                onClick={() => handleUpdateStatus(bid._id, 'Accepted')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white text-[11px] font-bold rounded-lg transition-all"
                              >
                                Accept
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Accepted
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick status alert info */}
          <div className="border border-darkBg-border/60 bg-[#0b0d19] p-4 rounded-2xl flex items-start gap-3 text-slate-400 text-xs leading-relaxed">
            <AlertCircle className="w-4.5 h-4.5 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p>
                <strong>Escrow Protection Enabled</strong>: Accepting a bid closes further entries and sets request status to <strong className="text-white">In Progress</strong>. The payment escrow process will initiate, ensuring safety for both buyer and seller.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidComparisonView;
