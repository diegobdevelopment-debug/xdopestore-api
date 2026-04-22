const router = require('express').Router();
const Shipping = require('../models/Shipping');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const total = await Shipping.countDocuments();
  const data = await Shipping.find().skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data });
});

router.get('/:id', async (req, res) => {
  const s = await Shipping.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});

router.post('/', auth, adminOnly, async (req, res) => {
  const s = await Shipping.create({ ...req.body, created_by_id: req.user._id });
  res.status(201).json(s);
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const s = await Shipping.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(s);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Shipping.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
