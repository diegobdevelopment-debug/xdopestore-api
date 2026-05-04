const router = require('express').Router();
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/auth');
const { transformProduct } = require('../utils/transform');

router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = { consumer_id: req.user._id };
  const total = await Wishlist.countDocuments(filter);
  const data = await Wishlist.find(filter)
    .skip((page - 1) * limit).limit(limit)
    .populate({
      path: 'product_id',
      populate: [
        { path: 'product_thumbnail_id', select: 'asset_url original_url' },
        { path: 'product_images', select: 'asset_url original_url' },
      ],
    });
  const mapped = data.map((w) => {
    const transformed = transformProduct(w.product_id);
    return { ...transformed, id: w.id };
  });
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data: mapped });
});

router.post('/', auth, async (req, res) => {
  const { product_id } = req.body;
  const existing = await Wishlist.findOne({ consumer_id: req.user._id, product_id });
  if (existing) return res.json(existing);
  const item = await Wishlist.create({ consumer_id: req.user._id, product_id });
  res.status(201).json(item);
});

router.delete('/:id', auth, async (req, res) => {
  await Wishlist.findOneAndDelete({ _id: req.params.id, consumer_id: req.user._id });
  res.json({ message: 'Removed from wishlist' });
});

module.exports = router;
