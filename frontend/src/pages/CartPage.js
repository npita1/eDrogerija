

import React, { useState } from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import OrderConfirmationModal from '../components/modals/OrderConfirmationModal';
import OrderSuccessModal from '../components/modals/OrderSuccessModal';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



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
    text-align: center;

    @media (max-width: 768px) {
        padding: 20px;
    }
`;

const CartTitle = styled.h2`
    color: var(--primary-color);
    margin-bottom: 30px;
    font-size: 2.5em;
    text-align: center;
`;

const EmptyCartMessage = styled.p`
    font-size: 1.2em;
    color: var(--text-color);
    margin: 50px 0;
    text-align: center;
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
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;

    p {
        margin-bottom: 0;
    }

    strong {
        color: var(--primary-color);
    }
`;

const LoginButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px;
    width: 100%;
`;

const LoginButton = styled.button`
    background-color: var(--primary-color);
    color: var(--white-color);
    padding: 10px 20px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.3s ease;
    border: none;
    cursor: pointer;
    flex-grow: 1;
    max-width: 150px;

    &:hover {
        filter: brightness(0.9);
    }
`;

const StyledLinkButton = styled(Link)`
    background-color: var(--secondary-color);
    color: var(--white-color);
    padding: 12px 25px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1em;
    margin-top: 30px;
    transition: background-color 0.3s ease, transform 0.3s ease;
    display: inline-block;
    text-align: center;

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
    a {
        display: flex;
        align-items: center;
        gap: 15px;
        text-decoration: none;
        color: inherit;
    }
`;

const ItemInfo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    
    span {
        font-weight: 500;
        color: var(--text-color);
    }
    p {
        font-size: 0.9em;
        color: var(--light-text-color);
        margin: 0;
    }
`;
const ItemImage = styled.img`
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
    flex-shrink: 0;
`;


const ItemQuantity = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 15px;

    button {
        background: var(--background-color-light);
        border: 1px solid var(--border-color);
        border-radius: 5px;
        padding: 5px 8px;
        cursor: pointer;
        font-weight: bold;
        color: var(--text-color);
        transition: background-color 0.2s ease, color 0.2s ease;

        &:hover {
            background-color: var(--secondary-color);
            color: var(--white-color);
        }
        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
            opacity: 0.6;
        }
    }
    span {
        font-weight: bold;
        color: var(--text-color);
        min-width: 25px;
        text-align: center;
    }
`;

const ItemPrice = styled.span`
    font-weight: bold;
    color: var(--primary-color);
    white-space: nowrap;
    margin-right: 10px;
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

const ActionButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 30px;
    flex-wrap: wrap;

    button, ${StyledLinkButton} {
        padding: 12px 25px;
        border-radius: 25px;
        font-size: 1.1em;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease, filter 0.3s ease;
        border: none;
        text-decoration: none;
        text-align: center;
        flex: 1;
        min-width: 180px;

        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
            opacity: 0.6;
        }
    }
`;

const ClearCartButton = styled.button`
    background-color: #dc3545;
    color: var(--white-color);
    &:hover {
        background-color: #c82333;
    }
`;

