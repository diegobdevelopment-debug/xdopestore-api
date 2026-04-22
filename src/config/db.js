const mongoose = require('mongoose');

// Global plugin: expose created_at / updated_at aliases from Mongoose timestamps
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    transform(doc, ret) {
      if (ret.createdAt) ret.created_at = ret.createdAt;
      if (ret.updatedAt) ret.updated_at = ret.updatedAt;
      return ret;
    },
  });
});

module.exports = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected:', process.env.MONGODB_URI);
};
