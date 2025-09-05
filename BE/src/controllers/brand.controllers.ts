/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import brandModel from '../models/brand.model.js';
import { IBrand } from '../interfaces/brand.interface.js';
import productModel from '../models/product.model.js';

interface AuthenticatedRequest extends Request {
  brand?: IBrand;
}

// Lấy tất cả brands
export const getAllBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await brandModel.find();
    res.status(200).json({ success: true, result });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Lỗi khi lấy danh sách thương hiệu: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
      return;
    }
    console.error('Lỗi khi lấy danh sách thương hiệu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Lấy brand theo ID
export const getBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID thương hiệu không hợp lệ' });
      return;
    }
    const brand = await brandModel.findById(id);
    if (!brand) {
      res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
      return;
    }
    res.status(200).json({ success: true, message: 'Lấy thương hiệu thành công', brand });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Lỗi khi lấy thương hiệu: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
      return;
    }
    console.error('Lỗi khi lấy thương hiệu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Thêm brand mới
export const insertBrand = async (req: Request, res: Response) => {
  try {
    const { brand_name } = req.body;
    console.log("👉 req.body:", req.body);
    console.log("👉 req.files:", req.files);
    // ✅ Lấy file từ Cloudinary thông qua multer
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    const imageUrls = uploadedFiles.map((file) => (file as any).path); // Cloudinary trả về .path = URL

    const brand = await brandModel.create({
      brand_name,
      image_url: imageUrls,
    });

    res.status(201).json({
      success: true,
      brand,
    });
  } catch (error: any) {
    console.error("❌ Lỗi insertBrand:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Không thể thêm brand",
    });
  }
};


// Cập nhật brand
export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { brand_name, existing_images, new_images } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'ID thương hiệu không hợp lệ'
      });
      return;
    }

    const currentBrand = await brandModel.findById(id);
    if (!currentBrand) {
      res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
      return;
    }

    // Xử lý hình ảnh
    let images_url: string[] = [...(currentBrand.image_url || [])];

    // Ảnh cũ
    let keptImages: string[] = [];
    if (existing_images) {
      keptImages = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
      if (!Array.isArray(keptImages)) keptImages = [];
    }

    // Ảnh mới
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImagesPaths = req.files.map((file) => file.path);
      images_url = newImagesPaths; // ❌ bỏ new_images logic
    } else {
      images_url = keptImages;
    }


    const updatedBrand = await brandModel.findByIdAndUpdate(
      id,
      {
        brand_name,
        image_url: images_url
      },
      { new: true, runValidators: true }
    );

    if (!updatedBrand) {
      res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thương hiệu thành công',
      brand: updatedBrand
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Lỗi khi cập nhật thương hiệu: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
      return;
    }
    console.error('Lỗi khi cập nhật thương hiệu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Xóa brand
export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID thương hiệu không hợp lệ' });
      return;
    }

    const brand = await brandModel.findById(id);
    if (!brand) {
      res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
      return;
    }

    // Kiểm tra có sản phẩm nào đang dùng brand này không
    const productUsingBrand = await productModel.findOne({ brand: id });
    if (productUsingBrand) {
      res.status(400).json({
        success: false,
        message: 'Không thể xóa thương hiệu vì đang có sản phẩm sử dụng'
      });
      return;
    }

    // Nếu không có sản phẩm nào tham chiếu → xóa cứng
    await brandModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Xóa thương hiệu thành công' });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Lỗi khi xóa thương hiệu: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
      return;
    }
    console.error('Lỗi khi xóa thương hiệu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// Upload ảnh cho brand
export const uploadBrandImage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Received files:", req.files);

    let uploadedFiles: any[] = [];

    if (Array.isArray(req.files)) {
      uploadedFiles = req.files; // khi dùng .array()
    } else if (req.file) {
      uploadedFiles = [req.file]; // khi dùng .single()
    } else if (req.files && typeof req.files === 'object') {
      // khi dùng .fields()
      Object.values(req.files).forEach((fileGroup: any) => {
        uploadedFiles.push(...fileGroup);
      });
    }

    if (uploadedFiles.length === 0) {
      res.status(400).json({ success: false, message: "Không có file nào được tải lên" });
      return;
    }

    // Trả về đường dẫn cần thiết (ví dụ path hoặc url)
    const fileInfos = uploadedFiles.map((file) => ({
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    res.status(200).json({
      success: true,
      message: "Tải ảnh thương hiệu thành công",
      files: fileInfos,
    });
  } catch (error) {
    console.error("Lỗi khi tải ảnh:", error);
    res.status(500).json({ success: false, message: "Lỗi khi tải ảnh thương hiệu" });
  }
};

// Chuyển đổi trạng thái brand
export const toggleBrandStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID thương hiệu không hợp lệ' });
      return;
    }

    if (!['active', 'inactive'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận active hoặc inactive'
      });
      return;
    }

    const brand = await brandModel.findById(id);
    if (!brand) {
      res.status(404).json({ success: false, message: 'Không tìm thấy thương hiệu' });
      return;
    }

    brand.status = status;
    await brand.save();

    res.status(200).json({
      success: true,
      message: `Trạng thái thương hiệu đã được cập nhật thành ${status} thành công`,
      brand
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Lỗi khi cập nhật trạng thái thương hiệu: ${error.message}`);
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
      return;
    }
    console.error('Lỗi khi cập nhật trạng thái thương hiệu:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};