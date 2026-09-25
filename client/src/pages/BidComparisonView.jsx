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

  const [sortBy, setSortBy] = useState('price'); // 'price', 'quality', 'delivery'

  const sortedBids = [...bids].sort((a, b) => {
    if (sortBy === 'quality') {
      return (b.qualityScore || 0) - (a.qualityScore || 0);
    }
    if (sortBy === 'delivery') {
      return a.deliveryTime - b.deliveryTime;
    }
    return a.bidAmount - b.bidAmount; // default price
  });

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

          {/* Quality-Aware Specifications (QARM) Display */}
          {request.mandatorySpecs && request.mandatorySpecs.length > 0 && (
            <div className="space-y-1.5 border-t border-darkBg-border/40 pt-3">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Mandatory Criteria ({request.mandatorySpecs.length})</span>
              </span>
              <div className="space-y-1">
                {request.mandatorySpecs.map((spec, i) => (
                  <div key={i} className="text-[11px] text-slate-300 bg-[#0b0d19] border border-rose-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {request.preferredSpecs && request.preferredSpecs.length > 0 && (
            <div className="space-y-1.5 border-t border-darkBg-border/40 pt-3">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Preferred Perks ({request.preferredSpecs.length})</span>
              </span>
              <div className="space-y-1">
                {request.preferredSpecs.map((spec, i) => (
                  <div key={i} className="text-[11px] text-slate-300 bg-[#0b0d19] border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">★</span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Compare Bids - {request.title}</h3>
              <p className="text-xs text-slate-400 mt-1">Multi-attribute evaluation: compare price, delivery, and quality compliance score.</p>
            </div>

            {/* Sort Filter Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 bg-[#0b0d19] border border-darkBg-border rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-brand"
              >
                <option value="price">Lowest Price</option>
                <option value="quality">⭐ Quality Match Score</option>
                <option value="delivery">Fastest Delivery</option>
              </select>
            </div>
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
                    <th className="py-3 pr-3">Seller</th>
                    <th className="py-3 px-3 text-right">Price Offer</th>
                    <th className="py-3 px-3 text-center">Quality Match</th>
                    <th className="py-3 px-3 text-center">Delivery</th>
                    <th className="py-3 px-3">Proposal & Specs Compliance</th>
                    <th className="py-3 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBg-border/40 text-xs">
                  {sortedBids.map((bid) => {
                    const isAccepted = bid.status === 'Accepted';
                    const isShortlisted = bid.status === 'Shortlisted';
                    const score = bid.qualityScore !== undefined ? bid.qualityScore : 100;
                    
                    // Quality score styling
                    let scoreBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                    if (score < 70) {
                      scoreBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                    } else if (score < 90) {
                      scoreBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                    }

                    const satMandatoryCount = bid.specsCompliance?.filter(c => c.satisfied).length || 0;
                    const totalMandatoryCount = bid.specsCompliance?.length || 0;
                    const incPreferredCount = bid.preferredOffered?.filter(p => p.included).length || 0;
                    const totalPreferredCount = bid.preferredOffered?.length || 0;

                    return (
                      <tr 
                        key={bid._id} 
                        className={`hover:bg-darkBg-hover/10 transition-colors ${
                          isAccepted ? 'bg-emerald-500/5' : isShortlisted ? 'bg-yellow-500/5' : ''
                        }`}
                      >
                        {/* Seller Metadata */}
                        <td className="py-4 pr-3">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={bid.seller?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${bid.seller?.name}`}
                              alt={bid.seller?.name}
                              className="w-8 h-8 rounded-xl object-cover border border-darkBg-border/80 flex-shrink-0"
                            />
                            <div>
                              <h5 className="font-bold text-white leading-snug text-xs">
                                {bid.seller?.businessName || bid.seller?.name}
                              </h5>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="flex items-center gap-0.5 bg-yellow-500/10 text-yellow-400 px-1 rounded text-[9px] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-current" /> {bid.seller?.rating || 5.0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price Offer */}
                        <td className="py-4 px-3 text-right font-extrabold text-white text-sm">
                          ₹{bid.bidAmount.toLocaleString()}
                        </td>

                        {/* Quality Match Score */}
                        <td className="py-4 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${scoreBadgeColor}`}>
                              ⭐ {score}% Match
                            </span>
                            {totalMandatoryCount > 0 && (
                              <span className="text-[9px] text-slate-500 mt-0.5">
                                {satMandatoryCount === totalMandatoryCount ? '✓ All Mandatory' : `⚠ ${satMandatoryCount}/${totalMandatoryCount} Mandatory`}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Delivery Time */}
                        <td className="py-4 px-3 text-center text-slate-300 font-semibold">
                          {bid.deliveryTime} Days
                        </td>

                        {/* Proposal & Specs Compliance */}
                        <td className="py-4 px-3 max-w-xs space-y-1">
                          <p className="text-slate-400 truncate leading-relaxed">
                            {bid.proposalMessage}
                          </p>
                          
                          {/* Compliance Tags */}
                          {(totalMandatoryCount > 0 || totalPreferredCount > 0) && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {totalMandatoryCount > 0 && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  satMandatoryCount === totalMandatoryCount 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {satMandatoryCount === totalMandatoryCount ? '✓ Mandatory Met' : `⚠ ${satMandatoryCount}/${totalMandatoryCount} Mandatory`}
                                </span>
                              )}
                              {incPreferredCount > 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  ★ {incPreferredCount} Perks Included
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions Matrix */}
                        <td className="py-4 pl-3 text-right">
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
