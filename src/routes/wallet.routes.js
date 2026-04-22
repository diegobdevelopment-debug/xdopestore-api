const router = require('express').Router();
const Wallet = require('../models/Wallet');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /wallet/consumer
router.get('/wallet/consumer', auth, async (req, res) => {
  let wallet = await Wallet.findOne({ consumer_id: req.user._id });
  if (!wallet) wallet = await Wallet.create({ consumer_id: req.user._id });
  res.json(wallet);
});

// POST /credit/wallet
router.post('/credit/wallet', auth, adminOnly, async (req, res) => {
  const { consumer_id, amount, description } = req.body;
  let wallet = await Wallet.findOne({ consumer_id });
  if (!wallet) wallet = await Wallet.create({ consumer_id });
  wallet.balance += Number(amount);
  wallet.transactions.push({ type: 'credit', amount, description });
  await wallet.save();
  res.json(wallet);
});

// POST /debit/wallet
router.post('/debit/wallet', auth, adminOnly, async (req, res) => {
  const { consumer_id, amount, description } = req.body;
  let wallet = await Wallet.findOne({ consumer_id });
  if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
  if (wallet.balance < amount) return res.status(422).json({ message: 'Insufficient balance' });
  wallet.balance -= Number(amount);
  wallet.transactions.push({ type: 'debit', amount, description });
  await wallet.save();
  res.json(wallet);
});

module.exports = router;
