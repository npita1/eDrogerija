import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';

const OrdersContainer = styled.div`
    background-color: var(--white-color);
    padding: 30px;
    border-radius: 10px;
    box-shadow: var(--shadow-color) 0px 2px 10px;
    max-width: 900px; /* Ograniči širinu kao i za CartPage */
    margin: 0 auto; /* Centriraj */

    h2 {
        color: var(--primary-color);
        margin-bottom: 25px;
        text-align: center;
    }
`;

const EmptyOrdersMessage = styled.div`
    text-align: center;
    padding: 50px 0;
    font-size: 1.2em;
    color: var(--light-text-color);
`;

const OrderCard = styled.div`
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 20px;
    padding: 20px;
    background-color: var(--background-color-light); /* Definiraj ovu boju (npr. #f8f9fa) */
    box-shadow: 0px 1px 5px rgba(0,0,0,0.05);

    h3 {
        color: var(--secondary-color);
        margin-bottom: 10px;
        font-size: 1.3em;
    }

    p {
        margin-bottom: 5px;
        color: var(--text-color);
    }

    .order-summary {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px dashed var(--border-color);
        font-weight: 600;
    }

    /* Boje statusa */
    .status-PENDING { color: orange; }
    .status-PROCESSING { color: blue; }
    .status-SHIPPED { color: var(--primary-color); }
    .status-DELIVERED { color: var(--success-color); }
    .status-CANCELLED { color: #dc3545; }
`;

const API_GATEWAY_URL = '/api';

function OrderList() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setError("Morate biti prijavljeni da biste vidjeli narudžbe.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_GATEWAY_URL}/orders`);
                setOrders(response.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
                const errorMessage = err.response?.data?.message || err.message || 'Greška pri učitavanju narudžbi.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (isLoading) {
        return <OrdersContainer style={{textAlign: 'center'}}>Učitavanje narudžbi...</OrdersContainer>;
    }

    if (error) {
        return <OrdersContainer style={{textAlign: 'center', color: '#dc3545'}}>{error}</OrdersContainer>;
    }

    return (
        <OrdersContainer>
            <h2>Moje Narudžbe</h2>
            {orders.length === 0 ? (
                <EmptyOrdersMessage>
                    Nemate još narudžbi.
                    <p><Link to="/products" style={{color: 'var(--secondary-color)'}}>Započnite kupovinu!</Link></p>
                </EmptyOrdersMessage>
            ) : (
                orders.map(order => (
                    <OrderCard key={order.orderNumber}>
                        <h3>Narudžba #{order.orderNumber}</h3>
                        <p>Datum: {new Date(order.orderDate).toLocaleDateString()} {new Date(order.orderDate).toLocaleTimeString()}</p>
                        <p>Status: <span className={`status-${order.status}`}>{order.status}</span></p> {/* Status je već UPPERCASE, pa bez .toLowerCase() */}
                        
                        {/* Prikaz stavki narudžbe (opcionalno, može se prebaciti u OrderDetail stranicu) */}
                        <div style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                            <strong>Proizvodi:</strong>
                            {order.orderItems && order.orderItems.map(item => (
                                <p key={item.id} style={{fontSize: '0.9em', marginLeft: '10px'}}>
                                    {item.productName} ({item.quantity} kom.) - {formatPrice(item.unitPrice)} KM/kom.
                                </p>
                            ))}
                        </div>

                        <div className="order-summary">
                            <span>Ukupan iznos:</span>
                            <span>{formatPrice(order.totalAmount)} KM</span>
                        </div>
                        {/* Možeš dodati dugme za pregled detalja pojedinačne narudžbe */}
                        {/* <Link to={`/orders/${order.orderNumber}`}>Vidi detalje</Link> */}
                    </OrderCard>
                ))
            )}
        </OrdersContainer>
    );
}

export default OrderList;