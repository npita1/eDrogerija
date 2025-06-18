import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserCircle, FaShoppingCart } from 'react-icons/fa'; // Ikone za korisnika i korpu
import AuthModal from './AuthModal'; // Komponenta za Login/Register modal
import { useAuth } from '../context/AuthContext'; // Hook za provjeru autentifikacije

const HeaderContainer = styled.header`
  background-color: var(--white-color);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-color) 0px 2px 8px;
`;

const Logo = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  color: var(--primary-color);
  // Ovdje bi išao tvoj stvarni logo (slika ili SVG)
  // Za sada, samo tekst:
  span {
      color: var(--secondary-color);
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 30px;

  a {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--text-color);
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary-color);
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserButton = styled.button`
  background-color: var(--primary-color);
  color: var(--white-color);
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 1em;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: darken(var(--primary-color), 10%); // Funkcija darken ne radi direktno u JS, ali ilustrira ideju
    opacity: 0.9;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--text-color);
  font-weight: 500;

  &:hover {
    color: var(--primary-color);
  }
`;

function Header() {
  const [showModal, setShowModal] = useState(false);
  const { user, logout } = useAuth(); // Dobijamo korisnika i funkciju za odjavu iz konteksta

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <HeaderContainer>
      <Logo>eDrogerija<span>.ba</span></Logo> {/* Placeholder logo text */}
      
      <NavLinks>
        <Link to="/products">Proizvodi</Link>
        <Link to="/cart">Korpa</Link>
      </NavLinks>

      <UserSection>
        {user ? ( // Ako je korisnik prijavljen
          <UserProfile as={Link} to="/profile">
            <FaUserCircle size={24} />
            <span>Moj Profil</span>
          </UserProfile>
        ) : ( // Ako korisnik nije prijavljen
          <UserButton onClick={handleOpenModal}>
            Prijava / Registracija
          </UserButton>
        )}
      </UserSection>

      {showModal && <AuthModal onClose={handleCloseModal} />}
    </HeaderContainer>
  );
}

export default Header;