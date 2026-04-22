const router = require('express').Router();
const OrderStatus = require('../models/OrderStatus');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', async (req, res) => {
  const statuses = await OrderStatus.find().sort({ sequence: 1 });
  res.json({ data: statuses });
});

router.post('/', auth, adminOnly, async (req, res) => {
  const status = await OrderStatus.create(req.body);
  res.status(201).json(status);
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  // Can be used to update an order's status_id
  const { order_id, status_id } = req.body;
  if (order_id) {
    const order = await Order.findByIdAndUpdate(order_id, { status_id }, { new: true }).populate('status_id');
    return res.json(order);
  }
  const status = await OrderStatus.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(status);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await OrderStatus.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
