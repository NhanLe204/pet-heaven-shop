import mongoose, { Schema, model } from 'mongoose';
import { IRating } from '../interfaces/rating.interface.js';
import orderdetail from './orderdetail.model.js';
import user from './user.model.js';
import product from './product.model.js';

const rateSchema: Schema<IRating> = new Schema<IRating>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: orderdetail,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: user,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: {
      type: [String],
      default: []
    }
  },
  { timestamps: true, _id: false }
);

const rateModel = mongoose.models.rate || model('rate', rateSchema);

export default rateModel;
