import mongoose, { Schema, model } from 'mongoose';
import { IBlog } from '../interfaces/blog.interface.js';
import { BlogStatus } from '../enums/blog.enum.js';
import Product from '../models/product.model.js';
import blogCategory from '../models/blogCategory.model.js';

const blogSchema: Schema<IBlog> = new Schema<IBlog>(
  {
    blog_category_id: {
      type: Schema.Types.ObjectId,
      ref: blogCategory,
      autoPopulate: true
    },
    image_url: {
      type: String,
      required: false
    },
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: BlogStatus,
      default: BlogStatus.ACTIVE
    }
  },
  { timestamps: true }
);

const blogModel = mongoose.models.Blog || model<IBlog>('Blog', blogSchema);

export default blogModel;
