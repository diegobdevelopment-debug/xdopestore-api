const router = require('express').Router();
const slugify = require('slugify');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { transformCategory } = require('../utils/transform');

const OBJECT_ID_FIELDS = ['parent_id', 'category_image_id', 'category_icon_id', 'category_meta_image_id'];
const sanitizeCategoryBody = (body) => {
  const clean = { ...body };
  for (const key of OBJECT_ID_FIELDS) {
    // Check if any of those specific ID fields were sent as an empty string.
    // If the condition is met, set the value to null.
    if (clean[key] === '' || clean[key] === undefined) clean[key] = null;
  }
  return clean;
};

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = {};
  if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
  if (req.query.status !== undefined) filter.status = req.query.status;
  const total = await Category.countDocuments(filter);
  const data = await Category.find(filter)
    .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 })
    .populate('parent_id', 'name')
    .populate('category_image_id', 'asset_url original_url')
    .populate('category_icon_id', 'asset_url original_url');
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data: data.map(transformCategory) });
});

router.get('/:id', async (req, res) => {
  const cat = await Category.findById(req.params.id)
    .populate('parent_id').populate('category_image_id').populate('category_icon_id');
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(transformCategory(cat));
});

router.post('/', auth, adminOnly, async (req, res) => {
  const body = sanitizeCategoryBody(req.body);
  if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true, strict: true });
  const cat = await Category.create({ ...body, created_by_id: req.user._id });
  res.status(201).json(cat);
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const body = sanitizeCategoryBody(req.body);
  const cat = await Category.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
