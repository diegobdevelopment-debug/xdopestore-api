const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = { notifiable_id: req.user._id };
  const total = await Notification.countDocuments(filter);
  const data = await Notification.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data });
});

router.put('/markAsRead', auth, async (req, res) => {
  await Notification.updateMany({ notifiable_id: req.user._id, read_at: null }, { read_at: new Date() });
  res.json({ message: 'All notifications marked as read' });
});

module.exports = router;
