import { Link, Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import CarouselPage from "./pages/carousel";

import CustomBuildPCPage from "./pages/custom-build-pcs";
import PreBuiltPCPage from "@/pages/pre-built-pcs";
import PreBuiltPCDetails from "./pages/pre-built-pc-details";

import RequestsPage from "./pages/requests";
import StepsPage from "./pages/repair-steps";

import OrdersPage from "./pages/orders";
import OrderDetails from "./pages/order-details";

import UsersPage from "./pages/users";
import FAQsPage from "./pages/faqs";

import ComponentsPage from "@/pages/components";
import ProductPage from "./pages/product-page";
import ProductDetails from "./pages/product-details";

const Logout = () => {
  // Clear the token from localStorage
  localStorage.removeItem("token");
  // Redirect to the home page
  window.location.href = "/";
  return <Link to="/" />;
};

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<CarouselPage />} path="/carousel" />

      <Route element={<CustomBuildPCPage />} path="/customs/custom-build-pcs" />
      <Route element={<PreBuiltPCPage />} path="/customs/pre-built-pcs" />
      <Route
        element={<PreBuiltPCDetails />}
        path="/customs/pre-built-pcs/:id"
      />

      <Route element={<RequestsPage />} path="/repairs/requests" />
      <Route element={<StepsPage />} path="/repairs/steps" />

      <Route element={<UsersPage />} path="/users" />
      <Route element={<FAQsPage />} path="/faqs" />

      <Route element={<OrdersPage />} path="/orders" />
      <Route element={<OrderDetails />} path="/orders/:orderId" />

      <Route element={<ComponentsPage />} path="/components" />
      <Route element={<ProductPage />} path="/components/:type" />
      <Route element={<ProductDetails />} path="/components/:type/:id" />

      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}

export default App;
