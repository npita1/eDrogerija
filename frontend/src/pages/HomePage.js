import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/formatPrice';

// Styled Components (ostaju isti kao u tvom kodu)
const CategoryButton = styled.button.withConfig({
    shouldForwardProp: (prop) => !['active'].includes(prop)
})`
    background-color: ${(props) => props.active ? 'var(--primary-color)' : 'var(--background-color)'};
    color: ${(props) => props.active ? 'var(--white-color)' : 'var(--text-color)'};
    padding: 10px 20px;
    border-radius: 25px;
    font-size: 1em;
    font-weight: 500;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
    cursor: pointer;

    &:hover {
        background-color: var(--primary-color);
        color: var(--white-color);
        transform: translateY(-2px);
    }
`;

const ProductsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
    margin-top: 30px;
`;

const ProductCard = styled.div`
    background-color: var(--white-color);
    border-radius: 10px;
    box-shadow: var(--shadow-color) 0px 2px 10px;
    padding: 20px;
    text-align: center;
    transition: transform 0.2s ease-in-out;

    &:hover {
        transform: translateY(-5px);
    }

    img {
        max-width: 100%;
        height: 200px;
        object-fit: contain;
        border-radius: 5px;
        margin-bottom: 15px;
    }

    h3 {
        font-size: 1.3em;
        margin-bottom: 8px;
        color: var(--text-color);
    }

    p {
        font-size: 0.95em;
        color: var(--light-text-color);
        margin-bottom: 5px;
    }

    .price {
        font-size: 1.2em;
        font-weight: bold;
        color: var(--primary-color);
        margin-top: 10px;
    }

    button {
        background-color: var(--secondary-color);
        color: var(--white-color);
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 0.9em;
        margin-top: 15px;
        transition: background-color 0.3s ease;
        border: none;
        cursor: pointer;

    &:hover {
      background-color: var(--secondary-color);
      filter: brightness(0.95);
    }
    }
`;

const CategoriesContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
    padding: 20px;
    background-color: var(--white-color);
    border-radius: 10px;
    box-shadow: var(--shadow-color) 0px 2px 10px;
`;

const ALL_CATEGORIES = [
    { name: "ALL", displayName: "Svi Proizvodi" },
    { name: "ZDRAVLJE", displayName: "Zdravlje" },
    { name: "SMINKA", displayName: "Šminka" },
    { name: "HIGIJENA", displayName: "Higijena" },
    { name: "SUPLEMENTI", displayName: "Suplementi" },
    { name: "NJEGA_KOZE", displayName: "Njega kože" },
    { name: "NJEGA_KOSE", displayName: "Njega kose" },
    { name: "PARFEMI", displayName: "Parfemi" },
    { name: "MUSKA_NJEGA", displayName: "Muška njega" }
];

function HomePage() {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES[0].name);
    const API_GATEWAY_URL = '/api';

    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        axios.get(`${API_GATEWAY_URL}/products`)
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                toast.error("Greška pri učitavanju proizvoda.");
            });
    }, []);

    const filteredProducts = selectedCategory === ALL_CATEGORIES[0].name
        ? products
        : products.filter(product => product.category === selectedCategory);

    const handleAddToCart = async (product) => {
        await addToCart(product);
    };

    return (
        <div>
            <CategoriesContainer>
                {ALL_CATEGORIES.map((category) => (
                    <CategoryButton
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        active={selectedCategory === category.name}
                    >
                        {category.displayName}
                    </CategoryButton>
                ))}
            </CategoriesContainer>

            <ProductsContainer>
                {filteredProducts.map(product => (
                    <ProductCard key={product.id}>
                        <Link to={`/products/${product.id}`}>
                            <img src={product.imageUrl || 'https://via.placeholder.com/200'} alt={product.name} />
                            <h3>{product.name}</h3>
                            <p>{product.brand}</p>
                            {/* Ovdje koristimo formatPrice funkciju */}
                            <p className="price">{formatPrice(product.price)} KM</p>
                        </Link>
                        <button
                            onClick={() => handleAddToCart(product)}
                        >
                            Dodaj u korpu
                        </button>
                    </ProductCard>
                ))}
            </ProductsContainer>
        </div>
    );
}

export default HomePage;