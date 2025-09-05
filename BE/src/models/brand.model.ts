import mongoose, { Schema, model } from 'mongoose';
import { IBrand } from '../interfaces/brand.interface.js';
import { BrandStatus } from '@/enums/brand.enum.js';

const brandSchema: Schema<IBrand> = new Schema<IBrand>({
  brand_name: {
    type: String,
    default: ''
  },
  image_url: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: BrandStatus,
    default: BrandStatus.ACTIVE
  }
});

const brandModel = mongoose.models.brand || model('brand', brandSchema);

export default brandModel;
