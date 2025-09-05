import { ObjectId } from 'mongoose';
import { ProductStatus } from '../enums/product.enum.js';
import { ICategory } from './category.interface.js';
import { IBrand } from './brand.interface.js';
import { ITag } from './tag.interface.js';

export interface IProductVariant {
  _id?: ObjectId;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

export interface IProduct extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  category_id: ICategory;
  brand_id: IBrand;
  tag_id?: ITag;
  status: ProductStatus;
  discount: number;
  quantity_sold: number;
  variants: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}