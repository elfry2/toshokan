exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Unauthorized' });
};

exports.isLibrarian = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'librarian') return next();
  res.status(403).json({ message: 'Forbidden: Librarian access required' });
};