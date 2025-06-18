import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const CartContainer = styled.div`
  background-color: var(--white-color);
  padding: 40px;
  border-radius: 10px;
  box-shadow: var(--shadow-color) 0px 2px 10px;
`;

const Message = styled.p`
  text-align: center;
  font-size: 1.2em;
  color: var(--light-text-color);
  margin-top: 50px;
`;

function CartPage() {
  const { user } = useAuth();
  // Ovdje će biti useState i useEffect za dohvaćanje korpe sa backend-a
  // const [cartItems, setCartItems] = useState([]);

  if (!user) {
    return (
      <CartContainer>
        <Message>Morate biti prijavljeni da biste vidjeli svoju korpu.</Message>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <h2>Moja korpa</h2>
      {/* Ovdje će ići logika za prikaz stavki u korpi */}
      <Message>Korpa je trenutno prazna.</Message> {/* Placeholder */}
      {/* Ako imaš stavke, prikaži ih, dugmad za povećanje/smanjenje, ukupan iznos, dugme za naručivanje */}
    </CartContainer>
  );
}

export default CartPage;