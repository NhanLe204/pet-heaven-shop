/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
import productModel from '../models/product.model.js';
import { ProductStatus, ProductStatusMapping } from '../enums/product.enum.js';
import categoryModel from '../models/category.model.js';
import tagModel from '../models/tag.model.js';
import { IProduct } from '../interfaces/product.interface.js';
import brandModel from '../models/brand.model.js';
import orderModel from '@/models/order.model.js';
import { OrderStatus } from '@/enums/order.enum.js';

const removeVietnameseTones = (str: string): string => {
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[đĐ]/g, (match) => (match === 'đ' ? 'd' : 'D'));
  return str.toLowerCase();
};

// lấy hết
export const getAllProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, tag, status, brand, category, priceMin, priceMax, page = '1', limit = '10' } = req.query;
    const query: any = {};

    // 1. Lọc theo trạng thái (status)
    if (status && typeof status === 'string') {
      if (!Object.values(ProductStatus).includes(status as ProductStatus)) {
        res.status(400).json({
          success: false,
          message: `Trạng thái không hợp lệ. Chỉ chấp nhận ${Object.values(ProductStatus).join(', ')}`
        });
        return;
      }
      query.status = status;
    }

    // 2. Lọc theo tag (tag_id)
    if (tag && typeof tag === 'string') {
      if (!ObjectId.isValid(tag)) {
        res.status(400).json({ success: false, message: 'Tag ID không hợp lệ' });
        return;
      }
      const tagExists = await tagModel.findById(tag);
      if (!tagExists) {
        res.status(404).json({ success: false, message: `Tag với ID ${tag} không tồn tại` });
        return;
      }
      query.tag_id = new ObjectId(tag);
    }

    // 3. Tìm kiếm theo tên sản phẩm (search)
    if (search && typeof search === 'string') {
      const searchNoTones = removeVietnameseTones(search);
      query.name = { $regex: searchNoTones, $options: 'i' };
    }

    // 4. Lọc theo brand
    if (brand && typeof brand === 'string') {
      if (!ObjectId.isValid(brand)) {
        res.status(400).json({ success: false, message: 'Brand ID không hợp lệ' });
        return;
      }
      const brandExists = await brandModel.findById(brand);
      if (!brandExists) {
        res.status(404).json({ success: false, message: `Brand với ID ${brand} không tồn tại` });
        return;
      }
      query.brand_id = new ObjectId(brand);
    }

    // 5. Lọc theo category
    if (category && typeof category === 'string') {
      if (!ObjectId.isValid(category)) {
        res.status(400).json({ success: false, message: 'Category ID không hợp lệ' });
        return;
      }
      const categoryExists = await categoryModel.findById(category);
      if (!categoryExists) {
        res.status(404).json({ success: false, message: `Category với ID ${category} không tồn tại` });
        return;
      }
      query.category_id = new ObjectId(category);
    }

    // 6. Lọc theo khoảng giá (priceMin và priceMax)
    if (priceMin || priceMax) {
      const priceFilter: any = {};
      if (priceMin && typeof priceMin === 'string') {
        const min = parseFloat(priceMin);
        if (isNaN(min) || min < 0) {
          res.status(400).json({ success: false, message: 'Giá tối thiểu không hợp lệ' });
          return;
        }
        priceFilter.$gte = min;
      }
      if (priceMax && typeof priceMax === 'string') {
        const max = parseFloat(priceMax);
        if (isNaN(max) || max < 0) {
          res.status(400).json({ success: false, message: 'Giá tối đa không hợp lệ' });
          return;
        }
        priceFilter.$lte = max;
      }
      if (priceFilter.$gte !== undefined && priceFilter.$lte !== undefined && priceFilter.$gte > priceFilter.$lte) {
        res.status(400).json({ success: false, message: 'Giá tối thiểu không được lớn hơn giá tối đa' });
        return;
      }

      // Áp dụng lọc giá cho cả product.price hoặc variants.price
      query.$or = [
        { price: priceFilter },
        { "variants.price": priceFilter }
      ];
    }

    // Phân trang
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    if (pageNum < 1 || limitNum < 1) {
      res.status(400).json({ success: false, message: 'Page và limit phải là số dương' });
      return;
    }
    const skip = (pageNum - 1) * limitNum;

    // Đếm tổng số sản phẩm phù hợp
    const total = await productModel.countDocuments(query);

    // Truy vấn
    const result = await productModel
      .find(query)
      .populate('category_id', 'name')
      .populate('brand_id', 'brand_name')
      .populate('tag_id', 'tag_name')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: result.length > 0 ? 'Lấy danh sách sản phẩm thành công' : 'Không tìm thấy sản phẩm phù hợp',
      result,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', (error as Error).message || error);
    res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
  }
};

