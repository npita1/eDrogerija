import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import AuthModal from './AuthModal'; // Važno: Ostaje importan ovdje
import { useAuth } from '../context/AuthContext'; // Uvezi useAuth
import { useCart } from '../context/CartContext'; // Uvezi useCart

const HeaderContainer = styled.header`
  background-color: var(--primary-color);
  color: var(--white-color);
  padding: 15px 0;
  box-shadow: var(--shadow-color) 0px 2px 8px;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }
`;

const Logo = styled(Link)`
  font-size: 2em;
  font-weight: bold;
  color: var(--white-color);
  text-decoration: none;
  transition: color 0.3s ease;

  span {
    color: var(--secondary-color);
  }

  &:hover {
    color: var(--secondary-color);
    span {
        color: var(--white-color);
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 15px;
    width: 100%;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const AuthButton = styled.button`
  background-color: var(--white-color);
  color: var(--primary-color);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none; /* Dodano: dugmad moraju imati border: none */
  cursor: pointer; /* Dodano: dugmad moraju imati cursor: pointer */


  &:hover {
    background-color: var(--secondary-color);
    color: var(--white-color);
    transform: translateY(-2px);
  }
`;

const ProfileLink = styled(Link)`
  color: var(--white-color);
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: var(--secondary-color);
  }
`;

const CartIcon = styled(Link)`
  position: relative;
  color: var(--white-color);
  font-size: 1.8em;
  text-decoration: none;
  margin-left: 15px;
  transition: color 0.3s ease;

  &:hover {
    color: var(--secondary-color);
  }
`;

const CartItemCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--secondary-color);
  color: var(--white-color);
  border-radius: 50%;
  padding: 2px 7px;
  font-size: 0.7em;
  font-weight: bold;
`;


function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalInitialMode, setModalInitialMode] = useState('login'); 

  const { user, logout } = useAuth(); // Koristi user i logout iz AuthContext-a
  const { totalItemsInCart } = useCart(); // Koristi totalItemsInCart iz CartContext-a

  const handleLogout = () => {
    logout(); // Pozovi logout iz AuthContext-a
  };

  const openAuthModal = (mode) => {
    setModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">eDrogerija<span>.ba</span></Logo>
        
        <AuthButtons>
          {user ? (
            <>
              {/* Prikazuje username ako je dostupan, inače email */}
              <ProfileLink to="/profile">
                <FaUserCircle />
                {user.username || user.email} 
              </ProfileLink>
              <AuthButton onClick={handleLogout}>Odjavi se</AuthButton>
            </>
          ) : (
            <>
              {/* Sada ovo dugme otvara lokalni modal */}
              <AuthButton onClick={() => openAuthModal('login')}>Prijavi se</AuthButton>
              <AuthButton onClick={() => openAuthModal('register')}>Registruj se</AuthButton>
            </>
          )}
          <CartIcon to="/cart">
            <FaShoppingCart />
            {totalItemsInCart > 0 && <CartItemCount>{totalItemsInCart}</CartItemCount>}
          </CartIcon>
        </AuthButtons>
      </Nav>
      {/* AuthModal je renderovan lokalno u Headeru */}
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} initialMode={modalInitialMode} />}
    </HeaderContainer>
  );
}

export default Header;