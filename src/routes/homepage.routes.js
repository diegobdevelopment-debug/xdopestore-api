const router = require('express').Router();
const Homepage = require('../models/Homepage');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /homepage/config
router.get('/config', async (req, res) => {
  const pages = await Homepage.find().sort({ updatedAt: -1 });
  res.json({ data: pages });
});

// GET /homepage/config/:slug
router.get('/config/:slug', async (req, res) => {
  const page = await Homepage.findOne({ slug: req.params.slug });
  if (!page) return res.status(404).json({ message: 'Homepage config not found' });
  res.json(page);
});

// PUT /homepage/config  — admin only
router.put('/config', auth, adminOnly, async (req, res) => {
  const { slug = 'default', config } = req.body;
  const page = await Homepage.findOneAndUpdate(
    { slug },
    { config },
    { new: true, upsert: true }
  );
  res.json(page);
});

// DELETE /homepage/config
router.delete('/config', auth, adminOnly, async (req, res) => {
  await Homepage.deleteMany({});
  res.json({ message: 'All homepage configs deleted' });
});

module.exports = router;
