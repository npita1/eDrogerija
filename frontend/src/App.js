import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import CategoryPage from './pages/CategoryPage'; // Za prikaz proizvoda po kategoriji
import { AuthProvider } from './context/AuthContext'; // Za upravljanje autentifikacijom

function App() {
  return (
    <Router>
      <AuthProvider> {/* Omogućava pristup korisničkim podacima kroz cijelu aplikaciju */}
        <Header />
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto' }}> {/* Osnovni padding za sadržaj */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<HomePage />} /> {/* Ista ruta za proizvode */}
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/categories/:categoryName" element={<CategoryPage />} /> {/* Nova ruta za kategorije */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Dodaj druge rute po potrebi (npr. Checkout, Order Confirmation) */}
            <Route path="*" element={<div>Stranica nije pronađena!</div>} /> {/* 404 stranica */}
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;