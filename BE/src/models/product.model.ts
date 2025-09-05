import mongoose, { Schema, model } from 'mongoose';
import category from './category.model.js';
import { ProductStatus } from '../enums/product.enum.js';
import { IProduct } from '../interfaces/product.interface.js';
import brand from './brand.model.js';
import tag from './tag.model.js';

const variantSchema = new Schema(
  {
    name: { type: String, required: true }, 
    price: { type: Number, required: true },
    quantity: { type: Number, min: 0, default: 0 },
    image_url: { type: [String], default: [] },
    sku: { type: String }, 
  },
  { _id: true } 
);

const productSchema: Schema<IProduct> = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },

    category_id: {
      type: Schema.Types.ObjectId,
      ref: category,
      required: [true, 'category_id is required'],
      autopopulate: true,
    },
    brand_id: {
      type: Schema.Types.ObjectId,
      ref: brand,
      required: [true, 'brand_id is required'],
      autopopulate: true,
    },
    tag_id: {
      type: Schema.Types.ObjectId,
      ref: tag,
      autopopulate: true,
    },

    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.AVAILABLE,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    quantity_sold: {
      type: Number,
      min: 0,
      default: 0,
    },

    variants: {
      type: [variantSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const productModel = mongoose.models.product || model('product', productSchema);

export default productModel;
