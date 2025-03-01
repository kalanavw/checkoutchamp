
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
import Settings from "@/pages/Settings";
import Invoice from "@/pages/Invoice";
import Checkout from "@/pages/Checkout";
import AddProduct from "@/pages/AddProduct";
import GRN from "@/pages/GRN";
import GRNList from "@/pages/GRNList";
import UserManagement from "@/pages/UserManagement";
import ProductDetail from "@/pages/ProductDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="orders" element={<Orders />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="invoice" element={<Invoice />} />
        <Route path="grn" element={<GRN />} />
        <Route path="grn-list" element={<GRNList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
