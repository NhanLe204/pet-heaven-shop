import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home/home";
import PageLayout from "./components/layout/PageLayout";
import Login from "./pages/login/login";
import SignUp from "./pages/signup/signup";
import ContactPage from "./pages/contact/contact";
import Products from "./pages/product/product";
import DetailProduct from "./pages/detail/detail";
import PetSpaServices from "./pages/infoservices/infoservices";
import SpaBookingForm from "./pages/services/services";
import Cart from "./pages/cart/cart";
import UserProfile from "./pages/userprofile/userprofile";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./admin/dashboard/dashboard";
import ProductList from "./admin/product/product";
import CategoryList from "./admin/category/category";
import OrderList from "./admin/order/order";
import UserList from "./admin/user/user";
import ServiceList from "./admin/service/service";
import EmployeeList from "./admin/employee/employee";
import Payment from "./pages/payment/payment";
import AboutUs from "./pages/about-us/about-us";
import BrandManager from "./admin/brand/brand";
import TagManager from "./admin/tag/tag";
import VerifyOtp from "./pages/verifyOTP/verifyOTP";
import Search from "./pages/search/search";
import BlogContent from "./pages/blog/blog";
import { notification } from "antd";
import CancelPage from "./pages/orders/cancel";
import SuccessPage from "./pages/orders/success";
import BookingManager from "./admin/booking/booking";
import SuccessBooking from "./pages/orders/booking/successBooking";
import BlogCategoryList from "./admin/blog_category/blog_category";
import ChatbotController from "./components/ChatbotController";
import ArticleDetail from "./pages/blogDetail/blogDetail";
import BlogList from "./admin/blog/blog";
import Revenue from "./admin/revenue/revenue";
import NotFound from "./pages/404/404"; // Import trang 404
import CouponList from "./admin/coupon/coupon";

interface User {
  id: string;
  email: string;
  fullname: string;
  avatar?: string;
  role: string;
  status: string;
}

const EMPLOYEE_ALLOWED_PAGES = [
  "/admin",
  "/admin/dashboard",
  "/admin/products",
  "/admin/categories",
  "/admin/orders",
  "/admin/services",
  "/admin/brands",
  "/admin/tags",
  "/admin/Revenue",
];

const ProtectedRoute = ({
  children,
  allowedRole,
  path,
}: {
  children: JSX.Element;
  allowedRole?: string;
  path?: string;
}) => {
  const userData = localStorage.getItem("userData");
  const user: User | null = userData ? JSON.parse(userData) : null;
  return children;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  return children;
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: "/signup",
      element: (
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      ),
    },
    {
      path: "/verify-otp",
      element: (
        <PublicRoute>
          <VerifyOtp />
        </PublicRoute>
      ),
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute path="/admin">
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Dashboard /> },
        { path: "coupon", element: <CouponList /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "revenue", element: <Revenue /> },
        { path: "employees", element: <EmployeeList /> },
        { path: "categories", element: <CategoryList /> },
        { path: "blogcategories", element: <BlogCategoryList /> },
        { path: "products", element: <ProductList /> },
        { path: "blogs", element: <BlogList /> },
        { path: "brands", element: <BrandManager /> },
        { path: "tags", element: <TagManager /> },
        { path: "orders", element: <OrderList /> },
        { path: "bookings", element: <BookingManager /> },
        { path: "services", element: <ServiceList /> },
        { path: "users", element: <UserList /> },
        // { path: "settings", element: <SystemSettings /> },
      ],
    },
    {
      path: "",
      element: <PageLayout />,
      children: [
        {
          path: "/",
          element: (
            <PublicRoute>
              <Home />
            </PublicRoute>
          ),
        },
        {
          path: "/contact",
          element: (
            <PublicRoute>
              <ContactPage />
            </PublicRoute>
          ),
        },
        {
          path: "/product",
          element: (
            <PublicRoute>
              <Products />
            </PublicRoute>
          ),
        },
        {
          path: "/detail/:id",
          element: (
            <PublicRoute>
              <DetailProduct />
            </PublicRoute>
          ),
        },
        {
          path: "/info",
          element: (
            <PublicRoute>
              <PetSpaServices />
            </PublicRoute>
          ),
        },
        {
          path: "/about-us",
          element: (
            <PublicRoute>
              <AboutUs />
            </PublicRoute>
          ),
        },
        {
          path: "/service",
          element: (
            <PublicRoute>
              <SpaBookingForm />
            </PublicRoute>
          ),
        },
        {
          path: "/cart",
          element: (
            <PublicRoute>
              <Cart />
            </PublicRoute>
          ),
        },
        {
          path: "/checkout",
          element: (
            <PublicRoute>
              <Payment />
            </PublicRoute>
          ),
        },
        {
          path: "/blogs",
          element: (
            <PublicRoute>
              <BlogContent />
            </PublicRoute>
          ),
        },
        {
          path: "/cancel",
          element: (
            <PublicRoute>
              <CancelPage />
            </PublicRoute>
          ),
        },
        {
          path: "/success",
          element: (
            <PublicRoute>
              <SuccessPage />
            </PublicRoute>
          ),
        },
        {
          path: "/success-booking",
          element: (
            <PublicRoute>
              <SuccessBooking />
            </PublicRoute>
          ),
        },
        {
          path: "/userprofile/*", // Route con cho userprofile
          element: (
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          ),
        },
        {
          path: "/search",
          element: (
            <PublicRoute>
              <Search />
            </PublicRoute>
          ),
        },
        {
          path: "/blogs/:id",
          element: (
            <PublicRoute>
              <ArticleDetail />
            </PublicRoute>
          ),
        },
        { path: "*", element: <NotFound /> }, // Route 404 cho các trang con
      ],
    },
    {
      path: "*", // Route mặc định cho các đường dẫn không tồn tại
      element: <NotFound />, // Hiển thị trang 404
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
