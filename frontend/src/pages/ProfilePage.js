import React, { useEffect } from 'react'; // Dodaj useEffect
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Styled Components
const ProfileContainer = styled.div`
  background-color: var(--white-color);
  padding: 40px;
  border-radius: 10px;
  box-shadow: var(--shadow-color) 0px 2px 10px;
  max-width: 800px;
  margin: 40px auto;
  text-align: center;

  @media (max-width: 768px) {
    padding: 20px;
    margin: 20px auto;
  }
`;

const UserInfo = styled.div`
  margin-bottom: 30px;

  h2 {
    font-size: 2.5em;
    color: var(--primary-color);
    margin-bottom: 15px;

    @media (max-width: 768px) {
        font-size: 1.8em;
    }
  }

  p {
    font-size: 1.1em;
    color: var(--text-color);
    margin-bottom: 8px;

    @media (max-width: 768px) {
        font-size: 1em;
    }
  }
`;

const OrdersSection = styled.div`
  margin-top: 30px;
  border-top: 1px solid var(--border-color);
  padding-top: 30px;

  h3 {
    font-size: 1.8em;
    color: var(--secondary-color);
    margin-bottom: 20px;

    @media (max-width: 768px) {
        font-size: 1.5em;
    }
  }

  p {
    color: var(--light-text-color);
    font-style: italic;
  }
`;

const LogoutButton = styled.button`
  background-color: #dc3545; /* Crvena boja za odjavu */
  color: var(--white-color);
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 30px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333; /* Tamnija crvena na hover */
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 20px;
  }
`;


function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Koristimo useEffect za logiku preusmjeravanja
    useEffect(() => {
        if (!user) {
            // Preusmjeri korisnika na početnu stranicu ako nije prijavljen
            navigate('/');
        }
    }, [user, navigate]); // Ovisnosti: user (ako se promijeni stanje prijave), navigate (stabilna funkcija)

    // Ako user još uvijek nije definisan (npr. dok se useEffect ne pokrene i ne preusmjeri),
    // prikaži nešto privremeno ili null
    if (!user) {
        return null; // Ne renderiraj ništa dok se preusmjeravanje ne desi
    }

    const handleLogout = () => {
        logout();
        navigate('/'); // Preusmjeri na početnu stranicu nakon odjave
    };

    return (
        <ProfileContainer>
            <UserInfo>
                <h2>Dobrodošli, {user.username || 'Korisniče'}!</h2>
                <p>Email: {user.email || 'N/A'}</p> 
                {/* Email iz tokena možda nije uvijek dostupan. Možeš ga dohvatiti posebnim API pozivom na /api/users/me */}
                {/* <p>Role: {user.roles ? user.roles.join(', ') : 'N/A'}</p> */}
            </UserInfo>

            <OrdersSection>
                <h3>Moje Narudžbe</h3>
                {/* Ovdje će se mapirati narudžbe */}
                <p>Nema pronađenih narudžbi.</p> {/* Placeholder */}
            </OrdersSection>

            <LogoutButton onClick={handleLogout}>Odjavi se</LogoutButton>
        </ProfileContainer>
    );
}

export default ProfilePage;