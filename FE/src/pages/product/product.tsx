"use client";
import React, { useEffect, useState } from "react";
import { Button, Row, Col, Typography, Select, Pagination } from "antd";
import ListCard from "../../components/products/listcard";
import Loader from "../../components/loader";
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import CustomPagination from "../../components/customPanigation/customPanigation";
import FilterPopup from "../../components/products/FilterPopup";
import { CiFilter } from "react-icons/ci";

const { Title } = Typography;
const { Option } = Select;

interface APIProduct {
  discount: number;
  _id: object | string;
  category: string;
  id: any;
  name: string;
  category_id: object | string | null;
  image: string;
  image_url: string;
  detail1: string;
  detail2: string;
  detail3: string;
  detail4: string;
  price: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  brand_id: object | string | null;
  status: string;
  tag_id: object | string | null | (string | object)[];
}

interface Category {
  _id: string;
  name: string;
}

export default function Products() {
  const [data, setData] = useState<APIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000000]);

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const categoryResponse = await categoryApi.getCategoriesActive();
        const categoryData = categoryResponse.data;
        if (categoryData.result && Array.isArray(categoryData.result)) {
          setCategories(categoryData.result);
        }

        const productResponse = await productsApi.getProductActive();
        const productData = productResponse.data;
        if (productData.result && Array.isArray(productData.result)) {
          setData(productData.result);
        } else {
          console.error("Unexpected product response structure:", productData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedData = [...data].sort((a, b) => {
    const priceA = Number(a.price) * (1 - (a.discount || 0) / 100);
    const priceB = Number(b.price) * (1 - (b.discount || 0) / 100);
    const brandA = (typeof a.brand_id === "string" ? a.brand_id : a.brand_id?._id) || "";
    const brandB = (typeof b.brand_id === "string" ? b.brand_id : b.brand_id?._id) || "";

    switch (sort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "asc":
        return priceA - priceB;
      case "desc":
        return priceB - priceA;
      case "highlight":
        return 0; // Logic tùy chỉnh cho "Nổi bật" (cần dữ liệu từ API)
      case "bestselling":
        return 0; // Logic tùy chỉnh cho "Bán chạy" (cần dữ liệu từ API)
      case "discount":
        return (b.discount || 0) - (a.discount || 0);
      case "ASUS":
        return brandA === "ASUS" ? -1 : brandB === "ASUS" ? 1 : 0;
      case "HP":
        return brandA === "HP" ? -1 : brandB === "HP" ? 1 : 0;
      case "DELL":
        return brandA === "DELL" ? -1 : brandB === "DELL" ? 1 : 0;
      case "MacBook":
        return brandA === "MacBook" ? -1 : brandB === "MacBook" ? 1 : 0;
      case "Lenovo":
        return brandA === "Lenovo" ? -1 : brandB === "Lenovo" ? 1 : 0;
      case "Acer":
        return brandA === "Acer" ? -1 : brandB === "Acer" ? 1 : 0;
      case "MSI":
        return brandA === "MSI" ? -1 : brandB === "MSI" ? 1 : 0;
      case "GIGABYTE":
        return brandA === "GIGABYTE" ? -1 : brandB === "GIGABYTE" ? 1 : 0;
      case "LaptopAI":
        return brandA === "LaptopAI" ? -1 : brandB === "LaptopAI" ? 1 : 0;
      case "LaptopGaming":
        return brandA === "LaptopGaming" ? -1 : brandB === "LaptopGaming" ? 1 : 0;
      case "Samsung":
        return brandA === "Samsung" ? -1 : brandB === "Samsung" ? 1 : 0;
      default:
        return 0;
    }
  });

  const filteredData = sortedData.filter((item) => {
    const price = Number(item.price) * (1 - (item.discount || 0) / 100);
    return price >= priceRange[0] && price <= priceRange[1];
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [sort, priceRange]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="mx-auto mb-4 mt-4 w-full max-w-full sm:px-3 md:px-7 lg:px-14 xl:px-[154px] bg-[#e8e8e8]/[0.5] py-3">
      <div className="mt-6">
        <Col
          className="flex-grow px-2 py-4 bg-white rounded-lg shadow-md lg:px-4"
          xs={24}
          sm={24}
          md={24}
          lg={24}
          style={{ height: "fit-content" }}
        >
          <div className="flex flex-col w-full pb-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setOpenFilter(true)}>
                <CiFilter />
                <p>Lọc</p>
              </Button>
              <Button className="text-xs" onClick={() => setSort("ASUS")}>ASUS</Button>
              <Button className="text-xs" onClick={() => setSort("HP")}>HP</Button>
              <Button className="text-xs" onClick={() => setSort("DELL")}>DELL</Button>
              <Button className="text-xs" onClick={() => setSort("MacBook")}>MacBook</Button>
              <Button className="text-xs" onClick={() => setSort("Lenovo")}>Lenovo</Button>
              <Button className="text-xs" onClick={() => setSort("Acer")}>Acer</Button>
              <Button className="text-xs" onClick={() => setSort("MSI")}>MSI</Button>
              <Button className="text-xs" onClick={() => setSort("GIGABYTE")}>GIGABYTE</Button>
              <Button className="text-xs" onClick={() => setSort("LaptopAI")}>Laptop AI</Button>
              <Button className="text-xs" onClick={() => setSort("LaptopGaming")}>Laptop Gaming</Button>
              <Button className="text-xs" onClick={() => setSort("Samsung")}>Samsung</Button>
            </div>

            {/* Phần sắp xếp */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-700">Sắp xếp theo:</span>
              <Button
                className={`text-xs ${sort === "highlight" ? "text-blue-600" : "text-gray-700"}`}
                onClick={() => setSort("highlight")}
              >
                Nổi bật
              </Button>
              <Button
                className={`text-xs ${sort === "bestselling" ? "text-blue-600" : "text-gray-700"}`}
                onClick={() => setSort("bestselling")}
              >
                Bán chạy
              </Button>
              <Button
                className={`text-xs ${sort === "discount" ? "text-blue-600" : "text-gray-700"}`}
                onClick={() => setSort("discount")}
              >
                Giảm giá
              </Button>
              <Button
                className={`text-xs ${sort === "newest" ? "text-blue-600" : "text-gray-700"}`}
                onClick={() => setSort("newest")}
              >
                Mới
              </Button>
              <Select
                className="w-full min-w-[100px] sm:w-auto"
                value={sort === "asc" || sort === "desc" ? sort : "price"}
                onChange={(value) => setSort(value)}
                dropdownStyle={{ borderRadius: "8px" }}
                size="small"
              >
                <Option value="asc">Thấp - Cao</Option>
                <Option value="desc">Cao - Thấp</Option>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-60">
              <Loader />
            </div>
          ) : currentPageData.length > 0 ? (
            <div
              className="grid gap-4 xs:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              style={{
                height: "auto",
                minHeight: currentPageData.length > 0 ? "auto" : "60vh",
              }}
            >
              {currentPageData.map((product, index) => (
                <ListCard key={`${product._id}-${index}`} pros={{ data: [product] }} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-60">
              <Title level={4} className="text-sm text-gray-600">
                Không tìm thấy sản phẩm nào
              </Title>
              <p className="text-xs text-gray-500">
                Vui lòng thử lại với bộ lọc khác
              </p>
            </div>
          )}
        </Col>
      </div>

      {filteredData.length > 0 && (
        <CustomPagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      <FilterPopup
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={(filters) => setPriceRange(filters.priceRange)}
      />
    </div>
  );
}