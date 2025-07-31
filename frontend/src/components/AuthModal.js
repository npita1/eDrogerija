import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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
    width: 400px;
    max-width: 90%;
    box-shadow: 0px 5px 15px var(--shadow-color);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;

    @media (max-width: 480px) {
        padding: 20px;
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

const FormTitle = styled.h2`
    text-align: center;
    margin-bottom: 25px;
    color: var(--primary-color);
`;

const FormField = styled.div`
    margin-bottom: 15px;

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: var(--text-color);
    }

    input {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border-color);
        border-radius: 5px;
        font-size: 1em;
        box-sizing: border-box;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 12px;
    background-color: var(--primary-color);
    color: var(--white-color);
    border: none;
    border-radius: 5px;
    font-size: 1.1em;
    font-weight: 600;
    margin-top: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease, filter 0.3s ease;

    &:hover {
        filter: brightness(0.9);
    }
`;

const SwitchModeText = styled.p`
    text-align: center;
    margin-top: 20px;
    font-size: 0.9em;
    color: var(--text-color);

    span {
        color: var(--secondary-color);
        cursor: pointer;
        font-weight: 600;
        &:hover {
            text-decoration: underline;
        }
    }
`;

const ErrorMessage = styled.p`
    color: #dc3545;
    font-size: 0.9em;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 10px;
`;

function AuthModal({ onClose, initialMode = 'login' }) {
    const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');

    const { login, register } = useAuth();
    const [error, setError] = useState('');

    const resetFormFields = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setAddress('');
        setError('');
    };

    useEffect(() => {
        setIsLoginMode(initialMode === 'login');
        resetFormFields();
    }, [initialMode]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let success;
        try {
            if (isLoginMode) {

                success = await login(username, password); 

            } else {
                if (!username || !email || !password || !firstName || !lastName || !phoneNumber || !address) {
                    setError('Molimo popunite sva obavezna polja za registraciju.');
                    return;
                }

                success = await register(username, email, password, firstName, lastName, phoneNumber, address);

            }

            if (success) {
                onClose();
                resetFormFields();
            } else {

            }

        } catch (err) {
            console.error('Authentication error:', err.response ? err.response.data : err.message);
            setError('Došlo je do greške. Molimo pokušajte ponovo.');
            toast.error('Greška pri komunikaciji sa serverom!');
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>
                
                <FormTitle>{isLoginMode ? 'Prijava' : 'Registracija'}</FormTitle>

                <form onSubmit={handleFormSubmit}>
                    <FormField>
                        <label htmlFor="username">Korisničko ime:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Unesite korisničko ime"
                        />
                    </FormField>
                    
                    {!isLoginMode && (
                        <>
                            <FormField>
                                <label htmlFor="email">Email adresa:</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Unesite email"
                                />
                            </FormField>
                            <FormField>
                                <label htmlFor="firstName">Ime:</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    placeholder="Unesite ime"
                                />
                            </FormField>
                            <FormField>
                                <label htmlFor="lastName">Prezime:</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    placeholder="Unesite prezime"
                                />
                            </FormField>
                            <FormField>
                                <label htmlFor="phoneNumber">Broj telefona:</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    placeholder="Unesite broj telefona"
                                />
                            </FormField>
                            <FormField>
                                <label htmlFor="address">Adresa:</label>
                                <input
                                    type="text"
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                    placeholder="Unesite adresu"
                                />
                            </FormField>
                        </>
                    )}

                    <FormField>
                        <label htmlFor="password">Lozinka:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Unesite lozinku"
                        />
                    </FormField>

                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <SubmitButton type="submit">
                        {isLoginMode ? 'Prijavi se' : 'Registruj se'}
                    </SubmitButton>
                </form>

                <SwitchModeText>
                    {isLoginMode ? (
                        <>
                            Nemate račun? <span onClick={() => { setIsLoginMode(false); resetFormFields(); }}>Registrujte se</span>
                        </>
                    ) : (
                        <>
                            Već imate račun? <span onClick={() => { setIsLoginMode(true); resetFormFields(); }}>Prijavite se</span>
                        </>
                    )}
                </SwitchModeText>

            </ModalContent>
        </ModalOverlay>
    );
}

export default AuthModal;