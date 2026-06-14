import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  Plus,
  Star,
  CheckCircle,
  Globe,
} from "lucide-react";

const AuthPage = ({ onBackToLanding }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up as shown in the screenshot

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Buyer");
  const [regPhone, setRegPhone] = useState("");
  const [regBusiness, setRegBusiness] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const userData = {
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      phone: regPhone,
      businessName: regRole === "Seller" ? regBusiness : undefined,
    };

    const res = await register(userData);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
    }
  };

  const prefillUser = (role) => {
    setIsLogin(true);
    setError("");
    if (role === "Buyer") {
      setEmail("rohan@buyer.com");
      setPassword("password123");
    } else {
      setEmail("arjun@seller.com");
      setPassword("password123");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // Live password checks
  const hasMinLength = regPassword.length >= 8;
  const hasNumber = /\d/.test(regPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(regPassword);

  return (
    <div className="min-h-screen bg-darkBg text-white grid grid-cols-1 lg:grid-cols-12 font-sans antialiased overflow-x-hidden">
      {/* LEFT COLUMN: Visual Brand Panel (Visible on Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-[#0b0d19] border-r border-darkBg-border/40 relative overflow-hidden">
        {/* Background glow overlay */}
        <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-brand/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-brand-blue/10 rounded-full blur-[100px] -z-10"></div>

        {/* Brand Logo Header */}
        <div
          className="flex items-center gap-2 cursor-pointer relative z-10"
          onClick={onBackToLanding}
        >
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-brand/20">
            R
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Reverse<span className="text-brand">Market</span>
          </span>
        </div>

        {/* Content & Bidding Graphics */}
        <div className="my-auto space-y-10 relative z-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-[1.2]">
              You Request.
              <br />
              <span className="bg-gradient-to-r from-brand via-purple-400 to-brand-blue bg-clip-text text-transparent">
                Sellers Compete.
              </span>
              <br />
              You Win.
            </h1>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Post what you need and get the best offers from verified sellers.
              Save time, save money.
            </p>
          </div>

          {/* Core Storyboard Graphic (Bean Bag Laptop Girl & Floating Bid Cards) */}
          <div className="relative w-full h-[320px] flex items-center justify-center mt-6">
            {/* Main Center Image inside Glowing ring */}
            <div className="w-52 h-52 rounded-full overflow-hidden border-2 border-brand/35 bg-darkBg-card relative shadow-2xl shadow-brand/20 flex items-center justify-center">
              <img
                src="/working_woman_beanbag.png"
                alt="Working on laptop"
                className="w-full h-full object-cover scale-110 translate-y-1.5"
              />
            </div>

            {/* Orbiting Card 1: Offer Received 12,500 */}
            <div className="absolute top-[20%] -left-6 bg-[#121426]/95 border border-darkBg-border/80 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex flex-col w-36 transition-all hover:scale-105">
              <span className="text-[10px] text-slate-500 font-semibold">
                Offer Received
              </span>
              <span className="text-sm font-extrabold text-white mt-0.5">
                ₹12,500
              </span>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-slate-400 truncate w-20">
                  Global Suppliers
                </span>
                <span className="text-[9px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded font-bold">
                  ★ 4.6
                </span>
              </div>
            </div>

            {/* Orbiting Card 2: Best Offer 10,800 */}
            <div className="absolute -top-6 right-2 bg-[#121426]/95 border border-brand/35 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex flex-col w-36 transition-all hover:scale-105">
              <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-0.5">
                🏆 Best Offer
              </span>
              <span className="text-sm font-extrabold text-white mt-0.5">
                ₹10,800
              </span>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-slate-400 truncate w-20">
                  Shree Traders
                </span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  ★ 4.9
                </span>
              </div>
            </div>

            {/* Orbiting Card 3: Offer Received 13,900 */}
            <div className="absolute bottom-[10%] -right-4 bg-[#121426]/95 border border-darkBg-border/80 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex flex-col w-36 transition-all hover:scale-105">
              <span className="text-[10px] text-slate-500 font-semibold">
                Offer Received
              </span>
              <span className="text-sm font-extrabold text-white mt-0.5">
                ₹13,900
              </span>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] text-slate-400 truncate w-20">
                  Rahul Enterprises
                </span>
                <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-bold">
                  ★ 4.8
                </span>
              </div>
            </div>

            {/* Floating Graphic Badge */}
            <div className="absolute bottom-[20%] left-6 w-9 h-9 rounded-full bg-brand flex items-center justify-center shadow-lg shadow-brand/30 animate-pulse">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Left Column footer features */}
        <div className="grid grid-cols-3 gap-4 border-t border-darkBg-border/40 pt-6 mt-auto">
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">
              Verified Sellers
            </h4>
            <p className="text-[10px] text-slate-500 leading-snug mt-1">
              All sellers are fully verified for safety and trust.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">
              Best Prices
            </h4>
            <p className="text-[10px] text-slate-500 leading-snug mt-1">
              Compare multiple offers and choose the best fit.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wide">
              Secure & Safe
            </h4>
            <p className="text-[10px] text-slate-500 leading-snug mt-1">
              Your data, transactions, and payouts are protected.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Box Container */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center w-full min-h-screen py-12 px-6 relative">
        {/* Glow gradients behind the form */}
        <div className="absolute top-[25%] right-[25%] w-[450px] h-[450px] bg-brand/5 rounded-full blur-[120px] -z-10"></div>

        {/* Back Link for mobile/tablet */}
        <button
          onClick={onBackToLanding}
          className="lg:hidden mb-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all font-semibold"
        >
          ← Back to home
        </button>

        {/* AUTH CARD */}
        <div className="w-full max-w-lg bg-[#121426] border border-darkBg-border/80 rounded-3xl p-8 shadow-2xl relative flex flex-col">
          {/* Card Top: Tabs & Globe Dropdown */}
          <div className="flex justify-between items-center mb-8 border-b border-darkBg-border/40 pb-3">
            {/* Tab Selectors */}
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`text-sm font-bold pb-3.5 transition-all relative ${
                  isLogin
                    ? "text-white border-b-2 border-brand"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className={`text-sm font-bold pb-3.5 transition-all relative ${
                  !isLogin
                    ? "text-white border-b-2 border-brand"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Header Title */}
          <div className="space-y-1.5 mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isLogin ? "Welcome back!" : "Create your account"}
            </h2>
            <p className="text-xs text-slate-400 leading-normal">
              {isLogin
                ? "Log in to your ReverseMarket account to manage bids and requests."
                : "Join as a buyer or seller and start optimizing your transactions today."}
            </p>
          </div>

          {/* Quick Demo Login prefiller (Crucial for testing) */}

          {/* Error Message Box */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MAIN FORM */}
          <form
            onSubmit={isLogin ? handleLogin : handleRegister}
            className="space-y-4"
          >
            {/* ROLE SELECTOR CARDS (SignUp Only) */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setRegRole("Buyer")}
                  className={`p-4 border rounded-2xl text-left transition-all flex flex-col gap-2 relative ${
                    regRole === "Buyer"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-darkBg-border bg-darkBg hover:bg-darkBg-hover/30"
                  }`}
                >
                  <User
                    className={`w-5 h-5 ${regRole === "Buyer" ? "text-brand" : "text-slate-400"}`}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      I'm a Buyer
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Post requests and get offers
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole("Seller")}
                  className={`p-4 border rounded-2xl text-left transition-all flex flex-col gap-2 relative ${
                    regRole === "Seller"
                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                      : "border-darkBg-border bg-darkBg hover:bg-darkBg-hover/30"
                  }`}
                >
                  <Briefcase
                    className={`w-5 h-5 ${regRole === "Seller" ? "text-brand" : "text-slate-400"}`}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      I'm a Seller
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      Sell and grow your business
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* FIELDS */}
            {/* Full Name (SignUp Only) */}
            {!isLogin && (
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-11 pr-4 py-3 bg-darkBg border border-darkBg-border/80 focus:border-brand rounded-2xl text-xs text-white focus:outline-none placeholder-slate-500 transition-colors"
                />
              </div>
            )}

            {/* Email Address (Both) */}
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={isLogin ? email : regEmail}
                onChange={(e) =>
                  isLogin
                    ? setEmail(e.target.value)
                    : setRegEmail(e.target.value)
                }
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3 bg-darkBg border border-darkBg-border/80 focus:border-brand rounded-2xl text-xs text-white focus:outline-none placeholder-slate-500 transition-colors"
              />
            </div>

            {/* Mobile Number (SignUp Only) */}
            {!isLogin && (
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full pl-11 pr-4 py-3 bg-darkBg border border-darkBg-border/80 focus:border-brand rounded-2xl text-xs text-white focus:outline-none placeholder-slate-500 transition-colors"
                />
              </div>
            )}

            {/* Business/Company Name (SignUp Seller Only) */}
            {!isLogin && regRole === "Seller" && (
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regBusiness}
                  onChange={(e) => setRegBusiness(e.target.value)}
                  placeholder="Business / Company Name"
                  className="w-full pl-11 pr-4 py-3 bg-darkBg border border-darkBg-border/80 focus:border-brand rounded-2xl text-xs text-white focus:outline-none placeholder-slate-500 transition-colors"
                />
              </div>
            )}

            {/* Password (Both) */}
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={isLogin ? password : regPassword}
                onChange={(e) =>
                  isLogin
                    ? setPassword(e.target.value)
                    : setRegPassword(e.target.value)
                }
                placeholder={isLogin ? "Password" : "Create Password"}
                className="w-full pl-11 pr-12 py-3 bg-darkBg border border-darkBg-border/80 focus:border-brand rounded-2xl text-xs text-white focus:outline-none placeholder-slate-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-slate-500 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>

            {/* Security Checklist (SignUp Only) */}
            {!isLogin && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                <span
                  className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-slate-500"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-emerald-400" : "bg-slate-500"}`}
                  ></span>
                  At least 8 characters
                </span>
                <span
                  className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400" : "text-slate-500"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${hasNumber ? "bg-emerald-400" : "bg-slate-500"}`}
                  ></span>
                  One number
                </span>
                <span
                  className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-400" : "text-slate-500"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? "bg-emerald-400" : "bg-slate-500"}`}
                  ></span>
                  One special character
                </span>
              </div>
            )}

            {/* Forgot Password link (Login Only) */}
            {isLogin && (
              <div className="text-right">
                <a
                  href="#"
                  className="text-xs text-brand hover:underline font-semibold"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand/20 transition-all flex justify-center items-center gap-2 mt-4"
            >
              <span>
                {loading
                  ? "Processing..."
                  : isLogin
                    ? "Sign In"
                    : regRole === "Buyer"
                      ? "Create Buyer Account"
                      : "Create Seller Account"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* DIVIDER OR */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-darkBg-border/40"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              or
            </span>
            <div className="flex-grow border-t border-darkBg-border/40"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 border border-darkBg-border/80 hover:bg-darkBg-hover bg-transparent text-slate-300 hover:text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2.5 text-xs"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.69c-.29 1.5-.1.8-1.5 2.1l2.3 2.1 2.3 2.1c1.5-1.5 2.4-3.5 2.4-6.1z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.8-2.94c-1.1.74-2.5 1.18-4.16 1.18-3.2 0-5.9-2.16-6.87-5.06H1.18v3.08C3.18 21.3 7.28 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.13 14.27c-.25-.74-.39-1.54-.39-2.37s.14-1.63.39-2.37V6.45H1.18C.43 7.94 0 9.61 0 11.9s.43 3.96 1.18 5.45l3.95-3.08z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.23 0 12 0 7.28 0 3.18 2.7 1.18 6.45l3.95 3.08c.97-2.9 3.67-5.06 6.87-5.06z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* TOGGLE BOTTOM LINK */}
          <div className="text-center mt-6">
            <span className="text-xs text-slate-400">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-xs text-brand hover:underline font-bold transition-all"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </div>

          {/* AUTH CARD GUARANTEES FOOTER */}
          <div className="grid grid-cols-4 gap-2 pt-6 mt-6 border-t border-darkBg-border/40 text-center text-[9px] text-slate-500 leading-tight">
            <div>
              <strong className="text-slate-400 block font-bold mb-0.5">
                100% Free
              </strong>
              <span>No hidden charges</span>
            </div>
            <div>
              <strong className="text-slate-400 block font-bold mb-0.5">
                Trusted Platform
              </strong>
              <span>Verified & secure</span>
            </div>
            <div>
              <strong className="text-slate-400 block font-bold mb-0.5">
                24/7 Support
              </strong>
              <span>We're here to help</span>
            </div>
            <div>
              <strong className="text-slate-400 block font-bold mb-0.5">
                Quick & Easy
              </strong>
              <span>Get started in minutes</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <button
          onClick={onBackToLanding}
          className="mt-6 text-center text-xs text-slate-500 hover:text-white transition-all font-semibold"
        >
          ← Back to landing page
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
