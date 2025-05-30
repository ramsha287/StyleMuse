import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';
import AdminDashboard from './admin/Dashboard';
import ManageProducts from './admin/ManageProducts';
import ManageOrders from './admin/ManageOrders';
import ManageUsers from './admin/ManageUsers';
import ManageShipping from './admin/ManageShipping';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';
import Contact from './pages/Contact';
import AuthPage from './pages/AuthPage';
import { Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MyOrders from './pages/MyOrders';
import Payment from './pages/Payment';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-products" element={<ManageProducts />} />
        <Route path="/admin/manage-orders" element={<ManageOrders />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/admin/manage-shipping" element={<ManageShipping />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/contact" element={<Contact  />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/category/:categoryName" element={<Products />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;