import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Potrebno za JWT token
import { toast } from 'react-toastify'; // Za notifikacije

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { user, getToken } = useAuth(); // Dohvati user i getToken funkciju iz AuthContext-a
    const [isLoading, setIsLoading] = useState(false); // Novo: za indikator učitavanja
    const [error, setError] = useState(null); // Novo: za greške

    // TODO: PRILAGODI OVAJ URL AKO JE DRUGI URL ZA BACKEND API
    const API_BASE_URL = 'http://localhost:8080/api'; 

    // Funkcija za dohvaćanje JWT tokena i postavljanje headera
    const getAuthHeaders = useCallback(async () => {
        const token = await getToken(); // Koristi getToken iz AuthContext-a
        if (!token) {
            console.error("No authentication token available.");
            return {};
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }, [getToken]); // Zavisnost od getToken

    // Funkcija za dohvaćanje korpe sa backenda
    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartItems([]); // Ako korisnik nije prijavljen, isprazni korpu na frontendu
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Ako je neautorizovan, možda je token istekao, isprazni korpu
                    setCartItems([]);
                    toast.error("Sesija je istekla. Molimo prijavite se ponovo.");
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch cart.');
            }

            const data = await response.json();
            // Backend vraća 'items' kao listu CartItemResponse
            // Frontend očekuje 'id', 'name', 'price', 'quantity', 'imageUrl' na nivou stavke
            const mappedCartItems = data.items.map(item => ({
                id: item.productId, // Koristimo productId kao id za frontend logiku korpe
                name: item.productName,
                price: parseFloat(item.price), // Parsiraj BigDecimal u number
                quantity: item.quantity,
                imageUrl: item.imageUrl
            }));
            setCartItems(mappedCartItems);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError(err.message);
            setCartItems([]); // U slučaju greške, isprazni korpu
            toast.error("Greška pri učitavanju košarice: " + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user, getAuthHeaders]); // Zavisnost od user i getAuthHeaders

    // Dohvati korpu kada se user promijeni ili kada se komponenta montira
    useEffect(() => {
        fetchCart();
    }, [user, fetchCart]);

    // Funkcija za dodavanje proizvoda u korpu
    const addToCart = async (productToAdd) => {
        if (!user) {
            toast.info('Molimo prijavite se da biste dodali proizvod u košaricu.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    productId: productToAdd.id,
                    quantity: 1, // Uvijek dodajemo jedan po jedan kada kliknemo "Add to cart"
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product to cart.');
            }

            // Nakon uspješnog dodavanja, ponovo dohvati korpu da sinhronizuješ frontend sa backendom
            await fetchCart();
            toast.success(`${productToAdd.name} dodan u košaricu!`);
        } catch (err) {
            console.error("Error adding to cart:", err);
            setError(err.message);
            toast.error("Greška pri dodavanju u košaricu: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Funkcija za uklanjanje proizvoda iz korpe
    const removeFromCart = async (productId) => {
        if (!user) return; // Ne dozvoli akciju ako user nije prijavljen
        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
                method: 'DELETE',
                headers: headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove product from cart.');
            }

            await fetchCart();
            toast.info("Proizvod uklonjen iz košarice.");
        } catch (err) {
            console.error("Error removing from cart:", err);
            setError(err.message);
            toast.error("Greška pri uklanjanju iz košarice: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Funkcija za povećanje količine
    const increaseQuantity = async (productId) => {
        if (!user) return; // Ne dozvoli akciju ako user nije prijavljen
        const currentItem = cartItems.find(item => item.id === productId);
        if (!currentItem) return;

        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/cart/update/${productId}?quantity=${currentItem.quantity + 1}`, {
                method: 'PUT',
                headers: headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to increase quantity.');
            }

            await fetchCart();
            toast.success("Količina ažurirana!");
        } catch (err) {
            console.error("Error increasing quantity:", err);
            setError(err.message);
            toast.error("Greška pri povećanju količine: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Funkcija za smanjenje količine
    const decreaseQuantity = async (productId) => {
        if (!user) return; // Ne dozvoli akciju ako user nije prijavljen
        const currentItem = cartItems.find(item => item.id === productId);
        if (!currentItem) return;

        const newQuantity = Math.max(0, currentItem.quantity - 1); // Količina ne može ići ispod 0
        
        // Ako količina padne na 0, ukloni proizvod iz korpe
        if (newQuantity === 0) {
            await removeFromCart(productId);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/cart/update/${productId}?quantity=${newQuantity}`, {
                method: 'PUT',
                headers: headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to decrease quantity.');
            }

            await fetchCart();
            toast.success("Količina ažurirana!");
        } catch (err) {
            console.error("Error decreasing quantity:", err);
            setError(err.message);
            toast.error("Greška pri smanjenju količine: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Funkcija za izračunavanje ukupne cijene (na frontendu)
    // Koristimo ga i dalje za frontend rendering jer to radi na osnovu trenutnog cartItems stanja
    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // Ukupan broj stavki u korpi (za Header, itd.)
    const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        calculateTotalPrice,
        totalItemsInCart,
        isLoading, // Izloži isLoading status
        error,     // Izloži error status
        fetchCart, // Izloži fetchCart da se može ručno pozvati ako zatreba
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};