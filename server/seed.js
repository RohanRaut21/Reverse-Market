import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Request from './models/Request.js';
import Bid from './models/Bid.js';
import Message from './models/Message.js';
import { getRoomId } from './controllers/messageController.js';

dotenv.config();

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reverse_market');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Request.deleteMany();
    await Bid.deleteMany();
    await Message.deleteMany();
    console.log('Existing data cleared.');

    // Create primary users
    // Rohan Sharma (Buyer)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const rohan = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@buyer.com',
      password: 'password123', // Model hook will hash this on save, but wait! Pre-save hook hashes it. Let's pass plain password so pre-save works.
      role: 'Buyer',
      tier: 'Free',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      joinedAt: new Date('2025-05-01'),
    });

    // Arjun Verma (Seller)
    const arjun = await User.create({
      name: 'Arjun Verma',
      email: 'arjun@seller.com',
      password: 'password123',
      role: 'Seller',
      tier: 'Pro',
      rating: 4.8,
      businessName: 'Apex Electronics',
      phone: '+91 98765 43210',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      joinedAt: new Date('2025-05-10'),
    });

    // Create other mock Sellers
    const sellers = {};
    const sellerList = [
      { name: 'TechWorld Solutions', email: 'techworld@seller.com', businessName: 'TechWorld India', rating: 4.8 },
      { name: 'GearUp Store', email: 'gearup@seller.com', businessName: 'GearUp Store', rating: 4.5 },
      { name: 'LaptopHub', email: 'laptophub@seller.com', businessName: 'LaptopHub', rating: 4.3 },
      { name: 'TechGear Solutions', email: 'techgear@seller.com', businessName: 'TechGear Solutions', rating: 4.6 },
      { name: 'FashionHub', email: 'fashionhub@seller.com', businessName: 'FashionHub', rating: 4.7 },
      { name: 'SoundMax Pro', email: 'soundmax@seller.com', businessName: 'SoundMax Pro', rating: 4.9 },
      { name: 'Shree Traders', email: 'shree@seller.com', businessName: 'Shree Traders', rating: 4.9 },
      { name: 'Global Supplies', email: 'global@seller.com', businessName: 'Global Supplies', rating: 4.6 },
      { name: 'Rahul Enterprises', email: 'rahul@seller.com', businessName: 'Rahul Enterprises', rating: 4.7 },
      { name: 'NextGen Systems', email: 'nextgen@seller.com', businessName: 'NextGen Systems', rating: 4.4 }
    ];

    for (const s of sellerList) {
      const createdSeller = await User.create({
        name: s.name,
        email: s.email,
        password: 'password123',
        role: 'Seller',
        tier: 'Free',
        rating: s.rating,
        businessName: s.businessName,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.businessName)}`
      });
      sellers[s.businessName] = createdSeller;
    }

    console.log('Users seeded.');

    // Create Requests (buyer = Rohan)
    const req1 = await Request.create({
      buyer: rohan._id,
      title: 'Wireless Headphones',
      description: 'High quality wireless headphones with noise cancellation and long battery life. Needed for daily office calls and music.',
      category: 'Electronics',
      budget: 10000,
      deadline: new Date('2026-06-25T12:00:00Z'),
      status: 'Active',
      featured: true,
      tags: ['Bluetooth', 'Noise Cancellation', 'Over-ear'],
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop']
    });

    const req2 = await Request.create({
      buyer: rohan._id,
      title: 'Gaming Laptop',
      description: 'Looking for a gaming laptop with 16GB RAM, 512GB SSD, dedicated graphics card (RTX 3050 or above). Prefer brands like Asus, Lenovo, or Acer.',
      category: 'Electronics',
      budget: 75000,
      deadline: new Date('2026-06-20T12:00:00Z'),
      status: 'Bidding Closed',
      tags: ['Gaming', '16GB RAM', 'SSD'],
      images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=400&auto=format&fit=crop']
    });

    const req3 = await Request.create({
      buyer: rohan._id,
      title: 'Interior Design for 2BHK',
      description: 'Complete interior design and execution for a 2BHK flat including modular kitchen, wardrobes, and living room setup.',
      category: 'Services',
      budget: 50000,
      deadline: new Date('2026-05-15T12:00:00Z'),
      status: 'In Progress',
      tags: ['Interior Design', 'Modular Kitchen', '2BHK'],
      images: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400&auto=format&fit=crop']
    });

    const req4 = await Request.create({
      buyer: rohan._id,
      title: 'Bulk T-Shirts (100 Pieces)',
      description: 'Plain round neck cotton T-shirts in various colors and sizes (S, M, L, XL) for a corporate event. High quality fabric print support preferred.',
      category: 'Fashion',
      budget: 12000,
      deadline: new Date('2026-05-10T12:00:00Z'),
      status: 'Completed',
      tags: ['Round Neck', 'Cotton', 'Bulk Order'],
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop']
    });

    const req5 = await Request.create({
      buyer: rohan._id,
      title: 'Ergonomic Office Chair',
      description: 'Ergonomic office chair with high back support, adjustable armrests, and mesh material. Ideal for 8+ hours of daily seating.',
      category: 'Home & Kitchen',
      budget: 8000,
      deadline: new Date('2026-06-28T12:00:00Z'),
      status: 'Active',
      tags: ['Ergonomic', 'Mesh', 'Adjustable'],
      images: ['https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=400&auto=format&fit=crop']
    });

    console.log('Requests seeded.');

    // Bids for req1 (Wireless Headphones)
    await Bid.create({
      request: req1._id,
      seller: sellers['Shree Traders']._id,
      bidAmount: 10800,
      deliveryTime: 2,
      proposalMessage: 'Shree Traders offers top-brand wireless headphones with 2-year warranty and stellar active noise cancellation.',
      status: 'Pending'
    });

    await Bid.create({
      request: req1._id,
      seller: sellers['Global Supplies']._id,
      bidAmount: 9450,
      deliveryTime: 3,
      proposalMessage: 'High fidelity wireless sound, 40 hours battery life. Direct warehouse pricing with immediate dispatch.',
      status: 'Pending'
    });

    await Bid.create({
      request: req1._id,
      seller: sellers['Rahul Enterprises']._id,
      bidAmount: 11200,
      deliveryTime: 1,
      proposalMessage: 'Premium quality with 1-day super fast delivery. Active noise cancelling and heavy bass.',
      status: 'Pending'
    });

    // Bids for req2 (Gaming Laptop)
    const bidLaptop1 = await Bid.create({
      request: req2._id,
      seller: sellers['TechWorld India']._id,
      bidAmount: 72000,
      deliveryTime: 3,
      proposalMessage: 'We can provide a high-quality gaming laptop with 16GB RAM, RTX 3050, 512GB SSD. 1 Year warranty and free delivery.',
      status: 'Shortlisted'
    });

    await Bid.create({
      request: req2._id,
      seller: sellers['GearUp Store']._id,
      bidAmount: 70000,
      deliveryTime: 5,
      proposalMessage: 'Best price with good quality graphic card and high-speed processor.',
      status: 'Pending'
    });

    await Bid.create({
      request: req2._id,
      seller: sellers['LaptopHub']._id,
      bidAmount: 74000,
      deliveryTime: 2,
      proposalMessage: 'Fastest delivery with extended warranty option. Brand new factory sealed unit.',
      status: 'Pending'
    });

    await Bid.create({
      request: req2._id,
      seller: sellers['TechGear Solutions']._id,
      bidAmount: 71500,
      deliveryTime: 4,
      proposalMessage: 'Reliable and trusted seller. Highly rated service with full post-purchase hardware support.',
      status: 'Outbid'
    });

    await Bid.create({
      request: req2._id,
      seller: sellers['NextGen Systems']._id,
      bidAmount: 73800,
      deliveryTime: 3,
      proposalMessage: 'High performance gaming laptop with cool-boost dual-fan technology.',
      status: 'Outbid'
    });

    // Bid for req3 (Interior Design for 2BHK - In Progress)
    await Bid.create({
      request: req3._id,
      seller: sellers['Shree Traders']._id,
      bidAmount: 48000,
      deliveryTime: 15,
      proposalMessage: 'We will design your 2BHK flat with a beautiful modular kitchen and customized wardrobes.',
      status: 'Accepted'
    });

    // Bid for req4 (Bulk T-Shirts - Completed)
    await Bid.create({
      request: req4._id,
      seller: sellers['FashionHub']._id,
      bidAmount: 11500,
      deliveryTime: 7,
      proposalMessage: 'Premium quality organic cotton T-shirts. Free customized screen-printing included.',
      status: 'Accepted'
    });

    // Add a bid by Arjun Verma (Seller) to request 1 so Arjun can see it in his dashboard "My Bids"
    await Bid.create({
      request: req1._id,
      seller: arjun._id,
      bidAmount: 9900,
      deliveryTime: 2,
      proposalMessage: 'Apex Electronics premium wireless headphones. 30 hours battery, premium sound quality.',
      status: 'Pending'
    });

    // Add a bid by Arjun Verma to request 2
    await Bid.create({
      request: req2._id,
      seller: arjun._id,
      bidAmount: 73000,
      deliveryTime: 3,
      proposalMessage: 'Premium Gaming Laptop with customized config. Fast delivery.',
      status: 'Pending'
    });

    console.log('Bids seeded.');

    // Seed Messages (Rohan <=> TechWorld India/Solutions regarding req2)
    const techWorldUser = sellers['TechWorld India'];
    const rId = getRoomId(rohan._id, techWorldUser._id);

    await Message.create({
      roomId: rId,
      sender: techWorldUser._id,
      receiver: rohan._id,
      messageText: 'Hello Rohan, I saw your requirement for gaming laptop.'
    });

    await Message.create({
      roomId: rId,
      sender: rohan._id,
      receiver: techWorldUser._id,
      messageText: 'Hi, yes. Can you share more specifications?'
    });

    await Message.create({
      roomId: rId,
      sender: techWorldUser._id,
      receiver: rohan._id,
      messageText: 'Sure! We can provide RTX 3050, 16GB RAM, 512GB SSD.'
    });

    await Message.create({
      roomId: rId,
      sender: rohan._id,
      receiver: techWorldUser._id,
      messageText: 'Great! What about warranty and after-sales support?'
    });

    await Message.create({
      roomId: rId,
      sender: techWorldUser._id,
      receiver: rohan._id,
      messageText: '1 Year warranty and dedicated support!'
    });

    await Message.create({
      roomId: rId,
      sender: rohan._id,
      receiver: techWorldUser._id,
      messageText: 'Good. I am reviewing bids, will get back soon.'
    });

    // Seed Messages between Rohan and SoundMax Pro
    const soundMaxUser = sellers['SoundMax Pro'];
    const rId2 = getRoomId(rohan._id, soundMaxUser._id);

    await Message.create({
      roomId: rId2,
      sender: soundMaxUser._id,
      receiver: rohan._id,
      messageText: 'Hey Rohan, regarding your request for Wireless Headphones, we can offer custom branding if you order in bulk.'
    });

    // Seed messages between Rohan and Arjun Verma (Seller)
    const rId3 = getRoomId(rohan._id, arjun._id);

    await Message.create({
      roomId: rId3,
      sender: arjun._id,
      receiver: rohan._id,
      messageText: 'Hi Rohan, I have placed a bid on your wireless headphones. Let me know if you want any custom brand suggestions.'
    });

    await Message.create({
      roomId: rId3,
      sender: rohan._id,
      receiver: arjun._id,
      messageText: 'Thanks Arjun. I will check your bid details and get back to you shortly!'
    });

    console.log('Messages seeded.');
    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
