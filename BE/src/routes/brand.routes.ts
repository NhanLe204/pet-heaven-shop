import { Router, Request, Response } from 'express';
import { protectRoute, requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { deleteBrand, getAllBrands, getBrandById, insertBrand, toggleBrandStatus, updateBrand } from '../controllers/brand.controllers.js';
import uploader from '../config/cloudinary.config.js';

const brandRouter = Router();

brandRouter.get('/brands', getAllBrands);
brandRouter.get('/brands/:id', getBrandById);
brandRouter.post('/brands', uploader.array('image_url'), insertBrand);
brandRouter.patch('/brands/:id', verifyToken, uploader.array('image_url'), requireAdmin, updateBrand);
brandRouter.delete('/brands/:id', verifyToken, requireAdmin, deleteBrand);
brandRouter.patch(
    '/brands/:id/status',
    verifyToken,
    requireAdmin,
    toggleBrandStatus
);
export default brandRouter;
