import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_12345', {
    expiresIn: '30d',
  });
};

// Send token response via cookie & JSON
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user,
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, tier, businessName, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Buyer',
      tier: tier || 'Free',
      businessName,
      phone,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile settings
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      businessName: req.body.businessName,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role, // Allow toggling profile main view
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Redirect to Google OAuth consent screen
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = (req, res) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  
  if (!client_id) {
    return res.status(400).send('Google Client ID is not configured in .env file. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  const protocol = (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') ? 'https' : req.protocol;
  const redirect_uri = `${protocol}://${req.get('host')}/api/auth/google/callback`;
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=email%20profile`;
  
  res.redirect(googleUrl);
};

// @desc    Google OAuth Callback endpoint
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code not provided by Google' });
    }

    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const protocol = (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') ? 'https' : req.protocol;
    const redirect_uri = `${protocol}://${req.get('host')}/api/auth/google/callback`;

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      return res.status(400).json({ success: false, message: tokenData.error_description || 'Token exchange failed' });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile info from Google UserInfo endpoint
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile = await profileRes.json();

    if (!profile.email) {
      return res.status(400).json({ success: false, message: 'Google account does not expose a valid email address' });
    }

    // 3. Find user by email or create new
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        password: Math.random().toString(36).substring(2, 10), // Random temporary password
        role: 'Buyer', // Default role for Google login
        profileImage: profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
        tier: 'Free',
      });
    }

    // 4. Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'super_secret_jwt_key_12345', {
      expiresIn: '30d'
    });

    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };

    // 5. Send cookie and redirect back to frontend client dashboard
    res.cookie('token', token, cookieOptions);
    
    // Redirect to the client's home/dashboard url
    let clientRedirectUrl = process.env.CLIENT_REDIRECT_URL;
    const isLocalhostRedirect = clientRedirectUrl && (clientRedirectUrl.includes('localhost') || clientRedirectUrl.includes('127.0.0.1'));
    if (!clientRedirectUrl || ((process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') && isLocalhostRedirect)) {
      clientRedirectUrl = (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') 
        ? `https://${req.get('host')}` 
        : 'http://localhost:5173';
    }
    res.redirect(clientRedirectUrl);

  } catch (error) {
    res.status(500).send(`Error in Google Authentication: ${error.message}`);
  }
};
