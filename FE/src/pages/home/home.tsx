"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaUserEdit, FaCalendarAlt } from "react-icons/fa";
import { Button, Space } from "antd";
import Slider from "react-slick";
import ProductSlider from "../../components/home/ProductSlider";
import CateProduct from "../../components/cateproduct";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import productsApi from "../../api/productsApi";
import categoryApi from "../../api/categoryApi";
import BlogApi from "../../api/blogApi";
import parse from "html-react-parser";
import { Link } from "react-router-dom";
import Loader from "../../components/loading/loader";

export default function Home() {
  const [newProduct, setNewProduct] = useState([]);
  const [saleProduct, setSaleProduct] = useState([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{ [key: string]: any[] }>({});
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [newProductLoading, setNewProductLoading] = useState(true);
  const [saleProductLoading, setSaleProductLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const images = [
    "/images/banners/1.png",
    "/images/banners/2.png",
    "/images/banners/3.png",
    "/images/banners/4.png",
    "/images/banners/5.png",
  ];

  const sliderRef = useRef<any>(null);

  // Dữ liệu mẫu cho ba dịch vụ
  const petServices = [
    {
      title: "Tắm & Vệ sinh",
      description: "Dịch vụ tắm rửa và làm sạch toàn diện cho thú cưng.",
      image: "/images/pngegg.png",
      link: "/info",
    },
    {
      title: "Cắt & Tỉa lông",
      description: "Cắt tỉa lông chuyên nghiệp, tạo kiểu theo yêu cầu.",
      image: "/images/cut.png",
      link: "/info",
    },

  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesResponse = await categoryApi.getCategoriesActive();
        const categoriesData = await categoriesResponse.data.result;
        setCategories(categoriesData || []);
        setCategoriesLoading(false);

        setNewProductLoading(true);
        const newProductResponse = await productsApi.getNewProducts();
        const newProductData = newProductResponse.data.result;
        setNewProduct(newProductData || []);
        setNewProductLoading(false);

        setSaleProductLoading(true);
        const saleProductResponse = await productsApi.getSaleproducts();
        const saleProductData = await saleProductResponse.data.result;
        setSaleProduct(saleProductData || []);
        setSaleProductLoading(false);

        setBlogsLoading(true);
        const blogResponse = await BlogApi.getBlogActive();
        const blogData = await blogResponse.data.data;
        setBlogs(blogData || []);
        setBlogsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setCategories([]);
        setNewProduct([]);
        setSaleProduct([]);
        setBlogs([]);
        setCategoriesLoading(false);
        setNewProductLoading(false);
        setSaleProductLoading(false);
        setBlogsLoading(false);
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
        <ProductSlider title="SẢN PHẨM MỚI" data={newProduct} loading={newProductLoading} />
      </div>

      {/* Sản phẩm giảm giá */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <ProductSlider title="SẢN PHẨM GIẢM GIÁ" data={saleProduct} loading={saleProductLoading} />
      </div>

      {/* Dịch vụ thú cưng */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <div className="relative px-6 py-2 border rounded-t-lg w-fit border-primary-200">
          <div className="absolute px-2 bg-white -top-8 left-4">
            <img
              src="/images/icons/paw.png"
              alt="Paw Icon"
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-[50px] md:w-[50px]"
            />
          </div>

          <h2 className="relative z-20 text-lg font-semibold text-left sm:text-xl">
            DỊCH VỤ THÚ CƯNG
          </h2>
        </div>

        {/* Nội dung */}
        <div className="p-8 mt-6 overflow-hidden border border-gray-200 shadow-md bg-bg-primary-50 rounded-xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">

            {/* Hình minh họa bên trái */}
            <div className="flex justify-center md:w-1/3">
              <img
                src="/images/services.png"
                alt="Pet Care Services"
                className="object-contain transition-transform duration-500 h-72 hover:scale-105"
              />
            </div>

            {/* Grid dịch vụ + CTA */}
            <div className="grid grid-cols-2 gap-6 md:w-2/3">
              {petServices.map((service, index) => (
                <Link
                  key={index}
                  to={service.link}
                  className="flex flex-col items-center p-5 transition-all bg-white shadow-md rounded-xl hover:shadow-xl hover:-translate-y-1"
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="object-contain w-16 h-16 mb-3"
                  />
                  <h3 className="text-sm font-semibold text-center text-gray-800">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-xs text-center text-gray-600">
                    {service.description}
                  </p>
                </Link>
              ))}

              {/* CTA Khám phá ngay */}
              <div className="flex justify-center col-span-2 mt-4">
                <Link to="/info">
                  <button className="px-8 py-3 text-sm font-semibold text-white transition-all duration-300 rounded-full shadow-lg bg-primary-500 hover:bg-primary-600 hover:scale-110 hover:shadow-xl">
                    Khám phá ngay →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Bài viết */}
      <div className="relative mt-[30px] rounded-lg p-6 px-4 sm:px-[40px] lg:px-[154px]">
        <div className="relative px-6 py-2 border rounded-t-lg w-fit border-primary-200 ">
          <div className="absolute px-2 bg-white -top-8 left-4">
            <img
              src="/images/icons/paw.png"
              alt="Paw Icon"
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-[50px] md:w-[50px]"
            />
          </div>

          <h2 className="relative z-20 text-lg font-semibold text-left sm:text-xl">
            BÀI VIẾT
          </h2>
        </div>
        <div className="p-4 mt-4 bg-white border rounded-lg shadow-sm sm:p-6 md:p-8 lg:p-10 ">
          {blogsLoading ? (
            <div className="flex items-center justify-center h-60">
              <Loader />
            </div>
          ) : blogs.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-sm font-bold tracking-wider uppercase sm:text-base md:text-lg">
                  CÓ THỂ BẠN MUỐN BIẾT
                </h3>
                <a
                  href="/blogs"
                  className="text-xs font-medium text-gray-500 transition-colors hover:text-primary-500 hover:underline sm:text-sm"
                >
                  Tin tức khác »
                </a>
              </div>
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
                      <FaUserEdit className="text-primary-500" />
                      <span className="flex gap-1">
                        by <span className="font-semibold">{blogs[0].author}</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <FaCalendarAlt className="text-primary-500" />
                      <span>{new Date(blogs[0].createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <p className="mb-4 text-xs leading-relaxed text-gray-700 sm:text-sm md:mb-6">
                    {parse(blogs[0].content.slice(0, 1000) + "...")}
                  </p>
                  <Link to={`/blogs/${blogs[0]._id}`}>
                    <button className="flex items-center self-start gap-2 px-4 py-2 text-xs font-medium transition-all border rounded-md group border-primary-200 text-primary-500 hover:bg-primary-500 hover:text-white sm:text-sm">
                      Đọc thêm
                      <span className="transition-transform transform group-hover:translate-x-1">»</span>
                    </button>
                  </Link>
                </div>
              </div>
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
                      <h5 className="text-xs font-medium leading-tight transition-colors group-hover:text-primary-500 sm:text-sm md:text-base">
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
          ) : (
            <p className="text-center text-gray-500">Không có bài viết nào để hiển thị.</p>
          )}
        </div>
      </div>
    </>
  );
}