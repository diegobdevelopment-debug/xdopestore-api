const router = require('express').Router();
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const auth = require('../middleware/auth');

// POST /checkout  — returns totals summary (does not create order)
router.post('/', auth, async (req, res) => {
  const { coupon_code, shipping_id } = req.body;
  const cartItems = await Cart.find({ consumer_id: req.user._id }).populate('product_id');
  if (!cartItems.length) return res.status(422).json({ message: 'Cart is empty' });

  let subtotal = cartItems.reduce((sum, i) => sum + i.sub_total, 0);
  let discount = 0;

  if (coupon_code) {
    const coupon = await Coupon.findOne({ code: coupon_code.toUpperCase(), status: 1 });
    if (!coupon) return res.status(422).json({ message: 'Invalid coupon code' });
    const now = new Date();
    if (coupon.start_date && coupon.start_date > now) return res.status(422).json({ message: 'Coupon not yet active' });
    if (coupon.end_date && coupon.end_date < now) return res.status(422).json({ message: 'Coupon expired' });
    if (subtotal < coupon.min_spend) return res.status(422).json({ message: `Minimum spend $${coupon.min_spend} required` });
    discount = coupon.type === 'percentage' ? (subtotal * coupon.amount) / 100 : coupon.amount;
  }

  const shipping_total = 0; // free shipping for local dev
  const total = subtotal - discount + shipping_total;

  res.json({
    sub_total: subtotal,
    coupon_total_discount: discount,
    shipping_total,
    total,
    cart: cartItems,
  });
});

module.exports = router;
