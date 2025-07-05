import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Styled Components (ostaju isti kao u tvom kodu)
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
  text-align: left;

  h3 {
    font-size: 1.8em;
    color: var(--secondary-color);
    margin-bottom: 20px;
    text-align: center;

    @media (max-width: 768px) {
        font-size: 1.5em;
    }
  }

  p {
    color: var(--light-text-color);
    font-style: italic;
    text-align: center;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th, td {
    border: 1px solid var(--border-color);
    padding: 12px;
    text-align: left;
  }

  th {
    background-color: var(--primary-color);
    color: var(--white-color);
    font-weight: 600;
  }

  tr:nth-child(even) {
    background-color: var(--background-color);
  }

  .cancel-button {
    background-color: #ffc107;
    color: black;
    padding: 8px 15px;
    border-radius: 5px;
    font-size: 0.9em;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #e0a800;
    }
  }
`;

const LogoutButton = styled.button`
  background-color: #dc3545;
  color: var(--white-color);
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 30px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 20px;
  }
`;


function ProfilePage() {
    const { user, logout, getToken } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const API_GATEWAY_URL = '/api';

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    const fetchOrders = useCallback(async () => {
        if (!user) return;

        try {
            const token = getToken();
            const response = await axios.get(`${API_GATEWAY_URL}/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Filtriraj narudžbe prije nego što ih postaviš u stanje
            const activeOrders = response.data.filter(order => order.status !== 'CANCELLED');
            setOrders(activeOrders); // Postavljamo samo narudžbe koje nisu otkazane
        } catch (error) {
            console.error('Greška pri dohvatu narudžbi:', error);
            toast.error('Greška pri dohvatu vaših narudžbi.');
            if (error.response && error.response.status === 401) {
                toast.error('Sesija istekla, molimo prijavite se ponovo.');
                logout();
            }
        }
    }, [user, getToken, logout]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleCancelOrder = async (orderNumber) => {
        if (!window.confirm(`Da li ste sigurni da želite otkazati narudžbu ${orderNumber}?`)) {
            return;
        }

        try {
            const token = getToken();
            await axios.delete(`${API_GATEWAY_URL}/orders/${orderNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(`Narudžba ${orderNumber} je uspješno otkazana.`);
            fetchOrders(); // Osvježi listu narudžbi, što će sada automatski filtrirati otkazanu
        } catch (error) {
            console.error('Greška pri otkazivanju narudžbe:', error);
            if (error.response) {
                toast.error(`Greška: ${error.response.data || 'Neuspješno otkazivanje narudžbe.'}`);
            } else {
                toast.error('Došlo je do greške pri otkazivanju narudžbe.');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return null;
    }

    return (
        <ProfileContainer>
            <UserInfo>
                <h2>Dobrodošli, {user.username || 'Korisniče'}!</h2>
                <p>Email: {user.email || 'N/A'}</p>
            </UserInfo>

            <OrdersSection>
                <h3>Moje Narudžbe</h3>
                {/* Ovdje se narudžbe već filtriraju u fetchOrders, tako da 'orders' sadrži samo aktivne */}
                {orders.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Broj narudžbe</th>
                                <th>Datum</th>
                                <th>Ukupno</th>
                                <th>Status</th>
                                <th>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.orderNumber}>
                                    <td>{order.orderNumber}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>{order.totalAmount ? `${order.totalAmount.toFixed(2)} KM` : 'N/A'}</td>
                                    <td>{order.status}</td>
                                    <td>
                                        {order.status === 'PENDING' && (
                                            <button className="cancel-button" onClick={() => handleCancelOrder(order.orderNumber)}>
                                                Poništi
                                            </button>
                                        )}
                                        {/* Ako želite da se prikaže nešto za otkazane, npr. 'Otkazano' bez dugmeta, to bi išlo ovdje,
                                            ali po vašem zahtjevu, otkazane se uopće ne prikazuju. */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nema pronađenih narudžbi.</p>
                )}
            </OrdersSection>

            <LogoutButton onClick={handleLogout}>Odjavi se</LogoutButton>
        </ProfileContainer>
    );
}

export default ProfilePage;