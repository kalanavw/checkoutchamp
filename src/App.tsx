
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Invoice from "./pages/Invoice";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import UserManagement from "./pages/UserManagement";
import GRN from "./pages/GRN";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/products" element={
            <Layout>
              <Products />
            </Layout>
          } />
          <Route path="/add-product" element={
            <Layout>
              <AddProduct />
            </Layout>
          } />
          <Route path="/orders" element={
            <Layout>
              <Orders />
            </Layout>
          } />
          <Route path="/reports" element={
            <Layout>
              <Reports />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
          <Route path="/invoice" element={
            <Layout>
              <Invoice />
            </Layout>
          } />
          <Route path="/customers" element={
            <Layout>
              <Customers />
            </Layout>
          } />
          <Route path="/users" element={
            <Layout>
              <UserManagement />
            </Layout>
          } />
          <Route path="/grn" element={
            <Layout>
              <GRN />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
