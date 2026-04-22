const router = require('express').Router();
const Role = require('../models/Role');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', async (req, res) => {
  const roles = await Role.find().sort({ createdAt: 1 });
  res.json({ data: roles });
});

router.get('/:id', async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });
  res.json(role);
});

router.post('/', auth, adminOnly, async (req, res) => {
  const role = await Role.create(req.body);
  res.status(201).json(role);
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(role);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Role.findByIdAndDelete(req.params.id);
  res.json({ message: 'Role deleted' });
});

module.exports = router;
