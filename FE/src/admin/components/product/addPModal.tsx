import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import MyEditor from "../../utils/CKEditor";
import brandApi from "../../../api/brandApi";
import categoryApi from "../../../api/categoryApi";

interface Variant {
  name: string;
  price: number;
  sale: number;
  quantity: number;
  images: string[];
}

interface ProductFormData {
  name: string;
  brand: string;
  category: string; // lưu id danh mục con cuối cùng
  price: number;
  sale: number;
  description: string;
  images: string[];
  variants: Variant[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    brand: "",
    category: "",
    price: 0,
    sale: 0,
    description: "",
    images: [],
    variants: [],
  });

  const [variant, setVariant] = useState<Variant>({
    name: "",
    price: 0,
    sale: 0,
    quantity: 0,
    images: [],
  });

  const [brands, setBrands] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [childCategories, setChildCategories] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
      fetchParentCategories();
    }
  }, [isOpen]);

  // fetch brand
  const fetchBrands = async () => {
    try {
      const response = await brandApi.getAll();
      setBrands(response.data.result);
    } catch (error) {
      console.log("Failed to fetch brand list: ", error);
    }
  };

  // fetch parent categories
  const fetchParentCategories = async () => {
    try {
      const response = await categoryApi.getParents();
      setParentCategories(response.result);
    } catch (error) {
      console.log("Failed to fetch parent categories: ", error);
    }
  };

  // fetch children by parentId
  const fetchChildCategories = async (parentId: string) => {
    try {
      const response = await categoryApi.getChildren(parentId);
      setChildCategories(response.result);
    } catch (error) {
      console.log("Failed to fetch child categories: ", error);
    }
  };



  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    setFormData((prev) => ({ ...prev, category: "" })); // reset child khi đổi parent
    if (parentId) {
      fetchChildCategories(parentId);
    } else {
      setChildCategories([]);
    }
  };

  const handleAddVariant = () => {
    if (variant.name.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, variant],
      }));
      setVariant({ name: "", price: 0, sale: 0, quantity: 0, images: [] });
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const removeProductImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeVariantImage = (index: number) => {
    setVariant((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex w-2/3 bg-white rounded-lg shadow-lg h-5/6">
        <div className="w-full p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Thêm sản phẩm</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <IoMdClose size={28} />
            </button>
          </div>

          {/* General Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Tên sản phẩm</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Thương hiệu</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.brand_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Danh mục cha</label>
              <select
                name="parentCategory"
                onChange={handleParentChange}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Chọn danh mục cha --</option>
                {parentCategories.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Danh mục con</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                disabled={childCategories.length === 0}
              >
                <option value="">-- Chọn danh mục con --</option>
                {childCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Sale */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Giá gốc (VNĐ)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Sale (%)</label>
              <input
                type="number"
                name="sale"
                value={formData.sale}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Description */}
          <label className="block mb-2 font-medium">Mô tả</label>
          <MyEditor
            value={formData.description}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, description: data }))
            }
          />

          {/* Product Images */}
          <div className="mt-6">
            <label className="block mb-2 font-semibold">Ảnh sản phẩm</label>
            <div className="flex items-start gap-3">
              <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <span className="text-sm text-gray-500">+ Thêm ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      const urls = Array.from(files).map((file) =>
                        URL.createObjectURL(file)
                      );
                      setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, ...urls],
                      }));
                    }
                  }}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {formData.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      alt={`product-${i}`}
                      className="object-cover w-32 h-32 rounded"
                    />
                    <button
                      onClick={() => removeProductImage(i)}
                      className="absolute top-0 right-0 p-1 text-xs text-gray-600 rounded-full bg-slate-400"
                    >
                      <IoMdClose></IoMdClose>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="mt-8">
            <label className="block mb-2 text-lg font-semibold">Biến thể</label>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Tên biến thể
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => setVariant({ ...variant, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Giá</label>
                <input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    setVariant({ ...variant, price: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Sale (%)</label>
                <input
                  type="number"
                  value={variant.sale}
                  onChange={(e) =>
                    setVariant({ ...variant, sale: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Số lượng</label>
                <input
                  type="number"
                  value={variant.quantity}
                  onChange={(e) =>
                    setVariant({ ...variant, quantity: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Variant Images */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">Ảnh biến thể</label>
              <div className="flex items-start gap-3">
                <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="text-xs text-gray-500">+ Ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setVariant((prev) => ({
                          ...prev,
                          images: [...prev.images, url],
                        }));
                      }
                    }}
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  {variant.images.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`variant-${i}`}
                        className="object-cover w-20 h-20 rounded"
                      />
                      <button
                        onClick={() => removeVariantImage(i)}
                        className="absolute top-0 right-0 p-1 text-xs text-gray-600 rounded-full bg-slate-400"
                      >
                        <IoMdClose></IoMdClose>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAddVariant}
              className="px-4 py-2 mb-6 text-white bg-green-500 rounded"
            >
              + Thêm biến thể
            </button>

            {/* List Variants */}
            <div className="space-y-2">
              {formData.variants.map((v, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded">
                  <div className="flex-shrink-0">
                    {v.images[0] && (
                      <img
                        src={v.images[0]}
                        alt={`variant-${i}`}
                        className="object-cover w-12 h-12 rounded"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-gray-600">
                      Giá: {v.price}₫ | Sale: {v.sale}% | SL: {v.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="px-5 py-2 mt-6 text-white bg-blue-600 rounded"
          >
            Lưu sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
