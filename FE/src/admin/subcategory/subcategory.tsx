import React, { useEffect, useState } from "react";
import {
    Card,
    Button,
    Table,
    Space,
    Tag,
    notification,
} from "antd";
import { PlusOutlined, EditOutlined, SyncOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import categoryApi from "../../api/categoryApi";
import AddCategoryModal from "../components/category/addModal";
import EditCategoryModal from "../components/category/editModal";
import AddSubModal from "../components/category/addSubModal";
import { useParams } from "react-router-dom";

interface Category {
    key: string;
    _id: string;
    name: string;
    description: string;
    status: string;
    image_url: string[];
}

interface SubCategoryListProps {
    parentId: string; // truyền từ CategoryList hoặc router
}

const SubCategoryList: React.FC<SubCategoryListProps> = () => {
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const fetchSubCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryApi.getChildren();
            if (!response.success) throw new Error(response.message);

            console.log("children:", response.data);

            const mapped: Category[] = response.data.map((c: any) => ({
                key: c._id,
                _id: c._id,
                name: c.name,
                description: c.description || "",
                status: c.status,
                image_url: Array.isArray(c.image_url) ? c.image_url : c.image_url ? [c.image_url] : [],
            }));

            setSubCategories(mapped);

        } catch (err: any) {
            notification.error({
                message: "Lỗi",
                description: err.message || "Không thể lấy danh mục con",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubCategories();
    }, []);

    const handleToggleStatus = async (record: Category) => {
        try {
            const newStatus = record.status === "active" ? "inactive" : "active";
            await categoryApi.updateStatus(record._id, newStatus);
            fetchSubCategories();
            notification.success({
                message: "Cập nhật thành công",
                description: `Đã đổi trạng thái thành ${newStatus}`,
            });
        } catch (err: any) {
            notification.error({ message: "Lỗi", description: err.message });
        }
    };

    const columns = [
        { title: "Tên danh mục con", dataIndex: "name", key: "name" },
        { title: "Mô tả", dataIndex: "description", key: "description" },
        {
            title: "Ảnh",
            dataIndex: "image_url",
            key: "image",
            render: (images: string[]) =>
                images.length ? (
                    <img src={images[0]} alt="thumb" style={{ width: 60, borderRadius: 6 }} />
                ) : (
                    <span>No image</span>
                ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Hoạt động" : "Dừng"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_: any, record: Category) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedCategory(record);
                            setIsEditModalVisible(true);
                        }}
                    >
                        Sửa
                    </Button>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => handleToggleStatus(record)}
                    >
                        {record.status === "active" ? "Dừng" : "Hoạt động"}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card
                title="Danh mục con"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalVisible(true)}
                    >
                        Thêm
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={subCategories}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <AddSubModal
                isOpen={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
                reloadCategories={fetchSubCategories}
            />


        </motion.div>
    );
};

export default SubCategoryList;
