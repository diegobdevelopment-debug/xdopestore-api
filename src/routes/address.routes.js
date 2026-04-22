const router = require('express').Router();
const Address = require('../models/Address');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const data = await Address.find({ user_id: req.user._id }).sort({ is_default: -1, createdAt: -1 });
  res.json({ data });
});

router.get('/:id', auth, async (req, res) => {
  const addr = await Address.findOne({ _id: req.params.id, user_id: req.user._id });
  if (!addr) return res.status(404).json({ message: 'Address not found' });
  res.json(addr);
});

router.post('/', auth, async (req, res) => {
  if (req.body.is_default) {
    await Address.updateMany({ user_id: req.user._id }, { is_default: false });
  }
  const addr = await Address.create({ ...req.body, user_id: req.user._id });
  res.status(201).json(addr);
});

router.put('/:id', auth, async (req, res) => {
  if (req.body.is_default) {
    await Address.updateMany({ user_id: req.user._id }, { is_default: false });
  }
  const addr = await Address.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    req.body,
    { new: true }
  );
  if (!addr) return res.status(404).json({ message: 'Address not found' });
  res.json(addr);
});

router.delete('/:id', auth, async (req, res) => {
  await Address.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
  res.json({ message: 'Address deleted' });
});

module.exports = router;
