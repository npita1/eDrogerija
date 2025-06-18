import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token')); // Ovo će sada držati 'token' string
  const API_GATEWAY_URL = 'http://localhost:8085/api';

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_GATEWAY_URL}/auth/login`, { username, password });
      
      // *** KLJUČNA IZMJENA OVDJE: Koristimo 'token' polje iz response.data ***
      const receivedToken = response.data.token; 
      
      if (!receivedToken) {
          console.error("Login response did not contain a token.");
          return false;
      }

      localStorage.setItem('jwt_token', receivedToken); // Spremi primljeni token
      setToken(receivedToken);

      // Dekodiranje tokena za dobivanje username-a (subjecta) i rola
      try {
        const base64Url = receivedToken.split('.')[1]; // Koristimo receivedToken ovdje
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedPayload = JSON.parse(jsonPayload);
        
        setUser({ 
            username: decodedPayload.sub, 
            roles: decodedPayload.roles || [], 
            email: decodedPayload.email || '' 
        });
      } catch (e) {
          console.error("Failed to decode token after login:", e);
          setUser({ username, roles: [] }); // Fallback na username ako dekodiranje ne uspije
      }
      
      return true; // Uspješna prijava
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      return false; // Neuspješna prijava
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_GATEWAY_URL}/auth/register`, { username, email, password });
      
      // *** KLJUČNA IZMJENA OVDJE: Koristimo 'token' polje iz response.data ***
      const receivedToken = response.data.token; 
      
      if (receivedToken) { // Automatski prijavi korisnika nakon registracije ako dobije token
          localStorage.setItem('jwt_token', receivedToken);
          setToken(receivedToken);
          // Dekodiraj i postavi korisnika kao i kod prijave
          try {
            const base64Url = receivedToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedPayload = JSON.parse(jsonPayload);
            setUser({ 
                username: decodedPayload.sub, 
                roles: decodedPayload.roles || [], 
                email: decodedPayload.email || '' 
            });
          } catch (e) {
              console.error("Failed to decode token after registration:", e);
              setUser({ username, roles: [] });
          }
      }

      return true; // Uspješna registracija (čak i ako nije automatski prijavljen)
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : error.message);
      return false; // Neuspješna registracija
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedPayload = JSON.parse(jsonPayload);
            
            const expirationTime = decodedPayload.exp * 1000;
            if (Date.now() >= expirationTime) {
                console.warn("JWT token has expired locally.");
                logout();
            } else {
                setUser({ 
                    username: decodedPayload.sub, 
                    roles: decodedPayload.roles || [],
                    email: decodedPayload.email || ''
                }); 
            }
        } catch (e) {
            console.error("Failed to decode token from localStorage or token invalid", e);
            logout();
        }
    }
  }, [token]);

  const value = { user, login, register, logout, token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};