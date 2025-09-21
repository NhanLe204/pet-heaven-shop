import React, { useState } from "react";
import categoryApi from "../../../api/categoryApi";
import { IoMdClose } from "react-icons/io";
import { FaUpload } from "react-icons/fa";
import { notification } from "antd";
import { validateMaxLength } from "../../utils/validateName";
interface AddCateModalProps {
    isOpen: boolean;
    onClose: () => void;
    reloadCategories: () => void;
}

export default function AddCategoryModal({
    isOpen,
    onClose,
    reloadCategories,
}: AddCateModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryImage, setCategoryImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setCategoryImage(file);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const createCategory = async () => {
        try {
            if (!validateMaxLength("Tên danh mục", name, 50)) return;
            if (!name.trim()) {
                notification.warning({
                    message: "Thiếu thông tin",
                    description: "Vui lòng nhập tên danh mục!",
                });
                return;
            }
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            if (categoryImage) formData.append("image_url", categoryImage);

            const response = await categoryApi.create(formData);
            if (!response.success) throw new Error(response.message);
            console.log("Thêm category thành công:", response.result);
            notification.success({
                message: "Thành công",
                description: "Danh mục đã được thêm thành công!",
            });
            await reloadCategories();

            setName("");
            setDescription("");
            setCategoryImage(null);
            setPreviewUrl(null);
            onClose();
        } catch (err: any) {
            console.error("Lỗi khi thêm category:", err);
            notification.error({
                message: "Thất bại",
                description: err.message || "Không thể thêm danh mục",
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
                    <h2 className="text-2xl font-semibold">Thêm danh mục</h2>
                    <button
                        className="text-gray-600 hover:text-black"
                        onClick={onClose}
                    >
                        <IoMdClose size={24} />
                    </button>
                </div>

                {/* tên */}
                <div className="mb-5">
                    <label className="block mb-2 text-base font-medium">Tên danh mục</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên danh mục..."
                        className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* mô tả */}
                <div className="mb-5">
                    <label className="block mb-2 text-base font-medium">Mô tả</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập mô tả..."
                        className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* ảnh */}
                <div className="mb-5">
                    <label className="block mb-2 text-base font-medium">
                        Hình ảnh danh mục
                    </label>
                    <label
                        htmlFor="category-image"
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
                        id="category-image"
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
                        onClick={createCategory}
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
