const User = require('../models/User');

// api/controllers/authController.js
exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already taken' });

    const newUser = new User({ username, password, role });
    await newUser.save();

    // Automatically log the user in using Passport's req.login
    req.logIn(newUser, (err) => {
      if (err) return next(err);
      
      // Return user credentials immediately so frontend state populates
      return res.status(201).json({ 
        message: 'Registered and logged in successfully',
        user: { id: newUser._id, username: newUser.username, role: newUser.role }
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = (req, res) => {
  res.json({ id: req.user._id, username: req.user.username, role: req.user.role });
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
};

exports.getCurrentUser = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({ id: req.user._id, username: req.user.username, role: req.user.role });
};