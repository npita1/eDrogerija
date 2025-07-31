import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { user, token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = '/api';


    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartItems([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {

            const response = await axios.get(`${API_BASE_URL}/cart`); 

            const mappedCartItems = response.data.items.map(item => ({
                id: item.productId, 
                name: item.productName,
                price: parseFloat(item.price), 
                quantity: item.quantity,
                imageUrl: item.imageUrl
            }));
            setCartItems(mappedCartItems);
        } catch (err) {
            console.error("Error fetching cart:", err);

            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                toast.error("Sesija je istekla ili nemate dozvolu. Molimo prijavite se ponovo.");
                setCartItems([]); 
            } else {
                const errorMessage = err.response?.data?.message || err.message || 'Greška pri učitavanju košarice.';
                setError(errorMessage);
                toast.error("Greška pri učitavanju košarice: " + errorMessage);
                setCartItems([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [user, API_BASE_URL]);

    useEffect(() => {
        fetchCart();
    }, [user, fetchCart, token]);


    const addToCart = async (productToAdd, quantity = 1) => { 
        if (!user) {
            toast.info('Molimo prijavite se da biste dodali proizvod u košaricu.');
            return false;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/cart/add`, {
                productId: productToAdd.id,
                quantity: quantity, 
            });

            if (response.status === 200 || response.status === 201) {
                await fetchCart();
                toast.success(`${productToAdd.name} (x${quantity}) dodan u košaricu!`);
                return true;
            } else {
                throw new Error(response.data.message || 'Neuspješno dodavanje proizvoda u košaricu.');
            }
        } catch (err) {
            console.error("Error adding to cart:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Greška pri dodavanju u košaricu.';
            setError(errorMessage);
            toast.error("Greška pri dodavanju u košaricu: " + errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };


    const removeFromCart = async (productId) => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_BASE_URL}/cart/remove/${productId}`); 
            await fetchCart();
            toast.info("Proizvod uklonjen iz košarice.");
        } catch (err) {
            console.error("Error removing from cart:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Greška pri uklanjanju iz košarice.';
            setError(errorMessage);
            toast.error("Greška pri uklanjanju iz košarice: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    const increaseQuantity = async (productId) => {
        if (!user) return;
        const currentItem = cartItems.find(item => item.id === productId);
        if (!currentItem) return;

        const newQuantity = currentItem.quantity + 1;

        setIsLoading(true);
        setError(null);
        try {
            await axios.put(`${API_BASE_URL}/cart/update/${productId}?quantity=${newQuantity}`);
            await fetchCart();
            toast.success("Količina ažurirana!");
        } catch (err) {
            console.error("Error increasing quantity:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Greška pri povećanju količine.';
            setError(errorMessage);
            toast.error("Greška pri povećanju količine: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    const decreaseQuantity = async (productId) => {
        if (!user) return;
        const currentItem = cartItems.find(item => item.id === productId);
        if (!currentItem) return;

        const newQuantity = Math.max(0, currentItem.quantity - 1);
        
        if (newQuantity === 0) {
            await removeFromCart(productId);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await axios.put(`${API_BASE_URL}/cart/update/${productId}?quantity=${newQuantity}`);
            await fetchCart();
            toast.success("Količina ažurirana!");
        } catch (err) {
            console.error("Error decreasing quantity:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Greška pri smanjenju količine.';
            setError(errorMessage);
            toast.error("Greška pri smanjenju količine: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    const clearCart = async () => {
        if (!user) return;

        if (!window.confirm("Jeste li sigurni da želite isprazniti cijelu košaricu?")) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_BASE_URL}/cart/clear`); 
            await fetchCart();
            toast.info("Košarica je ispražnjena.");
        } catch (err) {
            console.error("Error clearing cart:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Greška pri pražnjenju košarice.';
            setError(errorMessage);
            toast.error("Greška pri pražnjenju košarice: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    const placeOrder = async () => {
        if (!user) {
            toast.error("Morate biti prijavljeni da biste naručili.");
            return null;
        }
        if (cartItems.length === 0) {
            toast.warn("Vaša košarica je prazna. Dodajte proizvode prije naručivanja.");
            return null;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/orders`);
            
            await fetchCart();
            toast.success("Narudžba uspješno poslana!");
            return response.data;
        } catch (err) {
            console.error("Error placing order:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Greška pri slanju narudžbe.';
            setError(errorMessage);
            toast.error("Greška pri slanju narudžbe: " + errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const calculateTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);

    const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        placeOrder,
        calculateTotalPrice,
        totalItemsInCart,
        isLoading,
        error,
        fetchCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};