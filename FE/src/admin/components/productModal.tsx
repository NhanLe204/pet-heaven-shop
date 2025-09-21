import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  InputNumber,
  Row,
  Col,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import brandApi from "../../api/brandApi";
import tagApi from "../../api/tagApi";
import ProductPreview from "./product/ProductPreview";

const { Option } = Select;

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  onReload: () => void;
  product?: any | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  onClose,
  onReload,
  product,
}) => {
  const [form] = Form.useForm();
  const [imageFileList, setImageFileList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories, brands, tags
  useEffect(() => {
    if (!visible) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, brandRes, tagRes] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll(),
          tagApi.getAll(),
        ]);
        setCategories(catRes.data.result || []);
        setBrands(brandRes.data.result || []);
        setTags(tagRes.data.result || []);
      } catch (error) {
        message.error("Không tải được danh mục/thương hiệu/tags");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [visible]);

  useEffect(() => {
    if (product && visible) {
      form.setFieldsValue({
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        discount: product.discount || 0,
        status: product.status,
        category_id: product.category_id?._id || product.category_id,
        brand_id: product.brand_id?._id || product.brand_id,
        tag_id: product.tag_id?._id || product.tag_id,
        description: product.description || "",
      });

      const formattedImages = (product.images || []).map(
        (url: string, idx: number) => ({
          uid: `-${idx}`,
          name: `image-${idx}.png`,
          status: "done",
          url,
          index: idx,
        })
      );
      setImageFileList(formattedImages);
    } else {
      form.resetFields();
      setImageFileList([]);
    }
  }, [product, visible, form]);

  const handleImageChange = ({ fileList }: any) => {
    setImageFileList(fileList);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("price", values.price?.toString() || "");
      formData.append("quantity", values.quantity?.toString() || "0");
      formData.append("discount", values.discount?.toString() || "0");
      formData.append("status", values.status || "");
      formData.append("category_id", values.category_id || "");
      formData.append("brand_id", values.brand_id || "");
      formData.append("tag_id", values.tag_id || "");
      formData.append("description", values.description || "");

      const originalImages = product?.images || [];
      const existingImages: string[] = [];
      const newImages: { file: any; index: number }[] = [];

      imageFileList.forEach((file) => {
        if (file.url && !file.originFileObj) {
          if (originalImages.includes(file.url)) {
            existingImages.push(file.url);
          }
        } else if (file.originFileObj) {
          newImages.push({
            file: file.originFileObj,
            index: file.index ?? originalImages.length + newImages.length,
          });
        }
      });

      if (existingImages.length > 0) {
        formData.append("existing_images", JSON.stringify(existingImages));
      }
      if (newImages.length > 0) {
        formData.append(
          "new_images",
          JSON.stringify(newImages.map((img) => ({ index: img.index })))
        );
        newImages.forEach((img) => formData.append("images_url", img.file));
      }

      if (product) {
        await productsApi.update(product._id, formData);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        await productsApi.create(formData);
        message.success("Thêm sản phẩm thành công!");
      }

      onReload();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Lấy giá trị form để preview
  const values = Form.useWatch([], form);

  return (
    <Modal
      title={product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={1000}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <Row gutter={16}>
          {/* Form bên trái */}
          <Col span={12}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="quantity" label="Số lượng">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item
                name="price"
                label="Giá"
                rules={[{ required: true, message: "Nhập giá" }]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>
              <Form.Item name="discount" label="Giảm giá (%)">
                <InputNumber min={0} max={100} className="w-full" />
              </Form.Item>
              <Form.Item name="status" label="Tình trạng">
                <Select>
                  <Option value="available">Còn hàng</Option>
                  <Option value="out_of_stock">Hết hàng</Option>
                </Select>
              </Form.Item>
              <Form.Item name="category_id" label="Danh mục">
                <Select>
                  {categories.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="brand_id" label="Thương hiệu">
                <Select allowClear>
                  {brands.map((b) => (
                    <Option key={b._id} value={b._id}>
                      {b.brand_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="tag_id" label="Tag">
                <Select allowClear>
                  {tags.map((t) => (
                    <Option key={t._id} value={t._id}>
                      {t.tag_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="description" label="Mô tả sản phẩm">
                <ReactQuill
                  theme="snow"
                  value={form.getFieldValue("description")}
                  onChange={(val) => form.setFieldsValue({ description: val })}
                />
              </Form.Item>
              <Form.Item label="Ảnh sản phẩm">
                <Upload
                  listType="picture-card"
                  fileList={imageFileList}
                  onChange={handleImageChange}
                  beforeUpload={() => false}
                  multiple
                >
                  {imageFileList.length < 5 && (
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  )}
                </Upload>
              </Form.Item>
            </Form>
          </Col>

          {/* Preview bên phải */}
          <Col span={12}>
            <ProductPreview
              product={{
                ...values,
                image: imageFileList[0]?.url || "",
              }}
            />
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};

export default ProductModal;
