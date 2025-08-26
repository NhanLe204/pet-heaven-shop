import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  Menu,
  Space,
  Typography,
  Badge,
  Avatar,
  Drawer,
  Button,
} from "antd";
import {
  FaTruck,
  FaGift,
  FaCheckCircle,
  FaShoppingCart,
  FaPhoneAlt,
  FaBars,
  FaAngleDown,
  FaSearch,
} from "react-icons/fa";
import { BsGeoAltFill } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setUserId } from "../../redux/slices/cartslice";
import productsApi from "../../api/productsApi";
import { UserOutlined } from "@ant-design/icons";
import loginApi from "../../api/login";
import ENV_VARS from "../../../config";
import clearLocalStorageExceptCarts from "../../config/clearLocalStorage";
import SearchHeader from "./searchHeader";

// Định nghĩa kiểu dữ liệu
interface User {
  fullname: string;
  avatar?: string;
  role: string;
}

interface CartItem {
  quantity: number;
}

export default function Header() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items) as CartItem[];
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const cartCount = cartItems.reduce((count: number, item: CartItem) => count + Number(item.quantity), 0);
  const [open, setOpen] = useState(false);
  const [subMenu, setSubMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchDesktopOpen, setSearchDesktopOpen] = useState(false);
  const [searchMobileOpen, setSearchMobileOpen] = useState(false);
  const navigate = useNavigate();

  const showDrawer = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setSubMenu(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const accountID = localStorage.getItem("accountID")?.replace(/^"|"$/g, "") || "";

    if (!token || !accountID) {
      setIsUserLoaded(false);
      setUser(null);
      return;
    }

    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData) as User;
        console.log("User data in header.js:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Lỗi khi parse userData từ localStorage:", error);
      }
    }

    fetch(`${ENV_VARS.VITE_API_URL}/v1/users/${accountID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch user data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: { data?: User }) => {
        if (data.data) {
          setUser(data.data);
          localStorage.setItem("userData", JSON.stringify(data.data));
          dispatch(setUserId(accountID));
          setIsUserLoaded(true);
        }
      })
      .catch((err: Error) => {
        console.error("Error fetching user:", err.message);
        setIsUserLoaded(false);
        if (err.message.includes("401")) {
          console.warn("Token có thể đã hết hạn, cần đăng nhập lại");
          clearLocalStorageExceptCarts();
          setUser(null);
          dispatch(setUserId(null));
          navigate("/login");
        }
      });
  }, [dispatch, navigate]);

  const handleLogout = async () => {
    try {
      await loginApi.logout();
      localStorage.setItem("logoutEvent", Date.now().toString());
      localStorage.clear();
      setUser(null);
      dispatch(setUserId(null));
      setIsUserLoaded(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userMenu = (
    <Menu>
      {(user?.role === "admin" || user?.role === "employee") && (
        <Menu.Item key="1">
          <a href="/admin">
            <i className="mr-2 fas fa-cog"></i>Quản lý website
          </a>
        </Menu.Item>
      )}
      <Menu.Item key="2">
        <a href={`/userprofile/account`}>
          <i className="mr-2 fas fa-user"></i>Tài khoản
        </a>
      </Menu.Item>
      <Menu.Item key="3" onClick={handleLogout}>
        <a href="#">
          <i className="mr-2 fas fa-sign-out-alt"></i>Đăng xuất
        </a>
      </Menu.Item>
    </Menu>
  );

  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: "/", label: "Trang chủ" },
    { path: "/product", label: "Sản phẩm" },
    { path: "/info", label: "Dịch vụ thú cưng" },
    { path: "/blogs", label: "Bài viết" },
    { path: "/about-us", label: "Giới thiệu" },
    { path: "/contact", label: "Liên hệ" },
  ];

  return (
    <>
      <header className="w-full">
        <div className="flex h-[34px] items-center justify-center bg-[#22A6DF] px-4 text-[10px] text-white sm:h-[34px] sm:px-[40px] sm:text-xs lg:px-[154px] lg:text-sm">
          <div className="flex items-center gap-1 text-xs sm:text-xs">
            <div className="flex items-center px-2 py-1 font-semibold bg-black rounded-xl">
              %15 Off
            </div>{" "}
            khi mua tại cửa hàng
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 sm:px-[40px] sm:py-4 lg:px-[154px]">
          <a href="/">
            <img
              src="/images/icons/logo.jpg"
              alt="PetHeaven Logo"
              className="h-[40px] w-auto sm:h-[60px] lg:h-[100px]"
            />
          </a>

          <SearchHeader onSearchDesktopOpen={setSearchDesktopOpen} />

          <Space size={50} className="hidden xl:flex">
            <a href="/cart">
              <Badge count={cartCount}>
                <FaShoppingCart className="text-2xl" />
              </Badge>
            </a>
            {user ? (
              <Dropdown overlay={userMenu} trigger={["hover"]}>
                <div className="flex items-center cursor-pointer">
                  <Avatar
                    src={user.avatar ? `${user.avatar}` : undefined}
                    icon={!user.avatar && <UserOutlined />}
                    className="bg-[#22A6DF]"
                  />
                  <FaAngleDown className="ml-1 text-[#22A6DF]" />
                </div>
              </Dropdown>
            ) : (
              <a href="/login">
                <Avatar icon={<UserOutlined />} className="bg-[#22A6DF]" />
              </a>
            )}
          </Space>

          <Space size={50} className="flex items-center xl:hidden">
           <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setSearchDesktopOpen(true)}
            >
              <FaSearch className="w-6 h-6" />
            </button>
            <a href="/cart">
              <Badge count={cartCount}>
                <FaShoppingCart className="text-2xl" />
              </Badge>
            </a>
            {user ? (
              <Dropdown overlay={userMenu} trigger={["hover"]}>
                <div className="flex items-center cursor-pointer">
                  <Avatar
                    src={user.avatar ? `${user.avatar}` : undefined}
                    icon={!user.avatar && <UserOutlined />}
                    className="bg-[#22A6DF]"
                  />
                  <FaAngleDown className="ml-1 text-[#22A6DF]" />
                </div>
              </Dropdown>
            ) : (
              <a href="/login">
                <Avatar icon={<UserOutlined />} className="bg-[#22A6DF]" />
              </a>
            )}
          </Space>
        </div>

        <nav className="flex items-center justify-between bg-white px-4 text-black sm:px-[40px] lg:px-[154px]">
          <Space className="hidden items-center justify-between py-3 md:flex md:gap-[20px] lg:gap-[27px] xl:gap-[50px]">
            {menuItems.map((item) => (
              <a key={item.path} href={item.path} className="relative group">
                <Typography.Text
                  className={`text-sm font-bold transition-colors duration-300 lg:text-sm xl:text-lg relative z-10 ${currentPath === item.path
                    ? "text-[#22A6DF]"
                    : "text-black group-hover:text-[#22A6DF]"
                    }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#22A6DF] transition-all duration-300 ${currentPath === item.path
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                      }`}
                  ></span>
                </Typography.Text>
              </a>
            ))}
          </Space>

          <FaBars className="cursor-pointer md:hidden" onClick={showDrawer} />

          <Space className="text-sm font-bold whitespace-nowrap sm:text-xs lg:text-sm xl:text-base">
            <FaPhoneAlt className="mr-1" />
            24/7 Hỗ trợ: <span className="ml-1 text-[#22A6DF]">0393153129</span>
          </Space>
        </nav>

        <hr className="mt-[5px] border-dashed border-gray-300" />
      </header>

      <Drawer
        title={subMenu ? "Sản phẩm" : "Menu"}
        placement="left"
        onClose={onClose}
        open={open}
        width={300}
      >
        <Menu
          mode="vertical"
          items={[
            { key: "home", label: <a href="/">Trang chủ</a> },
            { key: "products", label: <a href="/product">Sản phẩm</a> },
            { key: "services", label: <a href="/info">Dịch vụ thú cưng</a> },
            { key: "blogs", label: <a href="/blogs">Bài viết</a> },
            { key: "about", label: <a href="/about-us">Giới thiệu</a> },
            { key: "contact", label: <a href="/contact">Liên hệ</a> },
          ]}
        />
      </Drawer>

     
    </>
  );
}