import React, { useState, useEffect } from "react";
import { Card, Button, Table, Input, notification, Space } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, SyncOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import brandApi from "../../api/brandApi";
import AddBrandModal from "../components/brand/addBrandModal";
import EditBrandModal from "../components/brand/editBrandModal";

interface Brand {
  key: string;
  id: string;
  brand_name: string;
  image_url?: string[];
  status?: string;
}

const removeAccents = (str: string) => str
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/Đ/g, "D");

const BrandManager: React.FC = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [searchText, setSearchText] = useState("");

  const fetchBrands = async () => {
    try {
      const response = await brandApi.getAll();
      if (!response.data.success) throw new Error(response.data.message || "Lỗi khi lấy danh sách brand");
      const brandData = response.data.result.map((brand: any) => ({
        key: brand._id,
        id: brand._id,
        brand_name: brand.brand_name,
        image_url: Array.isArray(brand.image_url) ? brand.image_url : brand.image_url ? [brand.image_url] : [],
        status: brand.status || "active",
      }));
      setBrands(brandData);
      setFilteredBrands(brandData);
    } catch (error: any) {
      console.error(error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể lấy danh sách brand!",
        placement: "topRight",
        duration: 2,
      });
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const normalizedSearchText = removeAccents(value.toLowerCase());
    setFilteredBrands(brands.filter(b => removeAccents(b.brand_name.toLowerCase()).includes(normalizedSearchText)));
  };

  const handleToggleStatus = async (record: Brand) => {
    try {
      const newStatus = record.status === "active" ? "inactive" : "active";
      const response = await brandApi.updateStatus(record.id, newStatus);
      if (!response.success) throw new Error(response.message);

      const updatedBrands = brands.map(b => b.id === record.id ? { ...b, status: newStatus } : b);
      setBrands(updatedBrands);
      setFilteredBrands(updatedBrands);

      notification.success({
        message: "Thành công",
        description: `Brand đã chuyển sang trạng thái ${newStatus === "active" ? "Hoạt động" : "Dừng hoạt động"}`,
        placement: "topRight",
        duration: 2,
      });
    } catch (error: any) {
      console.error(error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái brand!",
        placement: "topRight",
        duration: 2,
      });
    }
  };

  const columns = [
    { title: "STT", key: "stt", width: 70, render: (_: any, __: Brand, index: number) => index + 1, align: "left" as const },
    { title: "Tên thương hiệu", dataIndex: "brand_name", key: "brand_name", width: 300, align: "left" as const },
    {
      title: "Hình ảnh",
      key: "image_url",
      width: 200,
      render: (_: any, record: Brand) =>
        record.image_url && record.image_url.length > 0 ? (
          <div className="flex gap-2">
            {record.image_url.map((url, index) => (
              <img key={index} src={url} alt={`Brand ${record.brand_name}`} className="object-contain w-40 h-40" />
            ))}
          </div>
        ) : "Không có ảnh",
      align: "left" as const,
    },
    { 
      title: "Trạng thái", dataIndex: "status", key: "status", width: 150,
      render: (status: string) => status === "active" 
        ? <span className="font-medium text-green-600">Hoạt động</span> 
        : <span className="font-medium text-red-600">Dừng hoạt động</span> 
    },
    {
      title: "Hành động", key: "actions", width: 220,
      render: (_: any, record: Brand) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => { setSelectedBrand(record); setIsEditModalVisible(true); }}
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        title={
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 250 }}
            />
          </div>
        }
        bordered={false}
        className="shadow-sm"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
            Thêm thương hiệu
          </Button>
        }
      >
        <Table columns={columns} dataSource={filteredBrands} pagination={{ pageSize: 10 }} className="overflow-x-auto" />
      </Card>

      {/* modal thêm */}
      <AddBrandModal
        isOpen={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        reloadBrands={fetchBrands}
      />

      {/* modal sửa */}
      <EditBrandModal
        isOpen={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        reloadBrands={fetchBrands}
        brand={selectedBrand}
      />
    </motion.div>
  );
};

export default BrandManager;
