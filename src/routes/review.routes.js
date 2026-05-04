const router = require('express').Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
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
  const delivered = await OrderStatus.findOne({ slug: 'delivered' });
  const hasPurchased = await Order.findOne({
    consumer_id: req.user._id,
    'products.product_id': req.body.product_id,
    status_id: delivered?._id,
  });
  if (!hasPurchased) return res.status(403).json({ message: 'Debes comprar el producto para dejar una reseña' });

  const review = await Review.create({ ...req.body, consumer_id: req.user._id });
  res.status(201).json(review);
});

router.put('/:id', auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review no encontrada' });
  if (review.consumer_id.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'No autorizado' });
  review.rating = req.body.rating ?? review.rating;
  review.description = req.body.description ?? review.description;
  await review.save();
  res.json(review);
});

router.delete('/:id', auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review no encontrada' });
  if (review.consumer_id.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'No autorizado' });
  await review.deleteOne();
  res.json({ message: 'Review eliminada' });
});

module.exports = router;
