import { BlogCategoryStatus } from '../enums/blogCategory.enum';
import { IBlogCategory } from '../interfaces/blogCategory.interface';
import mongoose, { Schema, model } from 'mongoose';

const blogCategorySchema: Schema<IBlogCategory> = new Schema<IBlogCategory>({
  name: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: BlogCategoryStatus,
    default: BlogCategoryStatus.ACTIVE
  }
});

const blogCategoryModel = mongoose.models.modelCategory || model('blogCategory', blogCategorySchema);

export default blogCategoryModel;
