import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa'; // Ikona za zatvaranje modala
import { useAuth } from '../context/AuthContext'; // Uvezi useAuth hook

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
  z-index: 1000; // Prikazuje se iznad svega
`;

const ModalContent = styled.div`
  background: var(--white-color);
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0px 5px 15px var(--shadow-color);
  position: relative;
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
  z-index: 10; // Osiguraj da je iznad ostalog sadržaja
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
  }

  input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    font-size: 1em;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: var(--white-color);
  border-radius: 5px;
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: filter: brightness(0.9); // Alternative to darken for JS
  }
`;

const SwitchModeText = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: 0.9em;

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
  color: #dc3545; // Crvena boja
  font-size: 0.9em;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;


function AuthModal({ onClose }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState(''); // Koristimo username
  const [email, setEmail] = useState('');      // Email samo za registraciju
  const [password, setPassword] = useState('');
  const { login, register } = useAuth(); // Dohvati funkcije login i register iz konteksta
  const [error, setError] = useState(''); // Za prikaz grešaka

  const handleFormSubmit = async (e) => { // Dodaj async
    e.preventDefault();
    setError(''); // Očisti prethodne greške

    let success;
    if (isLoginMode) {
      success = await login(username, password); // Pozovi login sa username i password
    } else {
      success = await register(username, email, password); // Pozovi register
    }

    if (success) {
      onClose(); // Zatvori modal samo ako je uspješno
    } else {
      setError('Neuspješna prijava/registracija. Provjerite podatke.'); 
      // Možeš dodati specifičnije poruke na osnovu error.response.data ako ih backend vraća
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
            <label htmlFor="username">Korisničko ime</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormField>
          
          {!isLoginMode && ( // Email je potreban samo za registraciju
            <FormField>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
          )}

          <FormField>
            <label htmlFor="password">Lozinka</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          {error && <ErrorMessage>{error}</ErrorMessage>} {/* Prikaz greške */}

          <SubmitButton type="submit">
            {isLoginMode ? 'Prijavi se' : 'Registruj se'}
          </SubmitButton>
        </form>

        <SwitchModeText>
          {isLoginMode ? (
            <>
              Nemate račun? <span onClick={() => { setIsLoginMode(false); setError(''); }}>Registrujte se</span>
            </>
          ) : (
            <>
              Već imate račun? <span onClick={() => { setIsLoginMode(true); setError(''); }}>Prijavite se</span>
            </>
          )}
        </SwitchModeText>

      </ModalContent>
    </ModalOverlay>
  );
}

export default AuthModal;