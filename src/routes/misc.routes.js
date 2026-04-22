// Misc routes — stubs + real implementations for Tax, ThemeOptions and Tag
const router = require('express').Router();
const slugify = require('slugify');
const Order = require('../models/Order');
const Tax = require('../models/Tax');
const Tag = require('../models/Tag');
const ThemeOption = require('../models/ThemeOption');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const emptyList = (req, res) => res.json({ current_page: 1, last_page: 1, total: 0, per_page: 15, data: [] });
const emptyData = (req, res) => res.json({ data: [] });
const ok = (req, res) => res.json({ message: 'ok' });

// GET /country — static list (used by address/checkout forms)
router.get('/country', async (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'United States', sortname: 'US', phone_code: '1' },
      { id: 2, name: 'United Kingdom', sortname: 'GB', phone_code: '44' },
      { id: 3, name: 'Canada', sortname: 'CA', phone_code: '1' },
      { id: 4, name: 'Australia', sortname: 'AU', phone_code: '61' },
      { id: 5, name: 'Germany', sortname: 'DE', phone_code: '49' },
      { id: 6, name: 'France', sortname: 'FR', phone_code: '33' },
      { id: 7, name: 'India', sortname: 'IN', phone_code: '91' },
      { id: 8, name: 'Brazil', sortname: 'BR', phone_code: '55' },
      { id: 9, name: 'Mexico', sortname: 'MX', phone_code: '52' },
      { id: 10, name: 'Japan', sortname: 'JP', phone_code: '81' },
    ],
  });
});

// GET /state — filtered by country_id
router.get('/state', async (req, res) => {
  res.json({ data: [] });
});

// GET /themeOptions
router.get('/themeOptions', async (req, res) => {
  let doc = await ThemeOption.findOne();
  if (!doc) doc = await ThemeOption.create({ options: {} });
  res.json({ id: doc._id, options: doc.options });
});
// PUT /themeOptions
router.put('/themeOptions', auth, adminOnly, async (req, res) => {
  const incoming = req.body.options || {};
  let doc = await ThemeOption.findOne();
  if (!doc) {
    doc = await ThemeOption.create({ options: incoming });
  } else {
    doc.options = incoming;
    doc.markModified('options');
    await doc.save();
  }
  res.json({ id: doc._id, options: doc.options });
});

// GET /theme
router.get('/theme', (req, res) => res.json({ current_page: 1, last_page: 1, total: 1, per_page: 15, data: [{ id: '1', _id: '1', name: 'Fashion One', slug: 'fashion_one', status: 1 }] }));
router.put('/theme/:id?', ok);

// Tag CRUD
router.get('/tag', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = {};
  if (req.query.status !== undefined && req.query.status !== '') filter.status = Number(req.query.status);
  if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
  if (req.query.type) filter.type = req.query.type;
  const total = await Tag.countDocuments(filter);
  const data = await Tag.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data });
});
router.get('/tag/:id', async (req, res) => {
  const tag = await Tag.findById(req.params.id);
  if (!tag) return res.status(404).json({ message: 'Tag not found' });
  res.json(tag);
});
router.post('/tag', auth, adminOnly, async (req, res) => {
  const body = req.body;
  if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true, strict: true });
  const tag = await Tag.create(body);
  res.status(201).json(tag);
});
router.put('/tag/:id', auth, adminOnly, async (req, res) => {
  const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tag) return res.status(404).json({ message: 'Tag not found' });
  res.json(tag);
});
router.delete('/tag/:id', auth, adminOnly, async (req, res) => {
  await Tag.findByIdAndDelete(req.params.id);
  res.json({ message: 'Tag deleted' });
});

// GET /currency
router.get('/currency', async (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'US Dollar', code: 'USD', symbol: '$' },
      { id: 2, name: 'Euro', code: 'EUR', symbol: '€' },
      { id: 3, name: 'British Pound', code: 'GBP', symbol: '£' },
    ],
  });
});

// Tax CRUD
router.get('/tax', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = {};
  if (req.query.status !== undefined) filter.status = Number(req.query.status);
  if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
  const total = await Tax.countDocuments(filter);
  const data = await Tax.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data });
});
router.get('/tax/:id', async (req, res) => {
  const t = await Tax.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Tax not found' });
  res.json(t);
});
router.post('/tax', auth, adminOnly, async (req, res) => {
  const t = await Tax.create(req.body);
  res.status(201).json(t);
});
router.put('/tax/:id', auth, adminOnly, async (req, res) => {
  const t = await Tax.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!t) return res.status(404).json({ message: 'Tax not found' });
  res.json(t);
});
router.delete('/tax/:id', auth, adminOnly, async (req, res) => {
  await Tax.findByIdAndDelete(req.params.id);
  res.json({ message: 'Tax deleted' });
});

