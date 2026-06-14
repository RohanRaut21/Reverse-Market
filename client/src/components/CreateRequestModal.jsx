import React, { useState, useEffect } from 'react';
import { X, Upload, HelpCircle, ShieldCheck } from 'lucide-react';

const CreateRequestModal = ({ isOpen, onClose, onRequestCreated }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('reverseMarket_importedProduct');
      if (stored) {
        try {
          const product = JSON.parse(stored);
          setTitle(product.title || '');
          setCategory(product.category || 'Electronics');
          
          if (product.price) {
            const numericPrice = Number(product.price.replace(/[^\d]/g, ''));
            setBudget(numericPrice || '');
          }
          
          setDescription(`Imported from Amazon:\n- Product: ${product.title}\n- Amazon Price: ${product.price}\n- Amazon Rating: ${product.rating} / 5 (${product.reviews.toLocaleString()} reviews)\n- Amazon URL: ${product.amazonUrl}\n\nPlease enter additional specifications here...`);
          
          if (product.image) {
            setImages([product.image]);
          }
          
          // Set a default deadline 7 days from now
          const defaultDeadline = new Date();
          defaultDeadline.setDate(defaultDeadline.getDate() + 7);
          const dateString = defaultDeadline.toISOString().split('T')[0];
          setDeadline(dateString);
          
          // Clear so it doesn't double-populate on next open
          localStorage.removeItem('reverseMarket_importedProduct');
        } catch (e) {
          console.error('Failed to parse imported product', e);
        }
      }
    }
  }, [isOpen]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const requestData = {
      title,
      category,
      budget: Number(budget),
      deadline: new Date(deadline),
      description,
      // Pass a default mockup image matching category for seed representation
      images: images.length > 0 ? images : [
        category === 'Electronics' 
          ? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400'
          : category === 'Fashion'
          ? 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400'
          : 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400'
      ],
      tags: [category, 'Request']
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      const data = await res.json();

      if (data.success) {
        onRequestCreated(); // Trigger refresh
        onClose(); // Close modal
        // Clear inputs
        setTitle('');
        setBudget('');
        setDeadline('');
        setDescription('');
      } else {
        setError(data.message || 'Error creating request');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="relative bg-[#121426] border border-darkBg-border/80 rounded-3xl w-full max-w-xl p-6 shadow-2xl z-10 flex flex-col max-h-[90vh] space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-darkBg-border/40">
          <div>
            <h3 className="text-lg font-bold text-white">Create New Request</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Provide detailed information about your requirement.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-darkBg hover:bg-darkBg-hover flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 block">Request Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gaming Laptop with 16GB RAM"
              className="w-full px-3.5 py-2.5 bg-[#0b0d19] border border-darkBg-border rounded-xl text-xs focus:outline-none focus:border-brand text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0b0d19] border border-darkBg-border rounded-xl text-xs focus:outline-none focus:border-brand text-slate-300 font-medium"
              >
                <option value="Electronics">Electronics</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Fashion">Fashion</option>
                <option value="Machinery">Machinery</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Services">Services</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Budget (INR)</label>
              <input 
                type="number" 
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 75000"
                className="w-full px-3.5 py-2.5 bg-[#0b0d19] border border-darkBg-border rounded-xl text-xs focus:outline-none focus:border-brand text-white"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Deadline Picker</label>
              <input 
                type="date" 
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0b0d19] border border-darkBg-border rounded-xl text-xs focus:outline-none focus:border-brand text-slate-300"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 block">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your requirement in detail. Include specifications, preferences, brand, model, etc."
              className="w-full px-3.5 py-2.5 bg-[#0b0d19] border border-darkBg-border rounded-xl text-xs focus:outline-none focus:border-brand text-white resize-none"
            ></textarea>
          </div>

          {/* Uploader Mockup */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 block">Upload Images (Optional)</label>
            <div className="border border-dashed border-darkBg-border/60 rounded-xl py-2 px-3 bg-[#0b0d19]/30 hover:bg-[#0b0d19]/60 transition-all flex items-center justify-center gap-3 cursor-pointer group">
              <Upload className="w-5 h-5 text-slate-500 group-hover:text-brand transition-colors" />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-300 block leading-tight">Click to upload or drag and drop</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">PNG, JPG or WEBP (Max 5 files)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-darkBg-border/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-darkBg-border hover:bg-darkBg-hover text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand/20"
            >
              {loading ? 'Publishing...' : 'Publish Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
