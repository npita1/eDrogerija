import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('jwt_token'));
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_GATEWAY_URL = 'http://localhost:8085/api';

    const decodeJwt = useCallback((jwtToken) => {
        try {
            const base64Url = jwtToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            // Važno: Pretpostavljamo da tvoj JWT token sadrži 'id' claim
            // Ako ne sadrži, morat ćeš prilagoditi backend da ga uključi
            return {
                id: decoded.id, // DODANO: ID korisnika iz JWT tokena (provjeri da li tvoj token ima 'id' claim)
                sub: decoded.sub, // Username
                roles: decoded.roles, // Uloge
                email: decoded.email, // Email, ako postoji
                exp: decoded.exp // Expiration time
            };
        } catch (e) {
            console.error("Failed to decode token:", e);
            return null;
        }
    }, []);

    const getToken = useCallback(() => {
        return localStorage.getItem('jwt_token');
    }, []);

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_GATEWAY_URL}/auth/login`, { username, password });
            const receivedToken = response.data.token;
            
            if (!receivedToken) {
                console.error("Login response did not contain a token.");
                setError("Neuspješna prijava. Token nije primljen.");
                toast.error("Neuspješna prijava. Token nije primljen.");
                return false;
            }

            localStorage.setItem('jwt_token', receivedToken);
            setToken(receivedToken);

            const decodedPayload = decodeJwt(receivedToken);
            if (decodedPayload) {
                setUser({
                    id: decodedPayload.id, // DODANO: ID korisnika iz JWT tokena
                    username: decodedPayload.sub,
                    roles: decodedPayload.roles || [],
                    email: decodedPayload.email || ''
                });
                toast.success("Uspješna prijava!");
            } else {
                setUser({ username: username, roles: [], email: '' }); // Fallback
                toast.warning("Uspješna prijava, ali podaci o korisniku nisu potpuno učitani.");
            }
            
            return true;
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.message || 'Neispravno korisničko ime ili lozinka.';
            setError(errorMessage);
            toast.error("Greška pri prijavi: " + errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username, email, password, firstName, lastName, phoneNumber, address) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_GATEWAY_URL}/auth/register`, {
                username,
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
                address
            });
            
            const receivedToken = response.data.token;
            
            if (receivedToken) {
                localStorage.setItem('jwt_token', receivedToken);
                setToken(receivedToken);
                
                const decodedPayload = decodeJwt(receivedToken);
                if (decodedPayload) {
                    setUser({
                        id: decodedPayload.id, // DODANO: ID korisnika iz JWT tokena
                        username: decodedPayload.sub,
                        roles: decodedPayload.roles || [],
                        email: decodedPayload.email || ''
                    });
                    toast.success("Registracija uspješna! Prijavljeni ste.");
                } else {
                    setUser({ username, roles: [], email }); // Fallback
                    toast.warning("Registracija uspješna, ali podaci o korisniku nisu potpuno učitani.");
                }
            } else {
                toast.success("Registracija uspješna! Molimo prijavite se.");
            }

            return true;
        } catch (error) {
            console.error('Registration failed:', error.response ? error.response.data : error.message);
            const errorMessage = error.response?.data?.message || 'Registracija neuspješna.';
            setError(errorMessage);
            toast.error("Greška pri registraciji: " + errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        toast.info("Odjavljeni ste.");
    };

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(config => {
            const currentToken = localStorage.getItem('jwt_token');
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`;
            }
            return config;
        }, error => {
            return Promise.reject(error);
        });

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    useEffect(() => {
        const storedToken = getToken();
        if (storedToken) {
            const decodedPayload = decodeJwt(storedToken);
            if (decodedPayload) {
                const expirationTime = decodedPayload.exp * 1000;
                if (Date.now() >= expirationTime) {
                    console.warn("JWT token has expired locally.");
                    logout();
                } else {
                    setUser({
                        id: decodedPayload.id, // DODANO: ID korisnika iz JWT tokena
                        username: decodedPayload.sub,
                        roles: decodedPayload.roles || [],
                        email: decodedPayload.email || ''
                    });
                }
            } else {
                logout();
            }
        }
        setIsLoading(false);
    }, [getToken, decodeJwt]);

    const value = { user, login, register, logout, token, getToken, isLoading, error };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};