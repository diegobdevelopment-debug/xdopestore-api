const router = require('express').Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const OrderStatus = require('../models/OrderStatus');
const auth = require('../middleware/auth');

function transformOrder(order) {
  const obj = order.toJSON ? order.toJSON() : order;
  // Admin dashboard expects order_status as the populated object
  obj.order_status = obj.status_id || null;
  // Expect array of tracking activities (stub — can be populated from a future model)
  if (!obj.order_status_activities) obj.order_status_activities = [];
  // Expect sub_orders (multi-vendor — empty for now)
  if (!obj.sub_orders) obj.sub_orders = [];
  return obj;
}

// GET /order
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 10;
  const isAdmin = req.user.role?.name === 'admin';
  const filter = isAdmin ? {} : { consumer_id: req.user._id };
  if (req.query.status) filter.status_id = req.query.status;
  const total = await Order.countDocuments(filter);
  const data = await Order.find(filter)
    .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 })
    .populate('consumer_id', 'name email phone')
    .populate('status_id');
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data: data.map(transformOrder) });
});

// POST /order — create new order
router.post('/', auth, async (req, res) => {
  // If _method override sent us here for a PUT, handle update instead
  if (req.body && req.body.order_status_id !== undefined) {
    return handleStatusUpdate(req, res);
  }

  const { billing_address, shipping_address, payment_method, coupon_total_discount = 0, shipping_total = 0, notes } = req.body;
  const cartItems = await Cart.find({ consumer_id: req.user._id }).populate('product_id');
  if (!cartItems.length) return res.status(422).json({ message: 'Cart is empty' });

  const products = cartItems.map(i => ({
    product_id: i.product_id._id,
    variation_id: i.variation_id,
    name: i.product_id.name,
    quantity: i.quantity,
    price: i.product_id.sale_price || i.product_id.price,
    sub_total: i.sub_total,
  }));

  const amount = cartItems.reduce((s, i) => s + i.sub_total, 0);
  const total = amount - coupon_total_discount + shipping_total;
  const pendingStatus = await OrderStatus.findOne({ slug: 'pending' });

  const order = await Order.create({
    consumer_id: req.user._id,
    products,
    billing_address,
    shipping_address,
    payment_method: payment_method || 'cod',
    payment_status: 'pending',
    amount,
    coupon_total_discount,
    shipping_total,
    total,
    status_id: pendingStatus?._id,
    notes,
  });

  await Cart.deleteMany({ consumer_id: req.user._id });
  const populated = await Order.findById(order._id).populate('consumer_id', 'name email phone').populate('status_id');
  res.status(201).json(transformOrder(populated));
});

// GET /order/:id
router.get('/:id', auth, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('consumer_id', 'name email phone')
    .populate('status_id');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const isAdmin = req.user.role?.name === 'admin';
  if (!isAdmin && order.consumer_id._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(transformOrder(order));
});

// PUT /order/:id  — update order status (admin)
// Also reached via POST + _method:put from admin dashboard
router.put('/:id', auth, async (req, res) => {
  await handleStatusUpdate(req, res);
});

async function handleStatusUpdate(req, res) {
  const orderId = req.params.id;
  const { order_status_id, note, changed_at } = req.body;

  if (!orderId) return res.status(422).json({ message: 'Order ID required' });

  let statusId = order_status_id;
  // order_status_id can be an object { id, name } or a plain ID
  if (typeof order_status_id === 'object' && order_status_id?.id) {
    statusId = order_status_id.id;
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status_id: statusId },
    { new: true }
  ).populate('consumer_id', 'name email phone').populate('status_id');

  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(transformOrder(order));
}

module.exports = router;
