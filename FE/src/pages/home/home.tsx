"use client";
import React from "react";
import { FaUserEdit, FaCalendarAlt } from "react-icons/fa";
import { Button, Space } from "antd";
import Slider from "react-slick";
import { useState, useEffect, useRef } from "react";
import ProductSlider from "../../components/home/ProductSlider";
import CateProduct from "../../components/cateproduct";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ENV_VARS from "../../../config";
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import BlogApi from "../../api/blogApi";
import parse from "html-react-parser";
import { Link } from "react-router-dom";

export default function Home() {
  const [newProduct, setNewProduct] = useState([]);
  const [saleProduct, setSaleProduct] = useState([]);
  const [hotProduct, setHotProduct] = useState([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: string]: any[] }>({});
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  const images = [
    "/images/banners/1.png",
    "/images/banners/2.png",
    "/images/banners/3.png",
    "/images/banners/4.png",
    "/images/banners/5.png",
  ];

  const sliderRef = useRef<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categoriesResponse = await categoryApi.getCategoriesActive();
        const categoriesData = await categoriesResponse.data.result;
        setCategories(categoriesData);

        const newProductResponse = await productsApi.getNewProducts();
        const newProductData = newProductResponse.data.result;
        setNewProduct(newProductData || []);

        const saleProductResponse = await productsApi.getSaleproducts();
        const saleProductData = await saleProductResponse.data.result;
        setSaleProduct(saleProductData || []);

        const hotProductResponse = await productsApi.getHotproducts();
        const hotProductData = await hotProductResponse.data.result;
        setHotProduct(hotProductData || []);

        const blogResponse = await BlogApi.getBlogActive();
        const blogData = await blogResponse.data.data;
        setBlogs(blogData || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setCategories([]);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (categories.length === 0) return;

      try {
        const categoryPromises = categories.map(async (category) => {
          const productResponse = await productsApi.getProductByCategoryID(category._id);
          const productData = await productResponse.data.result;
          const limitedProducts = productData ? productData.slice(0, 8) : [];
          return { [category.name]: limitedProducts };
        });

        const categoryProducts = await Promise.all(categoryPromises);
        const productsMap = categoryProducts.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setProductsByCategory(productsMap);
      } catch (error) {
        console.error("Error fetching products by category:", error);
        setProductsByCategory({});
      }
    };
    fetchProductsByCategory();
  }, [categories]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    fade: true,
    appendDots: (dots) => (
      <div className="flex justify-center py-4 custom-dots-container">
        <ul>{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 transition-all duration-300 bg-white rounded-full"></div>
    ),
  };

  return (
    <>
      {/* Banner */}
      <div className="mt-4 px-4 sm:px-[40px] lg:px-[154px]">
        <Slider ref={sliderRef} {...settings}>
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Banner ${index + 1}`}
                className="object-cover w-full"
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Sản phẩm mới */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <ProductSlider title="SẢN PHẨM MỚI" data={newProduct} />
      </div>

      {/* Sản phẩm giảm giá */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <ProductSlider title="SẢN PHẨM GIẢM GIÁ" data={saleProduct} />
      </div>

      {/* Dịch vụ thú cưng */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <div className="relative ml-[15px] w-[200px] rounded-t-lg border-l border-r border-t border-[#1890ff] px-2 py-2 sm:ml-[30px] sm:w-[250px] sm:px-4 md:w-[300px]">
          <div className="absolute z-10 px-2 bg-white -top-7 left-3">
            <img
              src="/images/icons/paw.png"
              alt="Paw Icon"
              className="h-8 w-8 sm:h-12 sm:w-12 md:h-[50px] md:w-[50px]"
            />
          </div>
          <h2 className="relative z-20 text-base font-semibold text-center sm:text-lg">
            DỊCH VỤ THÚ CƯNG
          </h2>
        </div>
        <div className="mt-4 bg-gradient-to-r from-[#f8e1e1] to-[#e0f7fa] rounded-lg overflow-hidden shadow-lg p-6">
          <div className="flex flex-col items-center md:flex-row md:items-start">
            <div className="md:w-1/2">
              <img
                src="/images/services/pet-care.jpg"
                alt="Pet Care Services"
                className="object-cover w-full h-64 rounded-lg md:rounded-none md:rounded-l-lg"
              />
            </div>
            <div className="p-4 text-center md:w-1/2 md:p-6 md:text-left">
              <p className="mb-4 text-sm text-gray-600 sm:text-base md:text-lg">
                Chúng tôi cung cấp các dịch vụ chăm sóc toàn diện cho thú cưng của bạn, bao gồm tắm rửa, cắt tỉa lông, kiểm tra sức khỏe và tư vấn dinh dưỡng. Hãy để chúng tôi giúp thú cưng của bạn luôn khỏe mạnh và hạnh phúc!
              </p>
              <Link to="/services">
                <button className="px-4 py-2 bg-[#1890ff] text-white rounded-md hover:bg-[#40a9ff] transition-colors text-sm sm:text-base">
                  Khám phá dịch vụ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bài viết */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <div className="relative ml-[15px] w-[200px] rounded-t-lg border-l border-r border-t border-[#1890ff] px-2 py-2 sm:ml-[30px] sm:w-[250px] sm:px-4 md:w-[300px]">
          <div className="absolute z-10 px-2 bg-white -top-7 left-3">
            <img
              src="/images/icons/paw.png"
              alt="Paw Icon"
              className="h-8 w-8 sm:h-12 sm:w-12 md:h-[50px] md:w-[50px]"
            />
          </div>
          <h2 className="relative z-20 text-base font-semibold text-center sm:text-lg">
            BÀI VIẾT
          </h2>
        </div>
        <div className="p-4 mt-4 bg-white border rounded-lg shadow-sm sm:p-6 md:p-8 lg:p-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-sm font-bold tracking-wider uppercase sm:text-base md:text-lg">
              CÓ THỂ BẠN MUỐN BIẾT
            </h3>
            <a
              href="/blogs"
              className="text-xs font-medium text-gray-500 transition-colors hover:text-[#22A6DF] hover:underline sm:text-sm"
            >
              Tin tức khác »
            </a>
          </div>

          {blogs.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-12 lg:gap-6 xl:gap-8">
              <div className="lg:col-span-6">
                <div className="relative h-[200px] w-full overflow-hidden rounded-lg sm:h-[250px] md:h-[300px]">
                  <img
                    src={blogs[0].image_url || "/images/brands/concho.png"}
                    alt={blogs[0].title}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
              <div className="flex flex-col lg:col-span-6">
                <h4 className="mb-2 text-base font-bold leading-tight sm:text-lg md:text-xl">
                  {blogs[0].title}
                </h4>
                <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500 sm:text-sm">
                  <span className="flex items-center gap-2">
                    <FaUserEdit className="text-[#22A6DF]" />
                    <span className="flex gap-1">
                      by <span className="font-semibold">{blogs[0].author}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[#22A6DF]" />
                    <span>{new Date(blogs[0].createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-gray-700 sm:text-sm md:mb-6">
                  {parse(blogs[0].content.slice(0, 1000) + "...")}
                </p>
                <Link to={`/blogs/${blogs[0]._id}`}>
                  <button className="group flex items-center gap-2 self-start rounded-md border border-[#22A6DF] px-4 py-2 text-xs font-medium text-[#22A6DF] transition-all hover:bg-[#22A6DF] hover:text-white sm:text-sm">
                    Đọc thêm
                    <span className="transition-transform transform group-hover:translate-x-1">»</span>
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Không có bài viết nào để hiển thị.</p>
          )}

          <div className="grid gap-4 mt-6 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {blogs.slice(1, 4).map((blog, index) => (
              <Link
                to={`/blogs/${blog._id}`}
                key={index}
                className="flex items-start gap-3 group sm:gap-4"
              >
                <div className="relative h-[80px] w-[100px] min-w-[100px] overflow-hidden rounded-lg sm:h-[100px] sm:w-[120px] sm:min-w-[120px] md:h-[120px] md:w-[140px] md:min-w-[140px]">
                  <img
                    src={blog.image_url || "/images/brands/concho.png"}
                    alt={blog.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col">
                  <h5 className="text-xs font-medium leading-tight transition-colors group-hover:text-[#22A6DF] sm:text-sm md:text-base">
                    {blog.title}
                  </h5>
                  <time className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}