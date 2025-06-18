import React from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const CartPageContainer = styled.div`
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--white-color);
  border-radius: 10px;
  box-shadow: var(--shadow-color) 0px 2px 10px;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const CartTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 30px;
  font-size: 2.5em;
`;

const EmptyCartMessage = styled.p`
  font-size: 1.2em;
  color: var(--text-color);
  margin-bottom: 20px;
`;

const LoginPrompt = styled.div`
  background-color: var(--secondary-color-light);
  border: 1px solid var(--secondary-color);
  border-radius: 8px;
  padding: 25px;
  margin-top: 30px;
  font-size: 1.1em;
  color: var(--text-color);
  box-shadow: var(--shadow-color) 0px 1px 5px;

  p {
    margin-bottom: 15px;
  }

  strong {
    color: var(--primary-color);
  }
`;

// Promjena: LoginLink postaje LoginButton da otvori modal
const LoginButton = styled.button`
  background-color: var(--primary-color);
  color: var(--white-color);
  padding: 10px 20px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  border: none; /* Važno za button */
  cursor: pointer; /* Važno za button */

  &:hover {
    filter: brightness(0.9);
  }
`;

const ContinueShoppingButton = styled(Link)`
  background-color: var(--secondary-color);
  color: var(--white-color);
  padding: 12px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1em;
  margin-top: 30px;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    filter: brightness(0.9);
    transform: translateY(-2px);
  }
`;

const CartItemsList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  margin-top: 20px;
`;

const CartItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding: 15px 0;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
  }
  span {
    font-weight: 500;
  }
`;

const ItemQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  button {
    background: var(--secondary-color-light);
    border: 1px solid var(--secondary-color);
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      background-color: var(--secondary-color);
      color: var(--white-color);
    }
  }
`;

const ItemPrice = styled.span`
  font-weight: bold;
  color: var(--primary-color);
`;

const TotalPriceContainer = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid var(--primary-color);
  width: 100%;
  text-align: right;
  font-size: 1.5em;
  font-weight: bold;
  color: var(--primary-color);
`;

const CheckoutButton = styled(Link)`
  background-color: var(--primary-color);
  color: var(--white-color);
  padding: 15px 30px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.2em;
  margin-top: 30px;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    filter: brightness(0.9);
    transform: translateY(-2px);
  }
`;

// Novo: za isLoading i error poruke
const LoadingMessage = styled.p`
  font-size: 1.2em;
  color: var(--primary-color);
  margin-top: 20px;
`;

const ErrorMessage = styled.p`
  font-size: 1.2em;
  color: red;
  margin-top: 20px;
`;

function CartPage() {
    const { user } = useAuth();

    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        calculateTotalPrice,
        isLoading, // Novo
        error,     // Novo
    } = useCart();

    const totalPrice = calculateTotalPrice();

    if (!user) {
        return (
            <CartPageContainer>
                <CartTitle>Košarica</CartTitle>
                <LoginPrompt>
                    <p>Da biste vidjeli sadržaj košarice i dodavali stvari u nju, molimo vas da se <strong>prijavite</strong> ili <strong>registrujete</strong>.</p>
                    {/* Sada ovo dugme otvara modal umjesto preusmjeravanja */}
                </LoginPrompt>
                <ContinueShoppingButton to="/products">Nastavi kupovinu</ContinueShoppingButton>
            </CartPageContainer>
        );
    }

    // Prikaz statusa učitavanja
    if (isLoading) {
        return (
            <CartPageContainer>
                <CartTitle>Moja Košarica</CartTitle>
                <LoadingMessage>Učitavanje košarice...</LoadingMessage>
            </CartPageContainer>
        );
    }

    // Prikaz greške
    if (error) {
        return (
            <CartPageContainer>
                <CartTitle>Moja Košarica</CartTitle>
                <ErrorMessage>Greška pri učitavanju košarice: {error}</ErrorMessage>
                <ContinueShoppingButton to="/products">Nastavi kupovinu</ContinueShoppingButton>
            </CartPageContainer>
        );
    }

    // Korisnik je prijavljen i korpa je učitana (ili prazna)
    return (
        <CartPageContainer>
            <CartTitle>Moja Košarica</CartTitle>
            {cartItems.length === 0 ? (
                <>
                    <EmptyCartMessage>Vaša košarica je prazna.</EmptyCartMessage>
                    <ContinueShoppingButton to="/products">Nastavi kupovinu</ContinueShoppingButton>
                </>
            ) : (
                <>
                    <CartItemsList>
                        {cartItems.map(item => (
                            <CartItem key={item.id}>
                                <ItemInfo>
                                    {/* Prikazuje sliku ako postoji */}
                                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
                                    <span>{item.name}</span>
                                </ItemInfo>
                                <ItemQuantity>
                                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                                    <button onClick={() => removeFromCart(item.id)}>Ukloni</button>
                                </ItemQuantity>
                                <ItemPrice>{(item.price * item.quantity).toFixed(2)} KM</ItemPrice>
                            </CartItem>
                        ))}
                    </CartItemsList>
                    <TotalPriceContainer>
                        Ukupno: {totalPrice.toFixed(2)} KM
                    </TotalPriceContainer>
                    <CheckoutButton to="/checkout">Nastavi na plaćanje</CheckoutButton>
                </>
            )}
        </CartPageContainer>
    );
}

export default CartPage;