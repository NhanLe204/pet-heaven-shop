import mongoose, { Schema, model } from 'mongoose';
import { ICategory } from '../interfaces/category.interface.js';
import { CategoryStatus } from '../enums/category.enum.js';

const categorySchema: Schema<ICategory> = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  image_url: {
    type: [String],
    default: []
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: 'category',
    default: null
  },
  status: {
    type: String,
    enum: Object.values(CategoryStatus),
    default: CategoryStatus.ACTIVE
  }
}, {
  timestamps: true
});

const categoryModel = mongoose.models.category || model('category', categorySchema);

export default categoryModel;
