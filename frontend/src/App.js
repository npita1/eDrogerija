import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';


import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';


import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import Footer from './components/Footer';
import OrderList from './pages/OrderList';
import ProfilePage from './pages/ProfilePage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
`;

const ContentWrapper = styled.main`
  flex: 1;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0 15px;
    margin: 15px auto;
  }
`;

function App() {

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContainer>
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <Header /* onOpenAuthModal={handleOpenAuthModal} */ />
            <ContentWrapper>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<h2>404 Not Found</h2>} />
              </Routes>
            </ContentWrapper>
            <Footer />
          </AppContainer>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;