import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatPrice'; // Koristi našu util funkciju za formatiranje cijene

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: var(--white-color);
    padding: 30px;
    border-radius: 10px;
    width: 550px; /* Povećaj širinu za bolji prikaz stavki */
    max-width: 95%;
    box-shadow: 0px 5px 15px var(--shadow-color);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;

    @media (max-width: 768px) {
        padding: 20px;
        width: 95%;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: transparent;
    border: none;
    font-size: 1.5em;
    color: var(--text-color);
    cursor: pointer;
    z-index: 10;
`;

const Title = styled.h2`
    text-align: center;
    margin-bottom: 25px;
    color: var(--primary-color);
`;

const OrderSummary = styled.div`
    margin-bottom: 20px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 15px;
`;

const OrderItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 15px;
    border-bottom: 1px dashed var(--border-color);
    padding-bottom: 10px;
    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    img {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 5px;
    }

    div {
        flex-grow: 1;
    }

    .item-name {
        font-weight: 600;
        color: var(--text-color);
    }
    .item-details {
        font-size: 0.9em;
        color: var(--light-text-color);
    }
    .item-price {
        font-weight: 600;
        color: var(--secondary-color);
        white-space: nowrap;
    }
`;

const TotalAmount = styled.div`
    font-size: 1.4em;
    font-weight: bold;
    text-align: right;
    margin-top: 20px;
    color: var(--primary-color);
`;

const ConfirmButton = styled.button`
    width: 100%;
    padding: 12px;
    background-color: var(--primary-color);
    color: var(--white-color);
    border: none;
    border-radius: 5px;
    font-size: 1.1em;
    font-weight: 600;
    margin-top: 30px;
    cursor: pointer;
    transition: background-color 0.3s ease, filter 0.3s ease;

    &:hover {
        filter: brightness(0.9);
    }
    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;

const InfoText = styled.p`
    font-size: 0.9em;
    color: var(--light-text-color);
    text-align: center;
    margin-top: 20px;
`;

function OrderConfirmationModal({ isOpen, onClose, cartItems, totalAmount, onConfirmOrder, isOrdering }) {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
                
                <Title>Potvrda narudžbe</Title>

                <OrderSummary>
                    <h3>Proizvodi u košarici:</h3>
                    {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                            <OrderItem key={item.id}>
                                <img src={item.imageUrl || 'https://via.placeholder.com/60'} alt={item.name} />
                                <div>
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-details">{formatPrice(item.price)} KM x {item.quantity} kom</div>
                                </div>
                                <div className="item-price">{formatPrice(item.price * item.quantity)} KM</div>
                            </OrderItem>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--light-text-color)' }}>Nema proizvoda u košarici.</p>
                    )}
                </OrderSummary>

                <TotalAmount>
                    Ukupno za plaćanje: {formatPrice(totalAmount)} KM
                </TotalAmount>

                <InfoText>Plaćanje se vrši pouzećem prilikom preuzimanja narudžbe.</InfoText>

                <ConfirmButton onClick={onConfirmOrder} disabled={isOrdering || cartItems.length === 0}>
                    {isOrdering ? 'Šaljem narudžbu...' : 'Potvrdi narudžbu'}
                </ConfirmButton>
            </ModalContent>
        </ModalOverlay>
    );
}

export default OrderConfirmationModal;