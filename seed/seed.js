require('dotenv').config({ path: require('path').join(__dirname, '../src/.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

// Models
const Role = require('../src/models/Role');
const User = require('../src/models/User');
const Attachment = require('../src/models/Attachment');
const Category = require('../src/models/Category');
const Brand = require('../src/models/Brand');
const Attribute = require('../src/models/Attribute');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const OrderStatus = require('../src/models/OrderStatus');
const Order = require('../src/models/Order');
const Coupon = require('../src/models/Coupon');
const Shipping = require('../src/models/Shipping');
const Blog = require('../src/models/Blog');
const Review = require('../src/models/Review');
const Wishlist = require('../src/models/Wishlist');
const Wallet = require('../src/models/Wallet');
const Setting = require('../src/models/Setting');
const Notification = require('../src/models/Notification');
const Homepage = require('../src/models/Homepage');

const sl = (str) => slugify(str, { lower: true, strict: true });

// Picsum Photos — seed-based URLs are stable (same seed = same image always)
function img(seed, w = 600, h = 600) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Drop all
  const collections = Object.values(mongoose.connection.collections);
  for (const col of collections) {
    await col.deleteMany({});
  }
  console.log('Collections cleared');

  // 1. Roles
  const [adminRole, consumerRole] = await Role.insertMany([
    { name: 'admin', system_reserve: '1' },
    { name: 'consumer', system_reserve: '0' },
  ]);

  // 2. Order Statuses
  const statusNames = [
    { name: 'Pending', slug: 'pending', sequence: 1, color: '#f59e0b', system_reserve: '1' },
    { name: 'Processing', slug: 'processing', sequence: 2, color: '#3b82f6', system_reserve: '0' },
    { name: 'Shipped', slug: 'shipped', sequence: 3, color: '#8b5cf6', system_reserve: '0' },
    { name: 'Out for Delivery', slug: 'out_for_delivery', sequence: 4, color: '#06b6d4', system_reserve: '0' },
    { name: 'Delivered', slug: 'delivered', sequence: 5, color: '#10b981', system_reserve: '1' },
    { name: 'Cancelled', slug: 'cancelled', sequence: 6, color: '#ef4444', system_reserve: '1' },
  ];
  const orderStatuses = await OrderStatus.insertMany(statusNames);
  const pendingStatus = orderStatuses.find(s => s.slug === 'pending');

  // 3. Settings
  await Setting.create({
    values: {
      general: {
        site_name: 'xdope Store',
        site_tagline: 'Shop the best products',
        site_title: 'xdope Store',
        site_currency: 'USD',
        site_currency_symbol: '$',
        site_currency_symbol_position: 'prefix',
        site_default_language: 'en',
        mode: 'light-only',
        admin_site_language_direction: 'ltr',
        copyright: '© 2026 xdope Store',
        default_currency: {
          name: 'US Dollar',
          code: 'USD',
          symbol: '$',
          symbol_position: 'before_price',
          exchange_rate: 1,
        },
      },
      activation: {
        guest_checkout: true,
        maintenance_mode: false,
        product_approved: true,
        multivendor: false,
      },
      maintenance: {
        maintenance_mode: false,
        maintenance_message: 'Site is under maintenance.',
      },
      delivery: {
        estimated_delivery_text: '3-5 business days',
      },
    },
  });

  // 4. Admin user
  const adminUser = await User.create({
    name: 'Super Admin',
    email: process.env.ADMIN_EMAIL || 'admin@xdope.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: adminRole._id,
    status: 1,
    system_reserve: '1',
    email_verified_at: new Date(),
  });
  console.log('Admin user:', adminUser.email);

  // 5. Category images (Attachments)
  const catImageSeeds = ['fashion-men', 'fashion-women', 'electronics', 'home-living', 'sports'];
  const catImages = await Attachment.insertMany(
    catImageSeeds.map(seed => ({
      name: `${seed}.jpg`,
      file_name: `${seed}.jpg`,
      mime_type: 'image/jpeg',
      original_url: img(seed, 400, 400),
      asset_url: img(seed, 400, 400),
    }))
  );

  // 6. Categories
  const categoryData = [
    { name: "Men's Fashion", type: 'product', img: catImages[0] },
    { name: "Women's Fashion", type: 'product', img: catImages[1] },
    { name: 'Electronics', type: 'product', img: catImages[2] },
    { name: 'Home & Living', type: 'product', img: catImages[3] },
    { name: 'Sports & Outdoors', type: 'product', img: catImages[4] },
  ];
  const categories = await Category.insertMany(
    categoryData.map(c => ({
      name: c.name,
      slug: sl(c.name),
      type: c.type,
      status: 1,
      category_image_id: c.img._id,
    }))
  );

  // 7. Brand images
  const brandImageSeeds = ['nike', 'adidas', 'samsung', 'apple', 'zara'];
  const brandImages = await Attachment.insertMany(
    brandImageSeeds.map(seed => ({
      name: `${seed}-logo.jpg`,
      file_name: `${seed}-logo.jpg`,
      mime_type: 'image/jpeg',
      original_url: img(seed + '-logo', 200, 200),
      asset_url: img(seed + '-logo', 200, 200),
    }))
  );

  // 8. Brands
  const brandData = ['Nike', 'Adidas', 'Samsung', 'Apple', 'Zara'];
  const brands = await Brand.insertMany(
    brandData.map((b, i) => ({
      name: b,
      slug: sl(b),
      status: 1,
      brand_image_id: brandImages[i]._id,
    }))
  );

  // 9. Attributes
  await Attribute.insertMany([
    {
      name: 'Color',
      slug: 'color',
      style: 'circle',
      status: 1,
      attribute_values: [
        { value: 'Red', hex_color: '#ef4444', slug: 'red' },
        { value: 'Blue', hex_color: '#3b82f6', slug: 'blue' },
        { value: 'Black', hex_color: '#111827', slug: 'black' },
        { value: 'White', hex_color: '#f9fafb', slug: 'white' },
      ],
    },
    {
      name: 'Size',
      slug: 'size',
      style: 'rectangle',
      status: 1,
      attribute_values: [
        { value: 'XS', slug: 'xs' },
        { value: 'S', slug: 's' },
        { value: 'M', slug: 'm' },
        { value: 'L', slug: 'l' },
        { value: 'XL', slug: 'xl' },
      ],
    },
  ]);

  // 10. Product images (thumbnail + 4 gallery images each)
  const productDefs = [
    {
      name: 'Classic White Sneakers',
      price: 89.99, sale_price: 69.99, discount: 22,
      quantity: 50, sku: 'SNK-001',
      cats: [0, 1], brand: 0,
      is_featured: true, is_trending: true,
      imgSeed: 'sneakers',
      description: '<p>Premium white sneakers crafted for everyday comfort and style. Made with breathable mesh upper and responsive cushioning sole. Perfect for casual outings, light workouts, or just looking great.</p><ul><li>Breathable mesh upper</li><li>Lightweight EVA midsole</li><li>Non-slip rubber outsole</li><li>True to size fit</li></ul>',
      short_description: 'Classic white sneakers, perfect for all occasions. Breathable and lightweight.',
      unit: 'pair',
      estimated_delivery_text: '3-5 business days',
      return_policy_text: '30-day hassle-free returns. Product must be unworn.',
    },
    {
      name: 'Black Running Shoes',
      price: 120.00, sale_price: 95.00, discount: 21,
      quantity: 30, sku: 'RUN-002',
      cats: [0, 4], brand: 1,
      is_featured: true,
      imgSeed: 'running-shoes',
      description: '<p>High-performance running shoes engineered for serious athletes. Features advanced cushioning technology and breathable construction for optimal performance on any terrain.</p><ul><li>Advanced cushioning system</li><li>Breathable knit upper</li><li>Heel counter for stability</li><li>Durable rubber outsole</li></ul>',
      short_description: 'Professional running shoes with advanced cushioning for serious athletes.',
      unit: 'pair',
      estimated_delivery_text: '2-4 business days',
      return_policy_text: '30-day returns. Must be unworn.',
    },
    {
      name: 'Wireless Bluetooth Headphones',
      price: 199.99, sale_price: 149.99, discount: 25,
      quantity: 20, sku: 'HP-003',
      cats: [2], brand: 2,
      is_featured: true,
      imgSeed: 'headphones',
      description: '<p>Experience crystal-clear audio with our premium wireless headphones. Active noise cancellation blocks out distractions while the 30-hour battery ensures you never miss a beat.</p><ul><li>Active Noise Cancellation (ANC)</li><li>30-hour battery life</li><li>Multi-device pairing</li><li>Foldable design for travel</li><li>Premium 40mm drivers</li></ul>',
      short_description: 'Premium wireless headphones with ANC and 30-hour battery life.',
      unit: 'piece',
      estimated_delivery_text: '1-3 business days',
      return_policy_text: '15-day returns on electronics.',
    },
    {
      name: 'Smart Watch Pro',
      price: 349.99, sale_price: null, discount: null,
      quantity: 15, sku: 'SW-004',
      cats: [2], brand: 3,
      is_trending: true,
      imgSeed: 'smartwatch',
      description: '<p>The Smart Watch Pro redefines wearable technology with comprehensive health monitoring, built-in GPS, and a stunning always-on display. Stay connected and healthy 24/7.</p><ul><li>Heart rate & SpO2 monitoring</li><li>Built-in GPS</li><li>48-hour battery life</li><li>Water resistant (50m)</li><li>Sleep tracking</li></ul>',
      short_description: 'Advanced smartwatch with health monitoring, GPS, and 48-hour battery.',
      unit: 'piece',
      estimated_delivery_text: '2-5 business days',
      return_policy_text: '7-day returns on smart devices.',
    },
    {
      name: "Women's Floral Dress",
      price: 59.99, sale_price: 44.99, discount: 25,
      quantity: 40, sku: 'DRS-005',
      cats: [1], brand: 4,
      is_featured: true,
      imgSeed: 'floral-dress',
      description: '<p>A beautiful floral print summer dress that combines elegance with comfort. The lightweight fabric flows gracefully and the flattering silhouette suits all body types.</p><ul><li>100% lightweight polyester</li><li>Floral print design</li><li>A-line silhouette</li><li>Side zip closure</li><li>Machine washable</li></ul>',
      short_description: 'Elegant floral summer dress in lightweight fabric. Flattering A-line cut.',
      unit: 'piece',
      estimated_delivery_text: '3-5 business days',
      return_policy_text: '30-day returns. Tags must be attached.',
    },
    {
      name: 'Minimalist Wall Clock',
      price: 34.99, sale_price: null, discount: null,
      quantity: 25, sku: 'CLK-006',
      cats: [3], brand: null,
      imgSeed: 'wall-clock',
      description: '<p>A stunning minimalist wall clock that elevates any interior space. The silent quartz movement ensures peace and quiet while the clean design complements modern and contemporary decors.</p><ul><li>Silent quartz movement</li><li>30cm diameter</li><li>Requires 1x AA battery</li><li>Suitable for living room, bedroom, office</li></ul>',
      short_description: 'Silent minimalist wall clock. Modern design for any interior.',
      unit: 'piece',
      estimated_delivery_text: '3-7 business days',
      return_policy_text: '30-day returns.',
    },
    {
      name: 'Yoga Mat Premium',
      price: 49.99, sale_price: 39.99, discount: 20,
      quantity: 35, sku: 'YM-007',
      cats: [4], brand: 1,
      is_trending: true,
      imgSeed: 'yoga-mat',
      description: '<p>Take your practice to the next level with our premium non-slip yoga mat. The 6mm thickness provides excellent cushioning for joints while the textured surface ensures grip in even the most intense sessions.</p><ul><li>6mm extra-thick cushioning</li><li>Non-slip textured surface</li><li>Eco-friendly TPE material</li><li>Includes carrying strap</li><li>183cm x 61cm</li></ul>',
      short_description: '6mm premium non-slip yoga mat with carrying strap. Eco-friendly TPE.',
      unit: 'piece',
      estimated_delivery_text: '3-5 business days',
      return_policy_text: '30-day returns.',
    },
    {
      name: 'Denim Jacket',
      price: 79.99, sale_price: null, discount: null,
      quantity: 20, sku: 'DJ-008',
      cats: [0], brand: 4,
      imgSeed: 'denim-jacket',
      description: '<p>The timeless denim jacket reinvented with a modern slim fit. Crafted from premium heavyweight denim that softens beautifully over time. A wardrobe staple that pairs with everything.</p><ul><li>100% premium cotton denim</li><li>Modern slim fit</li><li>Button closure</li><li>Two chest pockets, two side pockets</li><li>Machine washable</li></ul>',
      short_description: 'Classic modern-fit denim jacket. 100% premium cotton.',
      unit: 'piece',
      estimated_delivery_text: '3-5 business days',
      return_policy_text: '30-day returns. Tags must be attached.',
    },
    {
      name: 'Portable Phone Charger 20000mAh',
      price: 39.99, sale_price: 29.99, discount: 25,
      quantity: 60, sku: 'PC-009',
      cats: [2], brand: null,
      is_featured: true,
      imgSeed: 'power-bank',
      description: '<p>Never run out of battery again with our high-capacity 20000mAh power bank. Featuring dual USB-A ports and USB-C fast charging, it can fully charge most smartphones 4-5 times on a single charge.</p><ul><li>20000mAh capacity</li><li>18W fast charging</li><li>USB-C + dual USB-A ports</li><li>LED battery indicator</li><li>Compact and lightweight</li></ul>',
      short_description: '20000mAh fast-charge power bank. Charges phones 4-5 times.',
      unit: 'piece',
      estimated_delivery_text: '1-3 business days',
      return_policy_text: '15-day returns on electronics.',
    },
    {
      name: 'Ceramic Coffee Mug Set',
      price: 24.99, sale_price: null, discount: null,
      quantity: 45, sku: 'MUG-010',
      cats: [3], brand: null,
      imgSeed: 'coffee-mug',
      description: '<p>Elevate your morning ritual with our handcrafted ceramic coffee mug set. Each mug is individually crafted by artisans and features a comfortable ergonomic handle. Set of 4 mugs in complementary earth tones.</p><ul><li>Set of 4 mugs (300ml each)</li><li>Handcrafted ceramic</li><li>Dishwasher and microwave safe</li><li>Ergonomic handle</li><li>Earth tone color palette</li></ul>',
      short_description: 'Set of 4 handcrafted ceramic mugs. Dishwasher safe.',
      unit: 'set',
      estimated_delivery_text: '5-7 business days',
      return_policy_text: '30-day returns. Damaged items replaced free.',
    },
  ];

  // Create attachments for each product (1 thumbnail + 3 gallery images)
  const productAttachments = [];
  for (const def of productDefs) {
    const thumb = await Attachment.create({
      name: `${def.imgSeed}-thumb.jpg`,
      file_name: `${def.imgSeed}-thumb.jpg`,
      mime_type: 'image/jpeg',
      original_url: img(def.imgSeed, 600, 600),
      asset_url: img(def.imgSeed, 600, 600),
    });
    const gallery = await Attachment.insertMany([
      { name: `${def.imgSeed}-1.jpg`, file_name: `${def.imgSeed}-1.jpg`, mime_type: 'image/jpeg', original_url: img(def.imgSeed + '-a', 600, 600), asset_url: img(def.imgSeed + '-a', 600, 600) },
      { name: `${def.imgSeed}-2.jpg`, file_name: `${def.imgSeed}-2.jpg`, mime_type: 'image/jpeg', original_url: img(def.imgSeed + '-b', 600, 600), asset_url: img(def.imgSeed + '-b', 600, 600) },
      { name: `${def.imgSeed}-3.jpg`, file_name: `${def.imgSeed}-3.jpg`, mime_type: 'image/jpeg', original_url: img(def.imgSeed + '-c', 600, 600), asset_url: img(def.imgSeed + '-c', 600, 600) },
    ]);
    productAttachments.push({ thumb, gallery });
  }

  // Create products with images
  const products = await Product.insertMany(
    productDefs.map((p, i) => ({
      name: p.name,
      slug: sl(p.name),
      price: p.price,
      sale_price: p.sale_price,
      discount: p.discount,
      quantity: p.quantity,
      sku: p.sku,
      categories: p.cats.map(ci => categories[ci]._id),
      brand_id: p.brand !== null ? brands[p.brand]._id : null,
      is_featured: p.is_featured || false,
      is_trending: p.is_trending || false,
      description: p.description,
      short_description: p.short_description,
      unit: p.unit,
      estimated_delivery_text: p.estimated_delivery_text,
      return_policy_text: p.return_policy_text,
      is_return: true,
      is_cod: true,
      status: 1,
      stock_status: p.quantity > 0 ? 'in_stock' : 'out_of_stock',
      product_thumbnail_id: productAttachments[i].thumb._id,
      product_images: productAttachments[i].gallery.map(g => g._id),
      created_by_id: adminUser._id,
    }))
  );
  console.log('Products seeded with images');

  // 11. Consumer user
  const consumerUser = await User.create({
    name: 'John Doe',
    email: 'consumer@xdope.com',
    password: 'Consumer@123',
    role: consumerRole._id,
    status: 1,
    email_verified_at: new Date(),
  });
  await Wallet.create({ consumer_id: consumerUser._id, balance: 50 });

  // 12. Reviews for products
  const reviewData = [
    { product: 0, rating: 5, text: 'These sneakers are absolutely amazing! Super comfortable from day one, no break-in period needed. The white color stays clean easily and they look great with everything.' },
    { product: 0, rating: 4, text: 'Great quality and very stylish. Runs slightly large so I\'d recommend going half a size down. Overall very happy with the purchase.' },
    { product: 1, rating: 5, text: 'Best running shoes I\'ve ever owned. My knee pain has significantly reduced since switching to these. The cushioning is incredible.' },
    { product: 2, rating: 5, text: 'The sound quality is outstanding and the noise cancellation is top notch. Battery life is exactly as advertised. Worth every penny.' },
    { product: 2, rating: 4, text: 'Excellent headphones overall. The ANC works really well. Only minor complaint is they get slightly warm after extended use.' },
    { product: 3, rating: 5, text: 'This smartwatch has completely changed how I track my health. The GPS is accurate and the sleep tracking insights are genuinely useful.' },
    { product: 4, rating: 5, text: 'The dress is even more beautiful in person! The fabric is lightweight and flows perfectly. I got so many compliments at the wedding.' },
    { product: 4, rating: 3, text: 'Pretty dress but runs small. Ordered my usual size and it was tight. Quality of fabric is nice though.' },
    { product: 6, rating: 5, text: 'Best yoga mat I\'ve ever used. The grip is excellent even when sweaty. The thickness is perfect for my knees during floor poses.' },
    { product: 8, rating: 5, text: 'Charged my phone 4 times on a single charge during my camping trip. Compact and fast charging. Exactly what I needed.' },
  ];

  await Review.insertMany(
    reviewData.map(r => ({
      product_id: products[r.product]._id,
      consumer_id: consumerUser._id,
      rating: r.rating,
      description: r.text,
    }))
  );
  console.log('Reviews seeded');

  // 13. Cart, Orders, Wishlist
  await Cart.insertMany([
    { consumer_id: consumerUser._id, product_id: products[0]._id, quantity: 2, sub_total: (products[0].sale_price || products[0].price) * 2 },
    { consumer_id: consumerUser._id, product_id: products[2]._id, quantity: 1, sub_total: products[2].sale_price || products[2].price },
  ]);

  const sampleAddress = { title: 'Home', street: '123 Main St', city: 'New York', state: 'NY', pincode: '10001', country: 'United States', phone: '+1234567890' };
  await Order.insertMany([
    {
      order_number: 1001,
      consumer_id: consumerUser._id,
      products: [{ product_id: products[1]._id, name: products[1].name, quantity: 1, price: 95.00, sub_total: 95.00 }],
      billing_address: sampleAddress,
      shipping_address: sampleAddress,
      payment_method: 'cod',
      payment_status: 'pending',
      amount: 95.00,
      total: 95.00,
      status_id: orderStatuses.find(s => s.slug === 'delivered')._id,
    },
    {
      order_number: 1002,
      consumer_id: consumerUser._id,
      products: [
        { product_id: products[4]._id, name: products[4].name, quantity: 1, price: 44.99, sub_total: 44.99 },
        { product_id: products[6]._id, name: products[6].name, quantity: 2, price: 39.99, sub_total: 79.98 },
      ],
      billing_address: sampleAddress,
      shipping_address: sampleAddress,
      payment_method: 'card',
      payment_status: 'paid',
      amount: 124.97,
      total: 124.97,
      status_id: pendingStatus._id,
    },
  ]);

  await Wishlist.insertMany([
    { consumer_id: consumerUser._id, product_id: products[3]._id },
    { consumer_id: consumerUser._id, product_id: products[5]._id },
  ]);

  // 14. Coupons & Shipping
  await Coupon.insertMany([
    { title: 'Welcome Discount', description: '10% off your first order', code: 'WELCOME10', type: 'percentage', amount: 10, min_spend: 0, is_unlimited: true, status: 1, created_by_id: adminUser._id },
    { title: 'Flat $15 Off', description: '$15 off orders above $100', code: 'SAVE15', type: 'fixed', amount: 15, min_spend: 100, is_unlimited: true, status: 1, created_by_id: adminUser._id },
  ]);

  await Shipping.create({
    status: 1,
    country: 'United States',
    country_id: 1,
    shipping_rules: [
      { name: 'Standard Shipping', type: 'flat', amount: 5.99 },
      { name: 'Express Shipping', type: 'flat', amount: 14.99 },
      { name: 'Free Shipping', type: 'free', amount: 0 },
    ],
    created_by_id: adminUser._id,
  });

  // 15. Blog images
  const blogImages = await Attachment.insertMany([
    { name: 'blog-fashion.jpg', file_name: 'blog-fashion.jpg', mime_type: 'image/jpeg', original_url: img('blog-fashion', 800, 450), asset_url: img('blog-fashion', 800, 450) },
    { name: 'blog-shoes.jpg', file_name: 'blog-shoes.jpg', mime_type: 'image/jpeg', original_url: img('blog-shoes', 800, 450), asset_url: img('blog-shoes', 800, 450) },
  ]);

  await Blog.insertMany([
    {
      title: 'Top 10 Fashion Trends This Season',
      slug: 'top-10-fashion-trends-this-season',
      description: 'Discover the hottest fashion trends dominating this season.',
      content: '<p>Fashion is always evolving. This season brings exciting new trends that blend comfort with style. From oversized blazers to sustainable fabrics, here is what is dominating the runways and street style scenes.</p>',
      is_featured: true,
      status: 1,
      blog_thumbnail_id: blogImages[0]._id,
      categories: [categories[1]._id],
      tags: ['fashion', 'trends', 'style'],
      created_by_id: adminUser._id,
    },
    {
      title: 'The Best Running Shoes for 2026',
      slug: 'best-running-shoes-2026',
      description: 'Our top picks for running shoes this year.',
      content: '<p>Whether you are a beginner or a marathon runner, choosing the right shoe matters enormously. We tested dozens of models to bring you the definitive guide to the best running shoes of 2026.</p>',
      status: 1,
      blog_thumbnail_id: blogImages[1]._id,
      categories: [categories[4]._id],
      tags: ['shoes', 'running', 'sports'],
      created_by_id: adminUser._id,
    },
  ]);

  // 16. Notification
  await Notification.create({
    notifiable_id: consumerUser._id,
    data: { title: 'Welcome to xdope Store!', message: 'Thank you for registering. Start shopping now!', type: 'welcome' },
  });

  // 17. Homepage config — fashion_one + default
  const productIds = products.map(p => p._id.toString());
  const categoryIds = categories.map(c => c._id.toString());
  const brandIds = brands.map(b => b._id.toString());

  // Banner images via picsum
  const fashionOneConfig = {
    products_ids: productIds,
    home_banner: {
      status: 1,
      banners: [
        {
          status: 1,
          image_url: null,
          original_url: img('banner-fashion-1', 1835, 627),
          title: 'New Collection',
          subtitle: 'Spring / Summer 2026',
          button_text: 'Shop Women',
          redirect_link: { link_type: 'collection', link: categories[1].slug },
        },
        {
          status: 1,
          image_url: null,
          original_url: img('banner-fashion-2', 1835, 627),
          title: 'Street Style',
          subtitle: 'Men\'s Essentials',
          button_text: 'Shop Men',
          redirect_link: { link_type: 'collection', link: categories[0].slug },
        },
      ],
    },
    offer_banner: {
      banner_1: {
        status: 1,
        image_url: null,
        original_url: img('offer-banner-1', 676, 338),
        title: 'Electronics',
        subtitle: 'Up to 25% Off',
        redirect_link: { link_type: 'collection', link: categories[2].slug },
      },
      banner_2: {
        status: 1,
        image_url: null,
        original_url: img('offer-banner-2', 676, 338),
        title: 'Sports & Outdoors',
        subtitle: 'New Arrivals',
        redirect_link: { link_type: 'collection', link: categories[4].slug },
      },
    },
    products_list: {
      status: 1,
      title: 'Featured Products',
      product_ids: productIds,
    },
    category_product: {
      status: 1,
      title: 'Shop by Category',
      category_ids: categoryIds,
    },
    brands: { brand_ids: brandIds },
    services: {
      status: 1,
      banners: [
        {
          status: 1,
          image_url: 'https://picsum.photos/seed/truck-icon/59/59',
          title: 'Free Shipping',
          description: 'On orders over $50',
        },
        {
          status: 1,
          image_url: 'https://picsum.photos/seed/return-icon/59/59',
          title: '30-Day Returns',
          description: 'Hassle-free returns policy',
        },
        {
          status: 1,
          image_url: 'https://picsum.photos/seed/secure-icon/59/59',
          title: 'Secure Payment',
          description: '100% secure transactions',
        },
        {
          status: 1,
          image_url: 'https://picsum.photos/seed/support-icon/59/59',
          title: '24/7 Support',
          description: 'Dedicated customer care',
        },
      ],
    },
    social_media: { status: 0, banners: [] },
    parallax_banner: { status: 0 },
  };

  await Homepage.insertMany([
    { slug: 'fashion_one', config: fashionOneConfig },
    { slug: 'default', config: fashionOneConfig },
  ]);
  console.log('Homepage config seeded');

  console.log('\n✅ Seed completed!');
  console.log(`Admin: ${adminUser.email} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  console.log(`Consumer: ${consumerUser.email} / Consumer@123`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
