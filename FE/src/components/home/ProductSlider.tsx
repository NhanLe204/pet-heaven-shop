"use client";
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ListCard from "../products/listcard";

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
}

const ProductSlider: React.FC<ProductSliderProps> = ({ title, data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);

  // responsive items per slide
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerSlide(1); // mobile
      else if (window.innerWidth < 1024) setItemsPerSlide(2); // tablet
      else setItemsPerSlide(4); // desktop
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, data.length - itemsPerSlide);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  return (
    <div className="p-6">
      {/* Title */}
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

      {/* Slider box luôn có border */}
      <div className="relative px-4 py-6 overflow-hidden bg-white border-2 rounded-xl sm:rounded-3xl sm:border-4">
        <div
          className="flex transition-transform duration-500"
          style={{
            width: `${(100 / itemsPerSlide) * data.length}%`,
            transform: `translateX(-${(100 / data.length) * currentIndex}%)`,
          }}
        >
          {data.map((product) => (
            <div
              key={product._id}
              className="px-2"
              style={{ width: `${100 / data.length}%` }}
            >
              <ListCard pros={{ data: [product] }} />
            </div>
          ))}
        </div>

        {/* Chỉ hiện mũi tên khi số sản phẩm > itemsPerSlide */}
        {data.length > itemsPerSlide && (
          <>
            <button
              className="absolute p-2 -translate-y-1/2 bg-white border rounded-full shadow left-2 top-1/2 hover:bg-gray-100"
              onClick={handlePrev}
            >
              <FaChevronLeft className="text-primary-500" />
            </button>
            <button
              className="absolute p-2 -translate-y-1/2 bg-white border rounded-full shadow right-2 top-1/2 hover:bg-gray-100"
              onClick={handleNext}
            >
              <FaChevronRight className="text-primary-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductSlider;
