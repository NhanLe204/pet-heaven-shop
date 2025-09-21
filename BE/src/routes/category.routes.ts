import { Router, Request, Response } from 'express';
import {
  getAllCategory,
  toggleCategory,
  insertCategory,
  updateCategory,
  getCategoryById,
  getCategoriesActive,
  deleteCategory,
  getChildrenCategories,
  getParentCategories
} from '../controllers/category.controllers.js';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import uploader from '../config/cloudinary.config.js';
const categoryRouter = Router();

// http://localhost:5000/api/v1/categories

categoryRouter.get('/categories', getAllCategory);
categoryRouter.get('/categories/parents', getParentCategories);
categoryRouter.get('/categories/status/active', getCategoriesActive);
categoryRouter.get('/categories/children/:parentId', getChildrenCategories);
categoryRouter.get('/categories/:id', getCategoryById);

categoryRouter.post('/categories', uploader.array('image_url'), insertCategory);
categoryRouter.patch('/categories/:id', verifyToken, uploader.array('image_url'), requireAdmin, updateCategory);
categoryRouter.patch('/categories/status/:id', verifyToken, requireAdmin, toggleCategory);
categoryRouter.delete('/categories/:id', verifyToken, requireAdmin, deleteCategory);
categoryRouter.patch(
    '/categories/:id/status',
    verifyToken,
    requireAdmin,
    toggleCategory
);
export default categoryRouter;
