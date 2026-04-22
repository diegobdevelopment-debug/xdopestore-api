const router = require('express').Router();
const Compare = require('../models/Compare');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const data = await Compare.find({ consumer_id: req.user._id })
    .populate({ path: 'product_id', populate: { path: 'product_thumbnail_id', select: 'asset_url' } });
  res.json({ data });
});

router.post('/', auth, async (req, res) => {
  const { product_id } = req.body;
  const existing = await Compare.findOne({ consumer_id: req.user._id, product_id });
  if (existing) return res.json(existing);
  const item = await Compare.create({ consumer_id: req.user._id, product_id });
  res.status(201).json(item);
});

router.delete('/:id', auth, async (req, res) => {
  await Compare.findOneAndDelete({ _id: req.params.id, consumer_id: req.user._id });
  res.json({ message: 'Removed from compare' });
});

module.exports = router;
