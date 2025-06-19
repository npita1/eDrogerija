import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice'; // Koristi našu util funkciju

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: var(--white-color);
    padding: 40px;
    border-radius: 10px;
    width: 450px;
    max-width: 90%;
    box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.3);
    text-align: center;
    position: relative;

    @media (max-width: 480px) {
        padding: 30px;
    }
`;

const SuccessIcon = styled(FaCheckCircle)`
    color: var(--success-color); /* Definiraj --success-color u svom CSS-u (npr. #28a745) */
    font-size: 4em;
    margin-bottom: 20px;
`;

const Title = styled.h2`
    color: var(--primary-color);
    margin-bottom: 15px;
`;

const OrderInfo = styled.div`
    margin-bottom: 30px;
    font-size: 1.1em;
    color: var(--text-color);

    p {
        margin-bottom: 8px;
    }
    strong {
        color: var(--secondary-color);
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;

    a, button {
        display: block;
        width: 100%;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 1.1em;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease, filter 0.3s ease;
        text-decoration: none;
        text-align: center;
    }

    .main-btn {
        background-color: var(--primary-color);
        color: var(--white-color);
        border: none;
        &:hover {
            filter: brightness(0.9);
        }
    }

    .secondary-btn {
        background-color: transparent;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
        &:hover {
            background-color: var(--primary-color);
            color: var(--white-color);
        }
    }
`;

function OrderSuccessModal({ isOpen, onClose, orderDetails }) {
    if (!isOpen || !orderDetails) return null;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <SuccessIcon />
                <Title>Narudžba uspješno poslana!</Title>
                <OrderInfo>
                    <p>Vaša narudžba broj: <strong>{orderDetails.orderNumber}</strong> je uspješno zaprimljena.</p>
                    <p>Ukupni iznos: <strong>{formatPrice(orderDetails.totalAmount)} KM</strong></p>
                    <p>Status: <strong>{orderDetails.status}</strong></p>
                    <p>Detalje dostave i praćenje možete pronaći na stranici "Moje Narudžbe".</p>
                </OrderInfo>
                <ButtonContainer>
                    <Link to="/orders" className="main-btn" onClick={onClose}>
                        Pogledajte Moje Narudžbe
                    </Link>
                    <button className="secondary-btn" onClick={onClose}>
                        Nastavite sa kupovinom
                    </button>
                </ButtonContainer>
            </ModalContent>
        </ModalOverlay>
    );
}

export default OrderSuccessModal;