const OrderButton = styled.button`
    background-color: var(--secondary-color);
    color: var(--white-color);
    &:hover {
        filter: brightness(0.9);
    }
`;

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
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [modalInitialMode, setModalInitialMode] = useState('login');


    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        calculateTotalPrice,
        isLoading,
        error,
        totalItemsInCart
    } = useCart();

    const totalPrice = calculateTotalPrice();

    const [isOrderConfirmationModalOpen, setIsOrderConfirmationModalOpen] = useState(false);
    const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    const openAuthModal = (mode) => {
        setModalInitialMode(mode);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const handleOpenOrderConfirmation = () => {
        if (!user) {
            toast.info("Molimo prijavite se da biste naručili.");
            openAuthModal('login');
            return;
        }
        if (cartItems.length === 0) {
            toast.warn("Vaša košarica je prazna. Dodajte proizvode prije naručivanja.");
            return;
        }
        setIsOrderConfirmationModalOpen(true);
    };

    const handleCloseOrderConfirmation = () => {
        setIsOrderConfirmationModalOpen(false);
    };

    const handleConfirmOrder = async () => {
        const orderData = await placeOrder(); 
        if (orderData) {
            setOrderDetails(orderData);
            setIsOrderConfirmationModalOpen(false);
            setIsOrderSuccessModalOpen(true);
        }
    };

    const handleCloseOrderSuccess = () => {
        setIsOrderSuccessModalOpen(false);
    };

    if (!user) {
        return (
            <CartPageContainer>
                <CartTitle>Košarica</CartTitle>
                <LoginPrompt>
                    <p>Da biste vidjeli sadržaj košarice i dodavali stvari u nju, molimo vas da se <strong>prijavite</strong> ili <strong>registrujete</strong>.</p>
                    <LoginButtonContainer>
                        <LoginButton onClick={() => openAuthModal('login')}>Prijavi se</LoginButton>
                        <LoginButton onClick={() => openAuthModal('register')}>Registruj se</LoginButton>
                    </LoginButtonContainer>
                </LoginPrompt>
                <StyledLinkButton to="/products">Nastavi kupovinu</StyledLinkButton>
                {isAuthModalOpen && <AuthModal onClose={closeAuthModal} initialMode={modalInitialMode} />}
            </CartPageContainer>
        );
    }

    if (isLoading) {
        return (
            <CartPageContainer>
                <CartTitle>Moja Košarica</CartTitle>
                <LoadingMessage>Učitavanje košarice...</LoadingMessage>
            </CartPageContainer>
        );
    }

    if (error) {
        return (
            <CartPageContainer>
                <CartTitle>Moja Košarica</CartTitle>
                <ErrorMessage>Greška pri učitavanju košarice: {error}</ErrorMessage>
                <StyledLinkButton to="/products">Nastavi kupovinu</StyledLinkButton>
            </CartPageContainer>
        );
    }

    return (
        <CartPageContainer>
            <CartTitle>Moja Košarica ({totalItemsInCart})</CartTitle>
            {cartItems.length === 0 ? (
                <>
                    <EmptyCartMessage>Vaša košarica je prazna.</EmptyCartMessage>
                    <StyledLinkButton to="/products">Nastavi kupovinu</StyledLinkButton>
                </>
            ) : (
                <>
                    <CartItemsList>
                        {cartItems.map(item => (
                            <CartItem key={item.id}>
                                <Link to={`/products/${item.id}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit' }}>
                                    <ItemImage src={item.imageUrl || 'https://via.placeholder.com/60'} alt={item.name} />
                                    <ItemInfo>
                                        <span>{item.name}</span>
                                        {item.brand && <p>{item.brand}</p>}
                                    </ItemInfo>
                                </Link>
                                <ItemQuantity>
                                    <button onClick={() => decreaseQuantity(item.id)} disabled={isLoading}>
                                        <FaMinus />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.id)} disabled={isLoading}>
                                        <FaPlus />
                                    </button>
                                </ItemQuantity>
                                <ItemPrice>{formatPrice(item.price * item.quantity)} KM</ItemPrice>
                                <button className="remove-button" onClick={() => removeFromCart(item.id)} disabled={isLoading}>
                                    <FaTrash />
                                </button>
                            </CartItem>
                        ))}
                    </CartItemsList>
                    <TotalPriceContainer>
                        Ukupno: {formatPrice(totalPrice)} KM
                    </TotalPriceContainer>
                    <ActionButtonContainer>
                        <ClearCartButton onClick={clearCart} disabled={isLoading}>Isprazni košaricu</ClearCartButton>
                        <OrderButton onClick={handleOpenOrderConfirmation} disabled={isLoading || cartItems.length === 0}>
                            Naruči
                        </OrderButton>
                    </ActionButtonContainer>
                </>
            )}
            
            <OrderConfirmationModal
                isOpen={isOrderConfirmationModalOpen}
                onClose={handleCloseOrderConfirmation}
                cartItems={cartItems}
                totalAmount={totalPrice}
                onConfirmOrder={handleConfirmOrder}
                isOrdering={isLoading}
            />

            <OrderSuccessModal
                isOpen={isOrderSuccessModalOpen}
                onClose={handleCloseOrderSuccess}
                orderDetails={orderDetails}
            />

            {isAuthModalOpen && <AuthModal onClose={closeAuthModal} initialMode={modalInitialMode} />}
        </CartPageContainer>
    );
}

export default CartPage;