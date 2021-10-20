const mongoose = require('mongoose');

// Create the product schema
const imageSchema = mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// return a virtual id
imageSchema.method('toJSON', function () {
  const { __v, ...object } = this.toObject();
  const { _id: id, ...result } = object;
  return { ...result, id };
});

// export a model as OBJECT
exports.Image = mongoose.model('Image', imageSchema);
// Note: export single object likes above, it needs to import as object
// const { Product } = require('../models/product');

// export a model as MODULE
// module.exports = mongoose.model('Product', productSchema);
// Note: export as module, it needs to import as module without {}
// const Product = require('../models/product');
