import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  notification,
  Select,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Typography } from 'antd';
import categoryApi from '../../api/categoryApi';
import AddCategoryModal from '../components/category/addModal';
import EditCategoryModal from '../components/category/editModal';

const { Title } = Typography;
const { Option } = Select;

interface Category {
  key: string;
  _id: string;
  name: string;
  description: string;
  status: string;
  image_url: string[];
}

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const CategoryList: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();


  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getParents();
      const data = response.data || response;

      if (!data?.success) {
        throw new Error(data?.message || 'Lỗi khi lấy danh sách category');
      }

      const categoryData: Category[] = data.result.map((category: any) => ({
        key: category._id,
        _id: category._id,
        name: category.name || '',
        description: category.description || '',
        image_url: Array.isArray(category.image_url)
          ? category.image_url
          : category.image_url
            ? [category.image_url]
            : [],
        status: category.status === "active" ? "active" : "inactive",
      }));

      setCategories(categoryData);
      setFilteredCategories(categoryData);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể lấy danh sách category!',
        placement: 'topRight',
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await categoryApi.getParents();
        const data = response.data || response;
        if (!data?.result) {
          throw new Error("API không trả về result");
        }

        const fetchedCategories = data.result.map((category: any) => ({
          key: category._id,
          _id: category._id,
          name: category.name,
          description: category.description,
          status: category.status || "active",
          image_url: Array.isArray(category.image_url)
            ? category.image_url
            : category.image_url
              ? [category.image_url]
              : [],
        }));

        setCategories(fetchedCategories);
        setFilteredCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);


  const handleSearch = (value: string) => {
    setSearchText(value);
    const normalizedSearchText = removeAccents(value.toLowerCase());

    const filtered = categories.filter(category => {
      const normalizedCategoryName = removeAccents(category.name.toLowerCase());
      return normalizedCategoryName.includes(normalizedSearchText);
    });

    setFilteredCategories(filtered);
  };

  const handleToggleStatus = async (record: Category) => {
    try {
      const newStatus = record.status === "active" ? "inactive" : "active";

      const response = await categoryApi.updateStatus(record._id, newStatus);
      if (!response.success) throw new Error(response.message);

      const updatedCategories = categories.map(c =>
        c._id === record._id ? { ...c, status: newStatus } : c
      );

      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);

      notification.success({
        message: "Thành công",
        description: `Danh mục đã chuyển sang trạng thái ${newStatus === "active" ? "Hoạt động" : "Dừng hoạt động"
          }`,
        placement: "topRight",
        duration: 2,
      });
    } catch (error: any) {
      console.error(error);
      notification.error({
        message: "Lỗi",
        description: error.response?.data?.message || error.message || "Không thể cập nhật trạng thái danh mục!",
        placement: "topRight",
        duration: 2,
      });
    }
  };




  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: any, __: Category, index: number) => index + 1,
    },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name', width: 350 },
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image',
      width: 250,
      render: (images: string[]) =>
        images && images.length ? (
          <img
            src={images[0]}
            alt="thumb"
            style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 6 }}
          />
        ) : (
          <div style={{
            width: 80,
            height: 56,
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            color: '#9ca3af',
            fontSize: 12,
          }}>
            No image
          </div>
        ),
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Hoạt động" : "Dừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Hành động", key: "actions", width: 220,
      render: (_: any, record: Category) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => { setSelectedCategory(record); setIsEditModalVisible(true); }}
          >
            Sửa
          </Button>
          <Button
            icon={<SyncOutlined />}
            size="small"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === "active" ? "Dừng" : "Hoạt động"}
          </Button>
        </Space>
      ),
    },

  ];


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title={
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
          </div>
        }
        bordered={false}
        className="shadow-sm"
        extra={
          <div className="space-x-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      {/* modal thêm */}
      <AddCategoryModal
        isOpen={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        reloadCategories={fetchCategories}
      />


      <EditCategoryModal
        isOpen={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        reloadCategories={fetchCategories}
        category={selectedCategory}
      />

    </motion.div>
  );
};

export default CategoryList;