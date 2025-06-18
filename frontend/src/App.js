import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage'; // Ako imaš
import ProfilePage from './pages/ProfilePage'; // Ako imaš
import CartPage from './pages/CartPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Router>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 150px)' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<HomePage />} /> {/* Ruta za proizvode, koja prikazuje HomePage */}
                <Route path="/products/:id" element={<ProductDetailPage />} /> {/* OVA LINIJA JE SADA AKTIVNA! */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                {/* Dodaj ostale rute */}
                <Route path="*" element={<h2>404 Not Found</h2>} />
              </Routes>
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;