// lấy theo id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
      return;
    }

    const product = await productModel
      .findById(id)
      .populate('category_id', 'name')
      .populate('brand_id', 'brand_name')
      .populate('tag_id', 'tag_name');

    if (!product) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lấy sản phẩm thành công',
      product
    });
  } catch (error) {
    console.error('Error getting product:', (error as Error).message || error);
    res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
  }
};

// thêm sản phẩm
export const insertProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category_id, tag_id, brand_id, status, discount, quantity, variants } = req.body;

    // Validate các ObjectId
    if (!mongoose.Types.ObjectId.isValid(category_id) || 
        !mongoose.Types.ObjectId.isValid(brand_id)) {
      res.status(400).json({ success: false, message: 'category_id hoặc brand_id không hợp lệ' });
      return;
    }

    // Lấy ảnh chính (image_url)
    let images: string[] = [];
    const fileData = req.files;
    if (Array.isArray(fileData) && fileData.length > 0) {
      images = fileData.map((file) => file.path);
    }

    // Parse variants nếu frontend gửi JSON
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = JSON.parse(variants); // vì frontend thường gửi variants dạng string JSON
      } catch (err) {
        res.status(400).json({ success: false, message: 'variants không đúng định dạng JSON' });
        return;
      }
    }

    const newProduct = new productModel<Partial<IProduct>>({
      name,
      description,
      price,
      category_id,
      image_url: images,
      tag_id,
      brand_id,
      status,
      discount: discount || 0,
      quantity: quantity || 0,
      variants: parsedVariants
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo sản phẩm', error });
  }
};

// sửa
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category_id,
      status,
      quantity,
      discount,
      brand_id,
      tag_id,
      existing_images,
      new_images,
      variants
    } = req.body;

    // Check bắt buộc
    if (!name || !price || !category_id || !status) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ các trường bắt buộc: name, price, category_id, status'
      });
      return;
    }

    const currentProduct = await productModel.findById(id);
    if (!currentProduct) {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return;
    }

    // ====== ẢNH chính ======
    let images_url: string[] = [...(currentProduct.image_url || [])];

    // ảnh cũ
    let keptImages: string[] = [];
    if (existing_images) {
      keptImages = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
      if (!Array.isArray(keptImages)) keptImages = [];
    }

    // ảnh mới
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImagesPaths = req.files.map((file) => file.path);
      let newImagesIndices: any[] = [];
      if (new_images) {
        newImagesIndices = typeof new_images === 'string' ? JSON.parse(new_images) : new_images;
      }

      const finalImages: string[] = [];
      const maxIndex = Math.max(images_url.length, ...newImagesIndices.map((ni: any) => ni.index));

      for (let i = 0; i <= maxIndex; i++) {
        const newImageIndex = newImagesIndices.findIndex((ni: any) => ni.index === i);
        if (newImageIndex !== -1) {
          finalImages[i] = newImagesPaths[newImageIndex];
        } else if (i < images_url.length && keptImages.includes(images_url[i])) {
          finalImages[i] = images_url[i];
        }
      }

      images_url = finalImages.filter((img) => img !== undefined);
    } else {
      images_url = keptImages;
    }

    // ====== Variants ======
    let parsedVariants = currentProduct.variants || [];
    if (variants) {
      try {
        parsedVariants = JSON.parse(variants); 
        // giả sử frontend gửi: [{ _id, name, price, stock, images }]
      } catch (err) {
        res.status(400).json({ success: false, message: 'variants không đúng định dạng JSON' });
        return;
      }
    }

    // TODO: nếu có req.files cho variant thì cần map theo variantId + index
    // (tùy cách frontend gửi form-data, có thể làm giống image_url ở trên)

    if (!Object.values(ProductStatus).includes(status as ProductStatus)) {
      res.status(400).json({ success: false, message: 'Trạng thái sản phẩm không hợp lệ' });
      return;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category_id,
        image_url: images_url,
        brand_id,
        status,
        tag_id,
        quantity,
        discount,
        variants: parsedVariants
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      return;
    }

    res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công', product: updatedProduct });
  } catch (error) {
    console.error('Error product update:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật sản phẩm' });
  }
};

