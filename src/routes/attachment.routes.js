const router = require('express').Router();
const Attachment = require('../models/Attachment');
const auth = require('../middleware/auth');
const { multer, cloudinary } = require('../middleware/upload');

// POST /attachment
router.post('/', auth, multer.any(), async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) return res.status(422).json({ message: 'No file uploaded' });

  const created = await Promise.all(files.map(async (file) => {
    const asset_url = file.path; // Cloudinary secure URL
    return Attachment.create({
      name: file.originalname,
      file_name: file.filename,
      mime_type: file.mimetype,
      path: file.filename,       // Cloudinary public_id
      asset_url,
      original_url: asset_url,
      created_by_id: req.user._id,
    });
  }));

  res.status(201).json(created.length === 1 ? created[0] : { data: created });
});

// GET /attachment
router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.paginate) || 20;
  const total = await Attachment.countDocuments();
  const data = await Attachment.find().skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
  res.json({ current_page: page, last_page: Math.ceil(total / limit), total, per_page: limit, data });
});

async function deleteAttachment(att) {
  try {
    await cloudinary.uploader.destroy(att.path, { resource_type: 'auto' });
  } catch (_) { /* ignore if already gone */ }
  await att.deleteOne();
}

// DELETE /attachment/deleteAll
router.delete('/deleteAll', auth, async (req, res) => {
  const ids = req.body.ids || [];
  const attachments = await Attachment.find({ _id: { $in: ids } });
  await Promise.all(attachments.map(deleteAttachment));
  res.json({ message: `${attachments.length} attachment(s) deleted` });
});

// DELETE /attachment/:id
router.delete('/:id', auth, async (req, res) => {
  const att = await Attachment.findById(req.params.id);
  if (!att) return res.status(404).json({ message: 'Attachment not found' });
  await deleteAttachment(att);
  res.json({ message: 'Attachment deleted' });
});

module.exports = router;
