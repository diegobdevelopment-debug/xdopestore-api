module.exports = (req, res, next) => {
  if (req.user?.role?.name !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admin only' });
  }
  next();
};