// xóa
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      return;
    }

    if (product.status === ProductStatus.DISCONTINUED) {
      res.status(400).json({ success: false, message: 'Sản phẩm đã ngừng kinh doanh rồi' });
      return;
    }

    product.status = ProductStatus.DISCONTINUED;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Sản phẩm đã được chuyển sang trạng thái ngừng kinh doanh',
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa sản phẩm', error });
  }
};

//mới nhất
export const getNewProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel
      .find({ status: ProductStatus.AVAILABLE })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('category_id')
      .populate('brand_id');

    if (!result || result.length === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm mới' });
      return;
    }
    res.status(200).json({ success: true, message: 'Lấy sản phẩm mới thành công', result });
  } catch (error) {
    console.error("getNewProduct error:", error); 
    res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm mới', error });
  }
};

//sale
export const getSaleProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel
      .find({ discount: { $gt: 0 }, status: ProductStatus.AVAILABLE })
      .populate('category_id')
      .populate('brand_id')
      .limit(10);
    if (!result || result.length === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm giảm giá' });
      return;
    }
    res.status(200).json({ success: true, message: 'Lấy sản phẩm giảm giá thành công', result: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm giảm giá', error });
  }
};

// sản phẩm đang hot
export const getHotProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel
      .find({ status: ProductStatus.AVAILABLE })
      .sort({ quantity_sold: -1 })
      .limit(10)
      .populate('category_id')
      .populate('brand_id')
      .populate('tag_id');

    if (!result || result.length === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm bán chạy' });
      return;
    }
    res.status(200).json({ success: true, message: 'Lấy sản phẩm bán chạy thành công', result: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy sản phẩm bán chạy', error });
  }
};

