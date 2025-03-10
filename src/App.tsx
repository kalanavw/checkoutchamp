import {Route, Routes} from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/product/Products.tsx";
import ProductDetail from "@/pages/product/ProductDetail.tsx";
import AddProduct from "@/pages/product/AddProduct.tsx";
import Customers from "@/pages/Customers";
import Orders from "@/pages/Orders";
import Invoice from "@/pages/invoice/CreateInvoice.tsx";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import UserProfile from "@/pages/UserProfile";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import StorePage from "@/pages/Store.tsx";
import AddInventory from "@/pages/inventory/AddInventory.tsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="edit-product/:id" element={<AddProduct />} />
        <Route path="customers" element={<Customers />} />
        <Route path="orders" element={<Orders />} />
        <Route path="store" element={<StorePage/>}/>
        <Route path="/add-inventory" element={<AddInventory/>}/>
        <Route path="invoice" element={<Invoice />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="user/:id" element={<UserProfile />} />
        <Route path="user/profile" element={<UserProfile />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
