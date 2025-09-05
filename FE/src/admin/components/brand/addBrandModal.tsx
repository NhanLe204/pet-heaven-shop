import React, { useState } from "react";
import brandApi from "../../../api/brandApi";
import { IoMdClose } from "react-icons/io";
import { FaUpload } from "react-icons/fa";
import { notification } from "antd";


interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  reloadBrands: () => void;
}

export default function AddBrandModal({
  isOpen,
  onClose,
  reloadBrands,
}: AddBrandModalProps) {
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBrandImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const createBrand = async () => {
    try {
      if (!brandName.trim()) {
        alert("Vui lòng nhập tên thương hiệu!");
        return;
      }
      setLoading(true);
      const formData = new FormData();
      formData.append("brand_name", brandName);
      if (brandImage) formData.append("image_url", brandImage);

      const response = await brandApi.create(formData);
      if (!response.success) throw new Error(response.message);
      if (!response.success) throw new Error(response.message);

      notification.success({
        message: "Thành công",
        description: "Thương hiệu đã được thêm thành công!",
      });
      await reloadBrands();
      setBrandName("");
      setBrandImage(null);
      setPreviewUrl(null);
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi thêm brand:", err);
      notification.error({
        message: "Thất bại",
        description: err.message || "Không thể thêm thương hiệu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[600px] p-6">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Thêm thương hiệu</h2>
          <button
            className="text-gray-600 hover:text-black"
            onClick={onClose}
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* tên */}
        <div className="mb-5">
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Nhập tên thương hiệu..."
            className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ảnh */}
        <div className="mb-5">
          <label className="block mb-2 text-base font-medium">
            Hình ảnh thương hiệu
          </label>
          <label
            htmlFor="brand-image"
            className="flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="object-contain h-full rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <FaUpload className="mb-2 text-2xl" />
                <span className="text-base">Chọn ảnh</span>
              </div>
            )}
          </label>
          <input
            id="brand-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-base border rounded-lg hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={createBrand}
            disabled={loading}
            className="px-5 py-2 text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
      </div>
    </div>
  );
}
