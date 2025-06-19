import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

// Import konteksta
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import komponenti i stranica
import Header from './components/Header'; // Koristi 'Header' umjesto 'Navbar' ako je to tvoje ime
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
// import AuthModal from './components/modals/AuthModal'; // AuthModal se sada otvara iz CartPage
import Footer from './components/Footer';
import OrderList from './pages/OrderList'; // DODANO: Uvezi OrderList komponentu
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
  // Globalni AuthModal state nije potreban ako ga samo CartPage otvara
  // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // const [authModalMode, setAuthModalMode] = useState('login'); 

  // const handleOpenAuthModal = (mode) => {
  //   setAuthModalMode(mode);
  //   setIsAuthModalOpen(true);
  // };

  // const handleCloseAuthModal = () => {
  //   setIsAuthModalOpen(false);
  // };

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContainer>
            {/* ToastContainer pozicioniran na vrhu za globalnu vidljivost */}
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            <Header /* onOpenAuthModal={handleOpenAuthModal} */ /> {/* Ako Header ima dugme za prijavu, treba mu prop */}
            <ContentWrapper>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrderList />} /> {/* NOVA RUTA za prikaz narudžbi */}
                <Route path="/profile" element={<ProfilePage />} />
                {/* Opcionalno, ruta za pojedinacne detalje narudzbe: <Route path="/orders/:orderNumber" element={<OrderDetail />} /> */}
                <Route path="*" element={<h2>404 Not Found</h2>} /> {/* Fallback za nepostojeće rute */}
              </Routes>
            </ContentWrapper>
            <Footer />
            {/* AuthModal je uklonjen sa App.js nivoa, s obzirom da ga CartPage već kontroliše */}
            {/* {isAuthModalOpen && <AuthModal onClose={handleCloseAuthModal} initialMode={authModalMode} />} */}
          </AppContainer>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;