import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Space,
  notification,
  Upload,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import brandApi from "../../api/brandApi";
import AddBrandModal from "../components/brand/addBrandModal";

const { Title } = Typography;

interface Brand {
  key: string;
  id: string;
  brand_name: string;
  image_url?: string[];
  status?: string;
}

const removeAccents = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const BrandManager: React.FC = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const fetchBrands = async () => {
    try {
      const response = await brandApi.getAll();
      if (!response.data.success) {
        throw new Error(response.data.message || "Lỗi khi lấy danh sách brand");
      }
      const brandData = response.data.result.map((brand: any) => ({
        key: brand._id,
        id: brand._id,
        brand_name: brand.brand_name,
        image_url: Array.isArray(brand.image_url)
          ? brand.image_url
          : brand.image_url
            ? [brand.image_url]
            : [],
        status: brand.status || "active",
      }));

      setBrands(brandData);
      setFilteredBrands(brandData);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách brand:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể lấy danh sách brand!",
        placement: "topRight",
        duration: 2,
      });
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "logoutEvent") {
        setBrands([]);
        setFilteredBrands([]);
        setSearchText("");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const normalizedSearchText = removeAccents(value.toLowerCase());

    const filtered = brands.filter((brand) => {
      const normalizedBrandName = removeAccents(brand.brand_name.toLowerCase());
      return normalizedBrandName.includes(normalizedSearchText);
    });

    setFilteredBrands(filtered);
  };

  const handleToggleStatus = async (record: Brand) => {
    try {
      const newStatus = record.status === "active" ? "inactive" : "active";
      const response = await brandApi.updateStatus(record.id, newStatus);

      if (!response.success) {
        throw new Error(response.message || "Không thể cập nhật trạng thái brand");
      }

      const updatedBrands = brands.map((b) =>
        b.id === record.id ? { ...b, status: newStatus } : b
      );

      setBrands(updatedBrands);
      setFilteredBrands(updatedBrands);

      notification.success({
        message: "Thành công",
        description: `Brand đã được chuyển sang trạng thái ${newStatus === "active" ? "Hoạt động" : "Dừng hoạt động"
          }!`,
        placement: "topRight",
        duration: 2,
      });
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái brand:", error);
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái brand!",
        placement: "topRight",
        duration: 2,
      });
    }
  };


  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      render: (_: any, __: Brand, index: number) => index + 1,
      align: "left" as const,
    },
    {
      title: "Tên Brand",
      dataIndex: "brand_name",
      key: "brand_name",
      width: 300,
      align: "left" as const,
    },
    {
      title: "Hình ảnh",
      key: "image_url",
      width: 200,
      render: (_: any, record: Brand) =>
        record.image_url && record.image_url.length > 0 ? (
          <div className="flex gap-2">
            {record.image_url.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Brand ${record.brand_name}`}
                className="object-cover w-12 h-12"
              />
            ))}
          </div>
        ) : (
          "Không có ảnh"
        ),
      align: "left" as const,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) =>
        status === "active" ? (
          <span className="font-medium text-green-600">Hoạt động</span>
        ) : (
          <span className="font-medium text-red-600">Dừng hoạt động</span>
        ),
    },
    {
      title: "Chức năng",
      key: "action",
      width: 200,
      render: (_: any, record: Brand) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            type={record.status === "active" ? "default" : "primary"}
            onClick={() => handleToggleStatus(record)}
            size="small"
          >
            {record.status === "active" ? "Dừng hoạt động" : "Hoạt động"}
          </Button>
        </Space>
      ),
      align: "left" as const,
    },
  ];



  const handleEdit = (record: Brand) => {
    setSelectedBrand(record);
    form.setFieldsValue({
      brand_name: record.brand_name,
      existing_images: record.image_url || [],
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Brand) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa brand này?",
      okText: "Đồng ý",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          const response = await brandApi.delete(record.id);
          if (!response.success) {
            throw new Error(response.message || "Không thể xóa brand");
          }
          const updatedBrands = brands.filter((b) => b.key !== record.key);
          setBrands(updatedBrands);
          setFilteredBrands(updatedBrands);
          notification.success({
            message: "Thành công",
            description: "Brand đã được xóa thành công!",
            placement: "topRight",
            duration: 2,
          });
        } catch (error: any) {
          console.error("Lỗi khi xóa brand:", error);
          notification.error({
            message: "Lỗi",
            description:
              error.message || "Không thể xóa brand, có thể đang được sản phẩm sử dụng!",
            placement: "topRight",
            duration: 2,
          });
        }
      },
    });
  };

  const handleEditModalOk = () => {
    form.validateFields().then(async (values) => {
      if (!selectedBrand) return;

      try {
        const formData = new FormData();

        // brand_name
        formData.append("brand_name", values.brand_name);

        // giữ ảnh cũ nếu user không thay
        if (
          !values.image_url ||
          (values.image_url.length &&
            !values.image_url[0].originFileObj &&
            values.image_url[0].url)
        ) {
          formData.append(
            "existing_images",
            JSON.stringify(selectedBrand.image_url || [])
          );
        }

        // ảnh mới
        if (values.image_url?.length) {
          values.image_url.forEach((file: any) => {
            if (file.originFileObj) {
              formData.append("image_url", file.originFileObj);
            }
          });
        }

        const response = await brandApi.update(selectedBrand.id, formData);
        if (!response.success) {
          throw new Error(response.message || "Không thể cập nhật brand");
        }

        const updatedBrands = brands.map((b) =>
          b.key === selectedBrand.key
            ? {
              ...b,
              brand_name: response.brand.brand_name,
              image_url: Array.isArray(response.brand.image_url)
                ? response.brand.image_url
                : response.brand.image_url
                  ? [response.brand.image_url]
                  : [],
            }
            : b
        );

        setBrands(updatedBrands);
        setFilteredBrands(updatedBrands);
        setIsEditModalVisible(false);

        notification.success({
          message: "Thành công",
          description: "Brand đã được cập nhật thành công!",
          placement: "topRight",
          duration: 2,
        });
      } catch (error: any) {
        console.error("Lỗi khi cập nhật brand:", error);
        notification.error({
          message: "Lỗi",
          description: error.message || "Không thể cập nhật brand!",
          placement: "topRight",
          duration: 2,
        });
      }
    });
  };





  // const handleAddModalOk = () => {
  //   form.validateFields().then(async (values) => {
  //     try {
  //       const formData = new FormData();
  //       formData.append("brand_name", values.brand_name);

  //       // ✅ Xử lý file ảnh đúng cách
  //       if (values.image_url?.length) {
  //         values.image_url.forEach((file: any) => {
  //           if (file.originFileObj) {
  //             formData.append("image_url", file.originFileObj); // append file gốc
  //           }
  //         });
  //       }

  //       // ✅ Log toàn bộ FormData
  //       for (let [key, value] of formData.entries()) {
  //         if (value instanceof File) {
  //           console.log(`${key}: FILE`, {
  //             name: value.name,
  //             size: value.size,
  //             type: value.type,
  //           });
  //         } else {
  //           console.log(`${key}:`, value);
  //         }
  //       }

  //       // Gọi API
  //       const response = await brandApi.create(formData);
  //       if (!response.success) {
  //         throw new Error(response.message || "Không thể thêm brand");
  //       }

  //       const newBrand: Brand = {
  //         key: response.brand._id,
  //         id: response.brand._id,
  //         brand_name: response.brand.brand_name,
  //         image_url: response.brand.image_url || [],
  //       };

  //       const updatedBrands = [...brands, newBrand];
  //       setBrands(updatedBrands);
  //       setFilteredBrands(updatedBrands);
  //       setIsAddModalVisible(false);
  //       form.resetFields();

  //       notification.success({
  //         message: "Thành công",
  //         description: "Brand đã được thêm thành công!",
  //         placement: "topRight",
  //         duration: 2,
  //       });
  //     } catch (error: any) {
  //       console.error("Lỗi khi thêm brand:", error);
  //       notification.error({
  //         message: "Lỗi",
  //         description: error.message || "Không thể thêm brand!",
  //         placement: "topRight",
  //         duration: 2,
  //       });
  //     }
  //   });
  // };



  const handleModalCancel = () => {
    setIsEditModalVisible(false);
    setIsAddModalVisible(false);
    form.resetFields();
  };

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
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
            />
          </div>
        }
        bordered={false}
        className="shadow-sm"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setIsAddModalVisible(true);
            }}
          >
            Thêm Brand
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredBrands}
          pagination={{ pageSize: 10 }}
          className="overflow-x-auto"
        />
      </Card>

      {/* modal thêm */}
      <AddBrandModal
        isOpen={isAddModalVisible}
        onClose={handleModalCancel} onBrandAdded={function (newBrand: any): void {
          throw new Error("Function not implemented.");
        } }      />

      {/* modal sửa */}
      <Modal
        title="Chỉnh sửa Brand"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleModalCancel}
        okText="Lưu & Đóng"
        cancelText="Hủy bỏ"
      >
        {selectedBrand && (
          <Form form={form} layout="vertical">
            <Form.Item label="ID">
              <Input value={selectedBrand.id} disabled />
            </Form.Item>

            <Form.Item
              label="Tên Brand"
              name="brand_name"
              rules={[{ required: true, message: "Vui lòng nhập tên brand!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Hình ảnh"
              name="image_url"
              valuePropName="fileList"
              getValueFromEvent={(e) => (e && e.fileList ? e.fileList : [])}
            >
              <Upload
                listType="picture-card"
                beforeUpload={() => false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>

            </Form.Item>
          </Form>
        )}
      </Modal>


    </motion.div>
  );
};

export default BrandManager;