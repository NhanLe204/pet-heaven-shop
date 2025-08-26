"use client";
import React, { useEffect, useRef } from "react";
import { FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loader from "../loading/loader";

interface Product {
  _id: string;
  name: string;
  price: number;
  image_url: string[];
  discount: number;
  quantity: number;
}

interface ProductSliderProps {
  title: string;
  data: Product[];
  loading?: boolean; // Thêm prop loading
}

const ProductSlider: React.FC<ProductSliderProps> = ({ title, data, loading = false }) => {
  const sliderRef = useRef<any>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBuyNow = (product: Product) => {
    navigate(`/detail/${product._id}`);
  };

  const handlePrevSlide = () => {
    if (sliderRef.current) sliderRef.current.slickPrev();
  };

  const handleNextSlide = () => {
    if (sliderRef.current) sliderRef.current.slickNext();
  };

  useEffect(() => {
    const handleResize = () => { };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  // Hiển thị Loader khi loading là true
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative ml-[15px] w-[200px] rounded-t-lg border-l border-r border-t border-primary-500 px-2 py-2 sm:ml-[30px] sm:w-[250px] sm:px-4 md:w-[300px]">
            <div className="absolute z-10 px-2 bg-white -top-7 left-3">
              <img
                src="/images/icons/paw.png"
                alt="Paw Icon"
                className="h-8 w-8 sm:h-12 sm:w-12 md:h-[50px] md:w-[50px]"
              />
            </div>
            <h2 className="relative z-20 text-base font-semibold text-center sm:text-lg">
              {title.toUpperCase()}
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-center h-60">
          <Loader />
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu và không loading, trả về null
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative px-6 py-2 border rounded-t-lg w-fit border-primary-200">
          <div className="absolute px-2 bg-white -top-8 left-4">
            <img
              src="/images/icons/paw.png"
              alt="Paw Icon"
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-[50px] md:w-[50px]"
            />
          </div>

          <h2 className="relative z-20 text-lg font-semibold text-left sm:text-xl">
            {title.toUpperCase()}
          </h2>
        </div>

      </div>

      {/* Products Slider */}
      <div className="relative overflow-hidden rounded-xl border-2 px-6 py-[25px] sm:rounded-3xl sm:border-4 sm:px-6 sm:py-[50px] custom-dots">
        <Slider ref={sliderRef} {...settings}>
          {data.map((product, index) => (
            <div key={`${product._id}-${index}`} className="px-2">
              <div className="w-full p-4 min-h-[340px] flex flex-col justify-between transition bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg">
                <div>
                  <div className="relative flex items-center justify-center">
                    <Link to={`/detail/${product._id}`}>
                      <img
                        src={product.image_url[0] || "/placeholder-image.jpg"}
                        alt={product.name}
                        className="object-cover w-full transition-transform duration-500 rounded-md hover:scale-105 h-[140px]"
                      />
                    </Link>
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold text-[#FF0000] bg-white border border-red-500 rounded-md">
                        {product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-4 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary-500">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(Number(product.price * (1 - product.discount / 100)))}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(product.price))}
                        </span>
                      )}
                    </div>
                    <button className="text-gray-500 hover:text-red-500">
                      <FaHeart />
                    </button>
                  </div>
                  <p className="px-4 mt-2 text-sm text-center text-gray-700 line-clamp-2">
                    {product.name}
                  </p>
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    className="px-6 py-2 font-medium text-white border border-transparent rounded-md bg-primary-500 hover:bg-white hover:text-primary-600 hover:border-primary-600"
                    onClick={() => handleBuyNow(product)}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
        <button
          className="absolute z-20 p-2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full shadow left-2 top-1/2 hover:bg-gray-100"
          onClick={handlePrevSlide}
        >
          <FaChevronLeft className="text-primary-500" />
        </button>
        <button
          className="absolute z-20 p-2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-full shadow right-2 top-1/2 hover:bg-gray-100"
          onClick={handleNextSlide}
        >
          <FaChevronRight className="text-primary-500" />
        </button>
      </div>
    </div>
  );
};

export default ProductSlider;