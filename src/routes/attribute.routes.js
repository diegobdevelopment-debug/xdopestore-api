const router = require('express').Router();
const slugify = require('slugify');
const Attribute = require('../models/Attribute');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { transformAttribute } = require('../utils/transform');

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = {};
  if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
  const total = await Attribute.countDocuments(filter);
  const data = await Attribute.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data: data.map(transformAttribute) });
});

router.get('/:id', async (req, res) => {
  const attr = await Attribute.findById(req.params.id);
  if (!attr) return res.status(404).json({ message: 'Attribute not found' });
  res.json(transformAttribute(attr));
});

router.post('/', auth, adminOnly, async (req, res) => {
  const body = req.body;
  if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true, strict: true });
  const rawValues = body.attribute_values || body.value;
  if (rawValues) {
    body.attribute_values = rawValues.map(v => ({
      ...v,
      slug: v.slug || slugify(v.value, { lower: true, strict: true }),
    }));
  }
  delete body.value;
  const attr = await Attribute.create({ ...body, created_by_id: req.user._id });
  res.status(201).json(transformAttribute(attr));
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const body = req.body;
  const rawValues = body.attribute_values || body.value;
  if (rawValues) {
    body.attribute_values = rawValues.map(v => ({
      ...v,
      slug: v.slug || slugify(v.value || '', { lower: true, strict: true }),
    }));
  }
  delete body.value;
  const attr = await Attribute.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!attr) return res.status(404).json({ message: 'Attribute not found' });
  res.json(transformAttribute(attr));
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Attribute.findByIdAndDelete(req.params.id);
  res.json({ message: 'Attribute deleted' });
});

module.exports = router;
