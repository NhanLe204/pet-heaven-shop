import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Space, Button } from "antd";
import { FaHistory, FaSearch, FaTimes } from "react-icons/fa";
import productsApi from "../../api/productsApi";
import { SearchContext } from "../searchContext";
import debounce from "lodash/debounce";

// Định nghĩa kiểu dữ liệu
interface Product {
  _id: string;
  name: string;
  image_url: string[];
  price: string;
}

interface SearchComponentProps {
  onSearchDesktopOpen?: (open: boolean) => void;
}

const SearchHeader: React.FC<SearchComponentProps> = ({ onSearchDesktopOpen }) => {
  const { keyword, setKeyword } = useContext(SearchContext);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchDesktopOpen, setSearchDesktopOpen] = useState(false);
  const navigate = useNavigate();

  const showSearchDesktop = () => {
    setSearchDesktopOpen(true);
    if (onSearchDesktopOpen) onSearchDesktopOpen(true);
  };

  const closeSearchDesktop = () => {
    setSearchDesktopOpen(false);
    if (onSearchDesktopOpen) onSearchDesktopOpen(false);
  };

  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    console.log("Loaded searchHistory from localStorage on mount:", storedHistory);
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setSearchHistory(parsedHistory);
        } else {
          console.error("Invalid searchHistory format in localStorage");
          setSearchHistory([]);
        }
      } catch (error) {
        console.error("Error parsing searchHistory from localStorage:", error);
        setSearchHistory([]);
      }
    }
  }, []);

  const saveSearchHistory = (history: string[]) => {
    console.log("Saving searchHistory to localStorage:", history);
    localStorage.setItem("searchHistory", JSON.stringify(history));
  };

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !searchHistory.includes(trimmedValue)) {
      const newHistory = [trimmedValue, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      saveSearchHistory(newHistory);
    }
  };

  const handleSearchSubmit = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      handleSearch(trimmedValue);
      setKeyword(trimmedValue);
      navigate(`/search?q=${encodeURIComponent(trimmedValue)}`);
      closeSearchDesktop();
    }
  };

  // Thêm debounce để tối ưu gọi API
  const fetchSearchResults = useCallback(
    debounce(async (searchTerm: string) => {
      try {
        const response = await productsApi.getProductActive();
        const data = await response.data.result;
        console.log("Dữ liệu từ API:", data);

        const normalizedSearchTerm = removeDiacritics(searchTerm.toLowerCase());
        const filteredProducts = data.filter((product: Product) => {
          const normalizedProductName = removeDiacritics(product.name.toLowerCase());
          return normalizedProductName.includes(normalizedSearchTerm);
        });

        console.log("Sản phẩm sau lọc:", filteredProducts);
        setSearchResults(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setSearchResults([]);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    if (value.trim()) {
      fetchSearchResults(value);
    } else {
      setSearchResults([]);
    }
  };

  const clearSearchHistory = () => {
    console.log("Clearing searchHistory");
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const removeDiacritics = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const searchDesktop = (
  <div
    className="w-[500px] bg-white shadow-lg rounded-lg border border-gray-200"
    style={{
      position: "absolute",
      top: "100%",
      left: 0,
      zIndex: 1000,
      maxHeight: "400px",
      overflowY: "auto",
    }}
  >
    <div className="p-4">
      {/* Nếu có kết quả tìm kiếm */}
      {searchResults.length > 0 ? (
        <div>
          {searchResults.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-3 p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => {
                navigate(`/detail/${product._id}`);
                closeSearchDesktop();
              }}
            >
              {/* ảnh nhỏ bên trái */}
              <img
                src={product.image_url[0]}
                alt={product.name}
                className="object-cover w-12 h-12 rounded"
              />
              {/* tên + giá */}
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                <p className="text-[#22A6DF] font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(product.price))}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Lịch sử tìm kiếm */}
          {searchHistory.length > 0 && (
            <div className="mb-4">
              {searchHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSearchSubmit(item)}
                >
                  <div className="flex items-center gap-2">
                    <FaHistory className="text-gray-400" />
                    <span>{item}</span>
                  </div>
                  <FaTimes
                    onClick={(e) => {
                      e.stopPropagation();
                      const newHistory = searchHistory.filter((_, i) => i !== index);
                      setSearchHistory(newHistory);
                      saveSearchHistory(newHistory);
                    }}
                    className="text-gray-400 cursor-pointer hover:text-red-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Từ khóa phổ biến */}
          <div>
            <h3 className="mb-2 font-bold text-gray-700">Từ khóa phổ biến</h3>
            <div className="flex flex-wrap gap-2">
              {["Thức ăn cho mèo", "Đồ chơi cho mèo", "Tắm cho thú cưng"].map(
                (keyword, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearchSubmit(keyword)}
                    className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    {keyword}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);


  return (
    <Dropdown
      overlay={searchDesktop}
      trigger={["click"]}
      open={searchDesktopOpen}
      onOpenChange={(open) => {
        setSearchDesktopOpen(open);
        if (onSearchDesktopOpen) onSearchDesktopOpen(open);
      }}
      placement="bottomLeft"
      overlayClassName="search-dropdown"
    >
      <div className="relative w-[500px]">
        <div className="flex items-center w-full border border-gray-300 rounded-full overflow-hidden focus-within:border-[#22A6DF]">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={keyword || ""}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit(keyword || "")}
            onClick={showSearchDesktop}
            className="w-full h-10 p-2 pl-3 text-gray-700 border-none outline-none"
          />
          <button
            onClick={showSearchDesktop}
            className="flex items-center justify-center w-10 h-10 bg-[#22A6DF] text-white"
          >
            <FaSearch />
          </button>
        </div>
      </div>
    </Dropdown>
  );
};

export default SearchHeader;