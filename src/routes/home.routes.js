// /home routes — alias for homepage management used by both frontends
const router = require('express').Router();
const Homepage = require('../models/Homepage');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Build a dynamic homepage content from DB data
async function buildContent() {
  const products = await Product.find({ status: 1 }).limit(20).select('_id');
  const categories = await Category.find({ status: 1 }).limit(6).select('_id');
  const brands = await Brand.find({ status: 1 }).limit(6).select('_id');

  const productIds = products.map(p => p._id.toString());
  const categoryIds = categories.map(c => c._id.toString());
  const brandIds = brands.map(b => b._id.toString());

  return {
    products_ids: productIds,
    home_banner: { status: 0, banners: [] },
    offer_banner: { banner_1: { status: 0 }, banner_2: { status: 0 } },
    products_list: { status: 1, title: 'Featured Products', product_ids: productIds },
    category_product: { status: 1, title: 'Shop by Category', category_ids: categoryIds },
    brands: { brand_ids: brandIds },
    services: { status: 0, banners: [] },
    social_media: { status: 0, banners: [] },
    parallax_banner: { status: 0 },
  };
}

// GET /home  or  GET /home/:slug
router.get('/:slug?', async (req, res) => {
  const slug = req.params.slug || 'default';
  const page = await Homepage.findOne({ slug });
  if (page && page.config && Object.keys(page.config).length > 0) {
    return res.json({ slug, content: page.config, config: page.config });
  }
  // No saved config — build from live DB data
  const content = await buildContent();
  res.json({ slug, content, config: content });
});

// PUT /home
router.put('/', auth, adminOnly, async (req, res) => {
  const { slug = 'default', config } = req.body;
  const page = await Homepage.findOneAndUpdate({ slug }, { config }, { new: true, upsert: true });
  res.json(page);
});

module.exports = router;
