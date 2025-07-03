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
    const { user, token } = useAuth(); // Dohvati user i token (direktno iz state-a AuthContext-a)
    const [isLoading, setIsLoading] = useState(false); // Praćenje globalnog loading stanja za cart operacije
    const [error, setError] = useState(null); // Praćenje grešaka za cart operacije

    const API_BASE_URL = 'http://localhost:8085/api';

    // Funkcija za dohvaćanje korpe sa backenda
    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartItems([]); // Isprazni korpu ako korisnik nije prijavljen
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Axios interceptor u AuthContext.js automatski dodaje Authorization header
            const response = await axios.get(`${API_BASE_URL}/cart`); 

            // Backend vraća 'items' kao listu CartItemResponse
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
            // Provjeri je li greška zbog isteka tokena (npr. 401 Unauthorized)
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                toast.error("Sesija je istekla ili nemate dozvolu. Molimo prijavite se ponovo.");
                setCartItems([]); // Isprazni korpu ako je sesija istekla
            } else {
                const errorMessage = err.response?.data?.message || err.message || 'Greška pri učitavanju košarice.';
                setError(errorMessage);
                toast.error("Greška pri učitavanju košarice: " + errorMessage);
                setCartItems([]); // U slučaju greške, isprazni korpu
            }
        } finally {
            setIsLoading(false);
        }
    }, [user, API_BASE_URL]);

    // Dohvati korpu kada se user promijeni ili kada se komponenta montira
    useEffect(() => {
        fetchCart();
    }, [user, fetchCart, token]); // Dodana token kao zavisnost da se osvježi pri login/logout

    // Funkcija za dodavanje proizvoda u korpu
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
                await fetchCart(); // Osvježi stanje korpe nakon uspješnog dodavanja
                toast.success(`${productToAdd.name} (x${quantity}) dodan u košaricu!`);
                return true; // Uspjeh
            } else {
                throw new Error(response.data.message || 'Neuspješno dodavanje proizvoda u košaricu.');
            }
        } catch (err) {
            console.error("Error adding to cart:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Greška pri dodavanju u košaricu.';
            setError(errorMessage);
            toast.error("Greška pri dodavanju u košaricu: " + errorMessage);
            return false; // Neuspjeh
        } finally {
            setIsLoading(false);
        }
    };

    // Funkcija za uklanjanje proizvoda iz korpe
    const removeFromCart = async (productId) => {
        if (!user) return; // Nema potrebe za toastom ovdje jer se ne bi trebalo ni doći ovamo bez usera
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

    // Funkcija za povećanje količine
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

    // Funkcija za smanjenje količine
    const decreaseQuantity = async (productId) => {
        if (!user) return;
        const currentItem = cartItems.find(item => item.id === productId);
        if (!currentItem) return;

        const newQuantity = Math.max(0, currentItem.quantity - 1); // Količina ne može biti manja od 0
        
        if (newQuantity === 0) {
            await removeFromCart(productId); // Ako količina padne na 0, ukloni proizvod
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

    // Funkcija za brisanje cijele korpe
    const clearCart = async () => {
        if (!user) return;
        // Bolje koristiti custom modal umjesto window.confirm za bolji UX, ali zadržavam tvoju implementaciju
        if (!window.confirm("Jeste li sigurni da želite isprazniti cijelu košaricu?")) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_BASE_URL}/cart/clear`); 
            await fetchCart(); // Osvježi korpu (trebala bi biti prazna)
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

    // NOVA FUNKCIJA ZA KREIRANJE NARUDŽBE
    const placeOrder = async () => {
        if (!user) {
            toast.error("Morate biti prijavljeni da biste naručili.");
            return null; // Vraća null ako korisnik nije prijavljen
        }
        if (cartItems.length === 0) {
            toast.warn("Vaša košarica je prazna. Dodajte proizvode prije naručivanja.");
            return null; // Vraća null ako je korpa prazna
        }

        setIsLoading(true);
        setError(null);
        try {
            // Frontend ne šalje nikakav body, backend koristi @AuthenticationPrincipal UserDetails
            const response = await axios.post(`${API_BASE_URL}/orders`);
            // Backend treba vratiti OrderResponse objekt
            
            // Nakon uspješne narudžbe, osvježi košaricu (backend bi je trebao isprazniti)
            await fetchCart();
            // Toast poruka se prikazuje iz ovog contexta
            toast.success("Narudžba uspješno poslana!");
            return response.data; // Vrati podatke o narudžbi
        } catch (err) {
            console.error("Error placing order:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Greška pri slanju narudžbe.';
            setError(errorMessage);
            toast.error("Greška pri slanju narudžbe: " + errorMessage);
            return null; // Vraća null u slučaju greške
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
        placeOrder, // Dodana placeOrder funkcija u kontekst
        calculateTotalPrice,
        totalItemsInCart,
        isLoading, // Dostupan za komponente da prate loading
        error, // Dostupan za komponente da prate greške
        fetchCart, // Dodana fetchCart funkcija ako komponenti treba ručno osvježavanje
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};