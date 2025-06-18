import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const DetailContainer = styled.div`
    background-color: var(--white-color);
    padding: 40px;
    border-radius: 10px;
    box-shadow: var(--shadow-color) 0px 2px 10px;
    display: flex;
    gap: 40px;
    align-items: flex-start;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        padding: 20px;
    }
`;

const ProductImage = styled.img`
    width: 400px;
    height: 400px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid var(--border-color);

    @media (max-width: 768px) {
        width: 100%;
        height: auto;
        max-height: 300px;
        margin-bottom: 20px;
    }
`;

const ProductInfo = styled.div`
    flex: 1;

    h2 {
        font-size: 2.5em;
        color: var(--primary-color);
        margin-bottom: 15px;

        @media (max-width: 768px) {
            font-size: 1.8em;
            text-align: center;
        }
    }

    p {
        font-size: 1.1em;
        margin-bottom: 10px;
        color: var(--text-color);

        @media (max-width: 768px) {
            font-size: 1em;
            text-align: center;
        }
    }

    .price {
        font-size: 1.8em;
        font-weight: bold;
        color: var(--secondary-color);
        margin-top: 20px;
        margin-bottom: 20px;
        @media (max-width: 768px) {
            font-size: 1.5em;
            text-align: center;
        }
    }

    button {
        background-color: var(--primary-color);
        color: var(--white-color);
        padding: 12px 25px;
        border-radius: 25px;
        font-size: 1.1em;
        font-weight: 600;
        transition: background-color 0.3s ease;
        width: auto; // Podesi širinu dugmeta

        &:hover {
            filter: brightness(0.9); 
        }

        @media (max-width: 768px) {
            width: 100%;
            margin-top: 20px;
        }
    }
`;

function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState('');
    const API_GATEWAY_URL = 'http://localhost:8085/api';

    useEffect(() => {
        setError(''); // Očisti greške pri svakoj promjeni ID-a
        
        // *** KLJUČNA IZMJENA OVDJE: Validacija za Long ID ***
        // Provjerava da li je ID definiran, da li je broj i da li je veći od nule (opcionalno, ali dobra praksa za ID-eve)
        if (!id || isNaN(Number(id)) || Number(id) <= 0) {
            setError("Nevažeći ID proizvoda (očekivan numerički ID).");
            setProduct(null);
            return;
        }

        axios.get(`${API_GATEWAY_URL}/products/${id}`)
            .then(response => {
                setProduct(response.data);
            })
            .catch(error => {
                console.error("Error fetching product details:", error);
                // Ako je 404, specificiraj poruku "Proizvod nije pronađen"
                if (error.response && error.response.status === 404) {
                    setError("Proizvod sa datim ID-jem nije pronađen.");
                } else {
                    setError("Greška pri dohvatu detalja proizvoda. Molimo pokušajte ponovo.");
                }
                setProduct(null);
            });
    }, [id]); // Ovisnost o `id` osigurava da se useEffect ponovo pokrene kada se id promijeni

    if (error) {
        return (
            <div>
                <Link to="/products" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--light-text-color)' }}>
                    &lt; Povratak na proizvode
                </Link>
                <DetailContainer style={{ textAlign: 'center', display: 'block' }}>
                    <p style={{ color: '#dc3545', fontSize: '1.2em' }}>{error}</p>
                </DetailContainer>
            </div>
        );
    }

    if (!product) {
        return (
            <div>
                <Link to="/products" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--light-text-color)' }}>
                    &lt; Povratak na proizvode
                </Link>
                <DetailContainer style={{ textAlign: 'center', display: 'block' }}>
                    <div>Učitavanje proizvoda...</div>
                </DetailContainer>
            </div>
        );
    }

    return (
        <div>
            <Link to="/products" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--light-text-color)' }}>
                &lt; Povratak na proizvode
            </Link>
            <DetailContainer>
                <ProductImage src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.name} />
                <ProductInfo>
                    <h2>{product.name}</h2>
                    <p><strong>Brend:</strong> {product.brand}</p>
                    <p><strong>Kategorija:</strong> {product.category}</p> {/* Prikazat će naziv enuma (npr. NJEGA_KOZE) */}
                    <p><strong>Opis:</strong> {product.description}</p>
                    <p><strong>Dostupna količina:</strong> {product.quantity}</p>
                    <p className="price">{product.price} KM</p>
                    <button>Dodaj u korpu</button>
                </ProductInfo>
            </DetailContainer>
        </div>
    );
}

export default ProductDetailPage;