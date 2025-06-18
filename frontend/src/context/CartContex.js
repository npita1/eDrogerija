import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Pokušaj učitati iz localStorage-a pri inicijalizaciji
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sačuvaj korpu u localStorage svaki put kada se cartItems promijeni
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const increaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      ).filter(item => item.quantity > 0) // Ukloni ako količina padne na 0
    );
  };

  // NOVO: Funkcija za izračunavanje ukupne cijene
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // NOVO: Funkcija za brojanje ukupnog broja stavki u korpi (ako je koristiš u Headeru)
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);


  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    calculateTotalPrice, // OBAVEZNO DODAJ OVDJE
    totalItemsInCart     // Dodaj i ovo ako ga koristiš u Headeru
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};