const router = require('express').Router();
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /settings  — public (UI middleware calls this unauthenticated)
router.get('/', async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({});
  res.json(setting);
});

// PUT /settings  — admin only
router.put('/', auth, adminOnly, async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({ values: req.body.values || req.body });
  } else {
    const incoming = req.body.values || req.body;
    const current = setting.values || {};
    for (const section of Object.keys(incoming)) {
      current[section] = { ...(current[section] || {}), ...incoming[section] };
    }
    setting.values = current;
    setting.markModified('values');
    await setting.save();
  }
  res.json(setting);
});

module.exports = router;
