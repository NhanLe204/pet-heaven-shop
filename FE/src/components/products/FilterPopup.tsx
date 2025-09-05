// FilterPopup.tsx
import React, { useState, useEffect } from "react";
import { Button, Checkbox, Modal, Radio } from "antd";
import { Row, Col } from "antd";
import brandApi from "../../api/brandApi";

interface Brand {
  _id: string;
  name: string;
  image_url: string; // Giả định API trả về URL hình ảnh
}

interface FilterPopupProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const FilterPopup: React.FC<FilterPopupProps> = ({ open, onClose, onApply }) => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<string[]>([]);
  const [selectedScreenSize, setSelectedScreenSize] = useState<string[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const priceRanges = [
    { id: "under150", label: "0đ - 150,000đ" },
    { id: "150to300", label: "150,000đ - 300,000đ" },
    { id: "300to500", label: "300,000đ - 500,000đ" },
    { id: "500to700", label: "500,000đ - 700,000đ" },
    { id: "above700", label: "700,000đ - Trên lên" },
  ];

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await brandApi.getAll(); // Giả định API method
        if (response.data.result && Array.isArray(response.data.result)) {
          setBrands(response.data.result);
        } else {
          console.error("Unexpected brand response structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  const handleApply = () => {
    const filters = {
      brands: selectedBrands,
      priceRange: selectedPriceRange,
      productTypes: selectedProductType,
      screenSizes: selectedScreenSize,
    };
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      title="Lọc sản phẩm"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="apply" type="primary" onClick={handleApply}>
          Áp dụng
        </Button>,
      ]}
      centered
      width={900} // Đặt chiều rộng thành 900px
      style={{ maxHeight: "460px", overflowY: "auto" }} // Giới hạn chiều cao thành 460px và thêm scroll nếu cần
      bodyStyle={{ padding: "16px" }} // Điều chỉnh padding bên trong
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Hãng</h3>
          <Checkbox.Group
            value={selectedBrands}
            onChange={(values) => setSelectedBrands(values as string[])}
            style={{ width: "100%" }}
          >
            <Row>
              {brands.map((brand) => (
                <Col span={12} key={brand._id}>
                  <Checkbox value={brand.name}>
                    <Button style={{ padding: 0, border: "none" }}>
                      <img src={brand.image_url} alt={brand.name} style={{ width: "24px", height: "24px" }} />
                      <span style={{ marginLeft: "8px" }}>{brand.name}</span>
                    </Button>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Giá</h3>
          <Radio.Group
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            style={{ width: "100%" }}
          >
            <Row>
              {priceRanges.map((range) => (
                <Col span={24} key={range.id} style={{ marginBottom: "8px" }}>
                  <Radio value={range.id}>{range.label}</Radio>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Loại sản phẩm</h3>
          <Checkbox.Group
            value={selectedProductType}
            onChange={(values) => setSelectedProductType(values as string[])}
            style={{ width: "100%" }}
          >
            <Row>
              <Col span={12}><Checkbox value="LaptopAI">Laptop AI</Checkbox></Col>
              <Col span={12}><Checkbox value="Gaming">Gaming</Checkbox></Col>
              <Col span={12}><Checkbox value="Kythuat">Kỹ thuật</Checkbox></Col>
              <Col span={12}><Checkbox value="Mongnhe">Mỏng nhẹ</Checkbox></Col>
              <Col span={12}><Checkbox value="Caocap">Cao cấp</Checkbox></Col>
            </Row>
          </Checkbox.Group>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Kích cỡ màn hình</h3>
          <Checkbox.Group
            value={selectedScreenSize}
            onChange={(values) => setSelectedScreenSize(values as string[])}
            style={{ width: "100%" }}
          >
            <Row>
              <Col span={12}><Checkbox value="14">Dưới 14 inch</Checkbox></Col>
              <Col span={12}><Checkbox value="14-15">14 - 15 inch</Checkbox></Col>
              <Col span={12}><Checkbox value="15-16">15 - 16 inch</Checkbox></Col>
              <Col span={12}><Checkbox value="16">Trên 16 inch</Checkbox></Col>
            </Row>
          </Checkbox.Group>
        </div>
        <Button type="primary" block onClick={handleApply}>
          Áp dụng
        </Button>
      </div>
    </Modal>
  );
};

export default FilterPopup;