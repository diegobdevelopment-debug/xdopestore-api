const router = require('express').Router();
const mongoose = require('mongoose');
const slugify = require('slugify');
const Product = require('../models/Product');
const Attribute = require('../models/Attribute');
const Review = require('../models/Review');
const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { transformProduct } = require('../utils/transform');

// When attributes_ids is empty, look up Attribute docs by the variation attribute_value IDs
async function resolveAttributesFromVariations(product) {
  const obj = product.toJSON ? product.toJSON() : product;
  const hasAttributes = Array.isArray(obj.attributes_ids) && obj.attributes_ids.length > 0 && obj.attributes_ids[0]?.name;
  if (hasAttributes) return product;

  const avIds = new Set();
  (obj.variations || []).forEach(v => (v.attribute_values || []).forEach(av => {
    const id = av.id || av._id;
    if (id) avIds.add(String(id));
  }));
  if (!avIds.size) return product;

  const objectIds = Array.from(avIds).map(id => new mongoose.Types.ObjectId(id));
  const attrs = await Attribute.find({ 'attribute_values._id': { $in: objectIds } });
  if (attrs.length) {
    // Inject populated attributes into the product object so transformProduct can use them
    const raw = product.toJSON ? product.toJSON() : { ...product };
    raw.attributes_ids = attrs;
    return raw;
  }
  return product;
}

function paginate(query, req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 15;
  return { page, limit, skip: (page - 1) * limit };
}

function buildFilter(query) {
  const filter = {};
  if (query.search) filter.name = new RegExp(query.search, 'i');
  if (query.status !== undefined) filter.status = Number(query.status);
  if (query.category) filter.categories = query.category;
  if (query.category_ids) {
    const ids = String(query.category_ids).split(',').map(id => id.trim()).filter(Boolean);
    filter.categories = { $in: ids };
  }
  if (query.brand) filter.brand_id = query.brand;
  if (query.is_featured) filter.is_featured = query.is_featured === 'true';
  if (query.is_trending) filter.is_trending = query.is_trending === 'true';
  if (query.ids) filter._id = { $in: query.ids.split(',').map(id => id.trim()).filter(Boolean) };
  return filter;
}

// Fetch review stats and inject into product object
async function attachReviews(product, userId) {
  const reviews = await Review.find({ product_id: product._id })
    .populate('consumer_id', 'name profile_image_id')
    .sort({ createdAt: -1 });

  const reviews_count = reviews.length;
  const rating_count = reviews_count
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews_count
    : 0;

  // Array of 5 slots (index 0 = 1-star count)
  const review_ratings = [0, 0, 0, 0, 0];
  reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) review_ratings[r.rating - 1]++; });

  let hasPurchased = false;
  if (userId) {
    const delivered = await OrderStatus.findOne({ slug: 'delivered' });
    hasPurchased = !!(await Order.findOne({
      consumer_id: userId,
      'products.product_id': product._id,
      status_id: delivered?._id,
    }));
  }
  const can_review = hasPurchased && !reviews.some(r => r.consumer_id?._id?.toString() === userId?.toString());

  const user_review = userId
    ? reviews.find(r => r.consumer_id?._id?.toString() === userId.toString()) || null
    : null;

  const obj = product.toJSON ? product.toJSON() : product;
  return {
    ...obj,
    reviews_count,
    rating_count,
    review_ratings,
    can_review,
    user_review,
    reviews: reviews.map(r => ({
      id: r._id,
      rating: r.rating,
      description: r.description,
      consumer: r.consumer_id ? { name: r.consumer_id.name } : { name: 'Anonymous' },
      created_at: r.createdAt,
    })),
  };
}

// GET /product/minify/list  — must be before /:id
router.get('/minify/list', async (req, res) => {
  const products = await Product.find({ status: 1 })
    .select('name slug price sale_price product_thumbnail_id')
    .populate('product_thumbnail_id', 'asset_url original_url')
    .limit(100);
  res.json({ data: products });
});

// GET /product/slug/:slug  — for metadata (called by page.js)
router.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('brand_id')
    .populate('categories')
    .populate('product_thumbnail_id')
    .populate('size_chart_image_id')
    .populate('product_images')
    .populate('tax_id');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const userId = req.user?._id;
  const enriched = await attachReviews(product, userId);
  res.json(transformProduct(enriched));
});

// GET /product
router.get('/', async (req, res) => {
  const { page, limit, skip } = paginate(req.query, req);
  const filter = buildFilter(req.query);
  const [total, data] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .skip(skip).limit(limit)
      .sort({ createdAt: -1 })
      .populate('brand_id', 'name slug')
      .populate('categories', 'name slug')
      .populate('product_thumbnail_id', 'asset_url original_url')
      .populate('product_images', 'asset_url original_url'),
  ]);
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data: data.map(transformProduct) });
});

// GET /product/:idOrSlug
router.get('/:id', async (req, res) => {
  const param = req.params.id;
  const isObjectId = mongoose.Types.ObjectId.isValid(param) && param.length === 24;
  const query = isObjectId ? { _id: param } : { slug: param };

  const product = await Product.findOne(query)
    .populate('brand_id')
    .populate('categories')
    .populate('product_thumbnail_id')
    .populate('size_chart_image_id')
    .populate('product_images')
    .populate('tax_id')
    .populate('attributes_ids')
    .populate('variations.variation_images');
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const userId = req.user?._id;
  const enriched = await attachReviews(product, userId);
  const resolved = await resolveAttributesFromVariations(enriched);
  res.json(transformProduct(resolved));
});

function normalizeProductBody(body) {
  if (body.product_galleries_id !== undefined) {
    const ids = Array.isArray(body.product_galleries_id)
      ? body.product_galleries_id
      : Object.values(body.product_galleries_id || {});
    body.product_images = ids.filter(Boolean);
    delete body.product_galleries_id;
  }
  if (body.product_thumbnail_id === undefined && body.product_thumbnail?.id) {
    body.product_thumbnail_id = body.product_thumbnail.id;
  }
  // Normalize variation images
  if (Array.isArray(body.variations)) {
    body.variations = body.variations.map((v) => {
      if (v.variation_images_id !== undefined) {
        const ids = Array.isArray(v.variation_images_id)
          ? v.variation_images_id
          : Object.values(v.variation_images_id || {});
        v.variation_images = ids.filter(Boolean);
        delete v.variation_images_id;
      }
      return v;
    });
  }
  return body;
}

// POST /product
router.post('/', auth, adminOnly, async (req, res) => {
  const body = normalizeProductBody(req.body);
  if (!body.slug && body.name) body.slug = slugify(body.name, { lower: true, strict: true });
  const product = await Product.create({ ...body, created_by_id: req.user._id });
  res.status(201).json(product);
});

// PUT /product/:id
router.put('/:id', auth, adminOnly, async (req, res) => {
  const body = normalizeProductBody(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// DELETE /product/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

module.exports = router;
