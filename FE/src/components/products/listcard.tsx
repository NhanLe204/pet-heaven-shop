import React from "react";
import { FaHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartslice";
import { message } from "antd";

interface Product {
  _id: string;
  name: string;
  price: number;
  image_url: string[];
  discount: number;
  quantity: number;
}

interface ListCardProps {
  pros: { data: Product[] };
}

export default function ListCard({ pros }: ListCardProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBuyNow = (product: Product) => {
    if (!product) return; // tránh null

    const quantity = 1;
    const stockQuantity = product.quantity || Infinity;

    if (quantity > stockQuantity) {
      message.error(`Sản phẩm ${product.name} đã hết hàng!`);
      return;
    }

    const item = {
      id: product._id,
      name: product.name,
      price: Number(product.price * (1 - product.discount / 100)),
      image: product.image_url[0] || "/placeholder-image.jpg",
      stockQuantity: product.quantity || 0,
    };

    dispatch(addToCart({ item, quantity }));
    navigate("/checkout");
  };

  // Nếu không có sản phẩm thì return null
  if (!pros?.data?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        Không có sản phẩm nào
      </div>
    );
  }

  const product = pros.data[0];

  return (
    <div className="w-full max-w-[250px] p-4 min-h-[340px] flex flex-col justify-between transition bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg">
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
              -{product.discount}%
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
  );
}
