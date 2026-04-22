const router = require('express').Router();
const slugify = require('slugify');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { transformBlog } = require('../utils/transform');

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  const filter = {};
  if (req.query.search) filter.title = new RegExp(req.query.search, 'i');
  const total = await Blog.countDocuments(filter);
  const data = await Blog.find(filter)
    .skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 })
    .populate('blog_thumbnail_id', 'asset_url original_url')
    .populate('categories', 'name');
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data: data.map(transformBlog) });
});

router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('blog_thumbnail_id').populate('categories');
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.json(transformBlog(blog));
});

router.post('/', auth, adminOnly, async (req, res) => {
  const body = req.body;
  if (!body.slug && body.title) body.slug = slugify(body.title, { lower: true, strict: true });
  const blog = await Blog.create({ ...body, created_by_id: req.user._id });
  res.status(201).json(blog);
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.json(blog);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Blog deleted' });
});

module.exports = router;
