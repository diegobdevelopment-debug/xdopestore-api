const router = require('express').Router();
const slugify = require('slugify');
const Brand = require('../models/Brand');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { transformBrand } = require('../utils/transform');

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = {};
  if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
  const total = await Brand.countDocuments(filter);
  const data = await Brand.find(filter)
    .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 })
    .populate('brand_image_id', 'asset_url original_url');
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data: data.map(transformBrand) });
});

router.get('/:id', async (req, res) => {
  const brand = await Brand.findById(req.params.id).populate('brand_image_id');
  if (!brand) return res.status(404).json({ message: 'Brand not found' });
  res.json(transformBrand(brand));
});

router.post('/', auth, adminOnly, async (req, res) => {
  const body = req.body;
  if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true, strict: true });
  const brand = await Brand.create({ ...body, created_by_id: req.user._id });
  res.status(201).json(brand);
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!brand) return res.status(404).json({ message: 'Brand not found' });
  res.json(brand);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.json({ message: 'Brand deleted' });
});

module.exports = router;