// lấy theo danh mục và tag
async function getProductsByRef(
  req: Request,
  res: Response,
  options: {
    model: any,
    modelName: string,
    field: string,  // ví dụ "category_id" hay "tag_id"
    displayField: string // ví dụ "name" hay "tag_name"
  }
): Promise<void> {
  let displayName = options.modelName;
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: `${options.modelName} ID is required` });
      return;
    }

    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: `Invalid ${options.modelName} ID format` });
      return;
    }

    const objectId = new ObjectId(id);
    const refDoc = await options.model.findById(objectId);

    if (!refDoc) {
      res.status(404).json({ success: false, message: `${options.modelName} with ID ${id} not found` });
      return;
    }

    displayName = refDoc[options.displayField] || options.modelName;

    const products = await productModel
      .find({ [options.field]: objectId })
      .populate('category_id')
      .populate('brand_id')
      .populate('tag_id');

    if (!products.length) {
      res.status(404).json({ success: false, message: `No products found for ${options.modelName} "${displayName}" (ID: ${id})` });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Lấy sản phẩm dành cho ${options.modelName} "${displayName}" thành công`,
      products
    });
  } catch (error) {
    console.error(`Error fetching products by ${options.modelName}:`, error);
    res.status(500).json({
      success: false,
      message: `Lỗi khi lấy sản phẩm dành cho ${options.modelName} "${displayName}"`
    });
  }
}
export const getProductByCategoryID = (req: Request, res: Response) => 
  getProductsByRef(req, res, {
    model: categoryModel,
    modelName: 'Category',
    field: 'category_id',
    displayField: 'name'
  });

export const getProductByTagId = (req: Request, res: Response) => 
  getProductsByRef(req, res, {
    model: tagModel,
    modelName: 'Tag',
    field: 'tag_id',
    displayField: 'tag_name'
  });

// up ảnh
export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ message: "No file uploaded" });
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
      message: "Upload images successfully",
      files: fileInfos,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error while uploading files" });
  }
};

// sản phẩm hoạt động
export const getProductActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel.find({ status: ProductStatus.AVAILABLE });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// sản phẩm liên quan
export const getProductRelated = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;

    // Tìm sản phẩm theo ID
    const product = await productModel.findById(productId).lean();
    if (!product) {
      res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      return;
    }

    // Kiểm tra các trường cần thiết
    const { category_id, tag_id } = product;
    console.log(category_id, 'category_id');
    console.log(tag_id, 'tag_id');

    // Nếu không có tiêu chí nào để tìm sản phẩm liên quan
    if (!category_id && !tag_id) {
      res.status(200).json([]); // Trả về mảng rỗng
      return;
    }

    // Tạo điều kiện query cho sản phẩm liên quan
    const queryConditions: any[] = [];
    if (category_id) queryConditions.push({ category_id: new Types.ObjectId(category_id) });
    if (tag_id) queryConditions.push({ tag_id: new Types.ObjectId(tag_id) });
    console.log(queryConditions, 'SSS1111111111111');
    // Tìm sản phẩm liên quan
    const relatedProducts = await productModel
      .find({
        _id: { $ne: new Types.ObjectId(productId) }, // Loại bỏ chính sản phẩm hiện tại
        $and: queryConditions // Tìm sản phẩm có ít nhất một trường khớp
      })
      .find({ status: ProductStatus.AVAILABLE })
      .limit(10) // Giới hạn số lượng sản phẩm trả về
      .lean();

    res.status(200).json(relatedProducts);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm liên quan:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm liên quan' });
  }
};

export const toggleProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    console.log('ID Product:', id);
    console.log('Status Product:', status);

    if (!id) {
      res.status(400).json({ message: 'Vui lòng cung cấp ID sản phẩm' });
      return;
    }

    // Kiểm tra status có hợp lệ không
    const statusString = String(status).toLowerCase();
    if (!Object.values(ProductStatus).includes(statusString as ProductStatus)) {
      res.status(400).json({
        message: `Trạng thái không hợp lệ. Chỉ chấp nhận ${ProductStatus.AVAILABLE}, ${ProductStatus.DISCONTINUED}, ${ProductStatus.OUT_OF_STOCK}  `
      });
      return;
    }

    // Tìm sản phẩm theo ID
    const product = await productModel.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      return;
    }
    product.status = statusString;
    await product.save();

    res.status(200).json({
      message: `Sản phẩm đã được chuyển trạng thái ${statusString} thành công`,
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái sản phẩm', error });
    return;
  }
};

// quản lí trạng thái sản phẩm
export const toggleProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('ID Product:', id);
    console.log('New Status:', status);

    if (!id) {
      res.status(400).json({ message: 'Vui lòng cung cấp ID sản phẩm' });
      return;
    }

    if (!Object.values(ProductStatus).includes(status as ProductStatus)) {
      res.status(400).json({
        message: `Trạng thái không hợp lệ. Chỉ chấp nhận ${Object.values(ProductStatus).join(', ')}`
      });
      return;
    }

    const product = await productModel.findById(id);
    if (!product) {
      res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      return;
    }

    product.status = status;
    await product.save();

    res.status(200).json({
      message: `Trạng thái sản phẩm đã được cập nhật thành ${status} thành công`,
      product
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái sản phẩm', error });
  }
};

// sản phẩm hết hàng
export const getProductOutStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productModel
      .find({ status: ProductStatus.OUT_OF_STOCK })
      .populate('category_id')
      .populate('brand_id')
      .populate('tag_id');
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};







