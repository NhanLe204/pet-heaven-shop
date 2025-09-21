import { CategoryStatus } from '../enums/category.enum.js';

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  image_url?: string[];
  parent_id?: string | null;
  status: CategoryStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
