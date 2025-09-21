import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/upload.controller.js";
import uploader from '../config/cloudinary.config.js';

const router = Router();

router.post("/file/image/upload", uploader.array("image_url", 12), uploadFile);

export default router;
