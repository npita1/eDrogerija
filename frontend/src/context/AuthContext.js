import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import axios from 'axios';

import { toast } from 'react-toastify'; // Dodano za toast notifikacije


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(localStorage.getItem('jwt_token'));

    const [isLoading, setIsLoading] = useState(true); // Dodano: za praćenje statusa učitavanja

    const [error, setError] = useState(null); // Dodano: za greške


    // IZMIJENJENO: API Gateway URL na port 8085

    const API_GATEWAY_URL = 'http://localhost:8085/api';


    // Funkcija za dekodiranje JWT tokena (pomoćna funkcija)

    const decodeJwt = useCallback((jwtToken) => {

        try {

            const base64Url = jwtToken.split('.')[1];

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {

                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);

            }).join(''));

            return JSON.parse(jsonPayload);

        } catch (e) {

            console.error("Failed to decode token:", e);

            return null;

        }

    }, []);


    // DODANO: Funkcija za dohvaćanje tokena (za upotrebu u drugim kontekstima/komponentama)

    const getToken = useCallback(() => {

        return localStorage.getItem('jwt_token');

    }, []);


    const login = async (username, password) => {

        setIsLoading(true); // DODANO

        setError(null);    // DODANO

        try {

            // IZMIJENJENO: Endpoint za login je sada /auth/authenticate prema tvom backendu

            const response = await axios.post(`${API_GATEWAY_URL}/auth/login`, { username, password });

           

            const receivedToken = response.data.token;

           

            if (!receivedToken) {

                console.error("Login response did not contain a token.");

                setError("Neuspješna prijava. Token nije primljen."); // DODANO

                toast.error("Neuspješna prijava. Token nije primljen."); // DODANO

                return false;

            }


            localStorage.setItem('jwt_token', receivedToken);

            setToken(receivedToken);


            const decodedPayload = decodeJwt(receivedToken); // Koristi pomoćnu funkciju

            if (decodedPayload) {

                setUser({

                    username: decodedPayload.sub, // 'sub' bi trebao biti username

                    roles: decodedPayload.roles || [],

                    email: decodedPayload.email || ''

                });

                toast.success("Uspješna prijava!"); // DODANO

            } else {

                setUser({ username: username, roles: [], email: '' }); // Fallback

                toast.warning("Uspješna prijava, ali podaci o korisniku nisu potpuno učitani."); // DODANO

            }

           

            return true;

        } catch (error) {

            console.error('Login failed:', error.response ? error.response.data : error.message);

            const errorMessage = error.response?.data?.message || 'Neispravno korisničko ime ili lozinka.'; // DODANO

            setError(errorMessage); // DODANO

            toast.error("Greška pri prijavi: " + errorMessage); // DODANO

            return false;

        } finally {

            setIsLoading(false); // DODANO

        }

    };


    // IZMIJENJENO: Dodani firstName, lastName, phoneNumber, address za registraciju

    const register = async (username, email, password, firstName, lastName, phoneNumber, address) => {

        setIsLoading(true); // DODANO

        setError(null);    // DODANO

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

               

                const decodedPayload = decodeJwt(receivedToken); // Koristi pomoćnu funkciju

                if (decodedPayload) {

                    setUser({

                        username: decodedPayload.sub,

                        roles: decodedPayload.roles || [],

                        email: decodedPayload.email || ''

                    });

                    toast.success("Registracija uspješna! Prijavljeni ste."); // DODANO

                } else {

                    setUser({ username, roles: [], email }); // Fallback

                    toast.warning("Registracija uspješna, ali podaci o korisniku nisu potpuno učitani."); // DODANO

                }

            } else {

                toast.success("Registracija uspješna! Molimo prijavite se."); // DODANO

            }


            return true;

        } catch (error) {

            console.error('Registration failed:', error.response ? error.response.data : error.message);

            const errorMessage = error.response?.data?.message || 'Registracija neuspješna.'; // DODANO

            setError(errorMessage); // DODANO

            toast.error("Greška pri registraciji: " + errorMessage); // DODANO

            return false;

        } finally {

            setIsLoading(false); // DODANO

        }

    };


    const logout = () => {

        localStorage.removeItem('jwt_token');

        setToken(null);

        setUser(null);

        delete axios.defaults.headers.common['Authorization']; // DODANO: Ukloni header i pri odjavi

        toast.info("Odjavljeni ste."); // DODANO

    };


    // IZMIJENJENO: Axios interceptor umjesto direktnog postavljanja headera u useEffect

    // Ovo osigurava da se token šalje sa SVIM Axios zahtjevima

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


        // Cleanup function for the interceptor

        return () => {

            axios.interceptors.request.eject(requestInterceptor);

        };

    }, []);


    // Učitavanje korisnika pri prvom renderu ili osvježavanju stranice

    useEffect(() => {

        const storedToken = getToken();

        if (storedToken) {

            const decodedPayload = decodeJwt(storedToken);

            if (decodedPayload) {

                const expirationTime = decodedPayload.exp * 1000;

                if (Date.now() >= expirationTime) {

                    console.warn("JWT token has expired locally.");

                    logout(); // Odjavi ako je token istekao

                } else {

                    setUser({

                        username: decodedPayload.sub,

                        roles: decodedPayload.roles || [],

                        email: decodedPayload.email || ''

                    });

                }

            } else {

                logout(); // Odjavi ako token nije validan

            }

        }

        setIsLoading(false); // DODANO: Postavi isLoading na false nakon provjere tokena

    }, [getToken, decodeJwt]); // Dodane zavisnosti


    const value = { user, login, register, logout, token, getToken, isLoading, error }; // DODANO: getToken, isLoading, error


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

};


export const useAuth = () => {

    return useContext(AuthContext);

};

