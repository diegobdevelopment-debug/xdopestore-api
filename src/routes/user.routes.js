const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { transformUser } = require('../utils/transform');

// GET /user  — admin: all users
router.get('/user', auth, adminOnly, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = {};
  if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
  if (req.query.role) filter.role = req.query.role;
  const total = await User.countDocuments(filter);
  const data = await User.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).populate('role', 'name').populate('profile_image_id', 'asset_url original_url');
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data: data.map(transformUser) });
});

// POST /user  — admin creates a new user
router.post('/user', auth, adminOnly, async (req, res) => {
  const body = { ...req.body };
  if (body.role_id) { body.role = body.role_id; delete body.role_id; }
  if (body.password_confirmation) delete body.password_confirmation;
  const existing = await User.findOne({ email: body.email });
  if (existing) return res.status(422).json({ message: 'Email already taken' });
  const user = await User.create(body);
  await user.populate('role', 'name');
  res.status(201).json(transformUser(user));
});

// GET /user/:id
router.get('/user/:id', auth, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id).populate('role').populate('profile_image_id', 'asset_url original_url');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(transformUser(user));
});

// PUT /user/:id
router.put('/user/:id', auth, adminOnly, async (req, res) => {
  const body = { ...req.body };
  if (body.role_id) { body.role = body.role_id; delete body.role_id; }
  if (body.password_confirmation) delete body.password_confirmation;
  if (body.password === '' || body.password === undefined) delete body.password;
  const user = await User.findByIdAndUpdate(req.params.id, body, { new: true }).populate('role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(transformUser(user));
});

// DELETE /user/:id
router.delete('/user/:id', auth, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// PUT /updateProfile — current user
router.put('/updateProfile', auth, async (req, res) => {
  const { name, phone, country_code, profile_image_id } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, country_code, profile_image_id },
    { new: true }
  ).populate('role');
  res.json(user);
});

// PUT /updatePassword — current user
router.put('/updatePassword', auth, async (req, res) => {
  const { current_password, password } = req.body;
  const user = await User.findById(req.user._id);
  const valid = await user.comparePassword(current_password);
  if (!valid) return res.status(422).json({ message: 'Current password is incorrect' });
  user.password = password;
  await user.save();
  res.json({ message: 'Password updated' });
});

module.exports = router;