// GET /store
router.get('/store', emptyList);
router.get('/store/:id', async (req, res) => res.json({}));
router.post('/store', ok);
router.put('/store/:id', ok);

// GET /page
router.get('/page', emptyList);
router.get('/page/:id', async (req, res) => res.json({}));
router.post('/page', ok);
router.put('/page/:id', ok);
router.delete('/page/:id', ok);

// GET /faq
router.get('/faq', emptyList);
router.post('/faq', ok);
router.put('/faq/:id', ok);
router.delete('/faq/:id', ok);

// GET /question-and-answer
router.get('/question-and-answer', emptyList);
router.post('/question-and-answer', ok);
router.post('/question-and-answer/feedback', ok);

// GET /menu
router.get('/menu', async (req, res) => {
  res.json({
    data: [
      { id: 1, title: 'Home', path: '/', class: '0' },
      { id: 2, title: 'Shop', path: '/collections', class: '0' },
      { id: 3, title: 'About Us', path: '/about-us', class: '0' },
      { id: 4, title: 'Contact', path: '/contact-us', class: '0' },
    ],
  });
});
router.post('/menu', ok);
router.put('/menu/sort', ok);
router.put('/menu/:id', ok);
router.delete('/menu/:id', ok);

// GET /subscribe
router.post('/subscribe', ok);

// GET /notice
router.get('/notice', emptyList);
router.get('/notice/recent', emptyData);
router.put('/notice/markAsRead', ok);

// GET /contact-us
router.post('/contact-us', ok);

// GET /commissionHistory
router.get('/commissionHistory', emptyList);

// GET /paymentAccount
router.get('/paymentAccount', emptyList);
router.post('/paymentAccount', ok);
router.put('/paymentAccount/:id', ok);
router.delete('/paymentAccount/:id', ok);

// GET /withdrawRequest
router.get('/withdrawRequest', emptyList);
router.post('/withdrawRequest', ok);

// GET /refund
router.get('/refund', emptyList);
router.post('/refund', ok);
router.put('/refund/:id', ok);

// GET /badge — counts for admin dashboard notification badges
router.get('/badge', auth, async (req, res) => {
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const [unapprovedProducts, pendingOrders] = await Promise.all([
    Product.countDocuments({ is_approved: false }),
    Order.countDocuments({ payment_status: 'pending' }),
  ]);
  res.json({
    data: {
      product: { total_in_approved_products: unapprovedProducts },
      store: { total_in_approved_stores: 0 },
      refund: { total_pending_refunds: 0 },
      withdraw_request: { total_pending_withdraw_requests: 0 },
    },
  });
});

// GET /points/consumer
router.get('/points/consumer', auth, async (req, res) => res.json({ data: { balance: 0, transactions: [] } }));
router.post('/credit/points', ok);
router.post('/debit/points', ok);

// Vendor wallet stubs
router.get('/wallet/vendor', ok);
router.post('/credit/vendorWallet', ok);
router.post('/debit/vendorWallet', ok);

// Payment stubs
router.post('/verifyPayment', ok);
router.post('/rePayment', ok);

// GET /module — permission modules list for role creation form
router.get('/module', auth, async (req, res) => {
  const { getModuleList } = require('../data/permissions');
  res.json({ data: getModuleList() });
});

// GET /license-key
router.get('/license-key', async (req, res) => res.json({ data: { status: 'active' } }));

// GET /app/settings
router.get('/app/settings', async (req, res) => res.json({ data: {} }));

// GET /trackOrder
router.get('/trackOrder', auth, async (req, res) => {
  const { order_number } = req.query;
  const order = await Order.findOne({ order_number }).populate('status_id');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// GET /order/invoice/:id
router.get('/order/invoice/:id', auth, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('consumer_id').populate('status_id');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// POST /login/number
router.post('/login/number', async (req, res) => res.status(501).json({ message: 'Phone login not implemented' }));

// GET /updateStoreProfile
router.put('/updateStoreProfile', ok);

// product approve
router.put('/approve/:id', ok);

module.exports = router;
