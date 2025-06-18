import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Pretpostavljam da imaš AuthProvider
import { CartProvider } from './context/CartContext'; // UVEZI CartProvider
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage'; // Ako imaš
import ProfilePage from './pages/ProfilePage'; // Ako imaš
import CartPage from './pages/CartPage';
// ... ostali importi (npr. GlobalStyles, ToastContainer)
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    // Globalni stilovi i toast kontejner (ako ih koristiš)
    <>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Router>
        <AuthProvider> {/* AuthProvider treba biti van CartProvider ako CartProvider treba podatke o useru */}
          <CartProvider> {/* OBAVEZNO OVJDE OMOTAJ CIJELU APLIKACIJU */}
            <Header />
            <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 150px)' }}> {/* Prilagodi stil */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<HomePage />} /> {/* Ruta za proizvode */}
                {/* <Route path="/products/:id" element={<ProductDetailPage />} /> */}
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