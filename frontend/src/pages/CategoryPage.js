import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';


const CategoryPageContainer = styled.div`
    background-color: var(--white-color);
    padding: 40px;
    border-radius: 10px;
    box-shadow: var(--shadow-color) 0px 2px 10px;
    text-align: center;
`;

function CategoryPage() {
    const { categoryName } = useParams();

    return (
        <CategoryPageContainer>
            <h2>Proizvodi u kategoriji: {categoryName}</h2>
            <p>Ovdje će biti lista proizvoda filtriranih po '{categoryName}'.</p>
            <Link to="/products" style={{ marginTop: '20px', display: 'inline-block', color: 'var(--primary-color)' }}>
                &lt; Pogledaj sve proizvode
            </Link>
        </CategoryPageContainer>
    );
}

export default CategoryPage;