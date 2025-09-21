// controllers/category.controller.ts
import { Request, Response } from 'express';
import { IUser } from '../interfaces/user.interface.js';
import categoryModel from '../models/category.model.js';
import { CategoryStatus } from '../enums/category.enum.js';
import mongoose from 'mongoose';
import productModel from '@/models/product.model.js';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Lấy tất cả categories
export const getAllCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await categoryModel.find();
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error getAllCategory:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Lấy theo id
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    const category = await categoryModel.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
      return;
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Error getCategoryById:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Thêm
export const insertCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, parent_id } = req.body;
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    const imageUrls = uploadedFiles.map((file) => (file as any).path);

    const newCategory = new categoryModel({
      name,
      description,
      image_url: imageUrls,
      parent_id: parent_id && mongoose.Types.ObjectId.isValid(parent_id) ? parent_id : null,
    });


    await newCategory.save();
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error insertCategory:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


// Sửa
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, parent_id, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    // Lấy ảnh mới (nếu có)
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    const newImageUrls = uploadedFiles.map((file) => (file as any).path);

    const updateData: any = {
      name,
      description,
      parent_id: parent_id && mongoose.Types.ObjectId.isValid(parent_id) ? parent_id : null,
      status,
    };

    if (newImageUrls.length > 0) {
      updateData.image_url = newImageUrls[0]; // chỉ 1 ảnh
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
      return;
    }

    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error('Error updateCategory:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Ẩn/hiện category
export const toggleCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    const statusString = String(status).toLowerCase();
    if (!Object.values(CategoryStatus).includes(statusString as CategoryStatus)) {
      res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
      return;
    }

    const category = await categoryModel.findByIdAndUpdate(
      id,
      { status: statusString },
      { new: true }
    );

    if (!category) {
      res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
      return;
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error('Error toggleCategory:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Lấy category active
export const getCategoriesActive = async (req: Request, res: Response) => {
  try {
    const result = await categoryModel.find({ status: CategoryStatus.ACTIVE });
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error getCategoriesActive:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Xóa (soft delete bằng status)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    const category = await categoryModel.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
      return;
    }

    const productUsingCategory = await productModel.findOne({ category: id });
    if (productUsingCategory) {
      res.status(400).json({ success: false, message: 'Không thể xóa vì vẫn còn sản phẩm thuộc danh mục này' });
      return;
    }

    // Soft delete = chuyển sang inactive
    category.status = CategoryStatus.INACTIVE;
    await category.save();

    res.status(200).json({ success: true, message: 'Danh mục đã được ẩn thành công' });
  } catch (error) {
    console.error('Error deleteCategory:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
// Upload ảnh cho category
export const uploadCategoryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Received files:", req.files);

    let uploadedFiles: any[] = [];

    if (Array.isArray(req.files)) {
      uploadedFiles = req.files; // khi dùng .array()
    } else if (req.file) {
      uploadedFiles = [req.file]; // khi dùng .single()
    } else if (req.files && typeof req.files === "object") {
      Object.values(req.files).forEach((fileGroup: any) => {
        uploadedFiles.push(...fileGroup);
      });
    }

    if (uploadedFiles.length === 0) {
      res.status(400).json({ success: false, message: "Không có file nào được tải lên" });
      return;
    }

    const fileInfos = uploadedFiles.map((file) => ({
      filename: file.filename,
      path: file.path, // ✅ Cloudinary URL
      mimetype: file.mimetype,
      size: file.size,
    }));

    res.status(200).json({
      success: true,
      message: "Tải ảnh category thành công",
      files: fileInfos,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tải ảnh category:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tải ảnh category" });
  }
};


export const getChildrenCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parentId } = req.params;

    let children;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        res.status(400).json({ success: false, message: "ID cha không hợp lệ" });
        return;
      }
      children = await categoryModel.find({ parent_id: parentId });
    } else {
      children = await categoryModel.find({ parent_id: { $ne: null } });
    }
    console.log("Children categories response:", children);

    res.status(200).json({ success: true, result: children });
  } catch (error) {
    console.error("Error getChildrenCategories:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



export const getParentCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const parents = await categoryModel.find({ parent_id: null });
    res.status(200).json({ success: true, result: parents });
  } catch (error) {
    console.error("Error getParentCategories:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};