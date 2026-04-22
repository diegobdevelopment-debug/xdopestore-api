const router = require('express').Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = {};
  if (req.query.product_id) filter.product_id = req.query.product_id;
  const total = await Review.countDocuments(filter);
  const data = await Review.find(filter)
    .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 })
    .populate('consumer_id', 'name profile_image_id')
    .populate('product_id', 'name');
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data });
});

router.post('/', auth, async (req, res) => {
  const review = await Review.create({ ...req.body, consumer_id: req.user._id });
  res.status(201).json(review);
});

router.delete('/:id', auth, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Review deleted' });
});

module.exports = router;
