import { Route, Routes } from "react-router-dom";

import Orders from "./pages/orders";
import CartPage from "./pages/cart";
import Wishlist from "./pages/wishlist";
import OrderDetails from "./pages/order-details";
import Profile from "./pages/profile";
import ContactUs from "./pages/contact-us";
import PreBuiltPCPage from "./pages/pre-built-pc";
import PreBuiltPCDetails from "./pages/pre-built-pc-details";
import OwnCustomPC from "./pages/own-custom-pc";
import ProductDetails from "./pages/product-details";
import ProductPage from "./pages/product-page";
import { AuthProvider } from "./contexts/AuthContext";
import { Provider } from "./provider";
import ProtectedRoute from "./components/protectedRoute";
import Payment from "./pages/payment";

import CustomPCHP from "@/pages/custom-pc-hp";
import RepairsPage from "@/pages/repairs";
import ComponentsPage from "@/pages/components";
import IndexPage from "@/pages/index";

function App() {
  return (
    <Provider>
      <AuthProvider>
        <Routes>
          <Route element={<IndexPage />} path="/" />
          <Route element={<ComponentsPage />} path="/components" />
          <Route element={<ProductPage />} path="/components/:type" />
          <Route element={<ProductDetails />} path="/components/:type/:id" />
          <Route element={<RepairsPage />} path="/repairs" />
          <Route element={<CustomPCHP />} path="/custom-pc" />
          <Route element={<PreBuiltPCPage />} path="/custom-pc/pre-built-pcs" />
          <Route
            element={<PreBuiltPCDetails />}
            path="/custom-pc/pre-built-pcs/:id"
          />
          <Route
            element={<ProductDetails />}
            path="/custom-pc/custom-pc-builder/:type/:id"
          />
          <Route
            element={<OwnCustomPC />}
            path="/custom-pc/custom-pc-builder"
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
            path="/cart"
          />
          <Route
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
            path="/orders"
          />
          <Route
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
            path="/orders/:orderId"
          />
          <Route
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
            path="/wishlist"
          />
          <Route
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
            path="/profile"
          />
          <Route
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
            path="/payment"
          />
          <Route element={<ContactUs />} path="/contactUs" />
        </Routes>
      </AuthProvider>
    </Provider>
  );
}

export default App;
