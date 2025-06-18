import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: var(--primary-color);
  color: var(--white-color);
  padding: 20px 0;
  text-align: center;
  box-shadow: var(--shadow-color) 0px -2px 8px;
  margin-top: 50px; /* Dodaj malo razmaka od sadržaja */
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const CopyrightText = styled.p`
  font-size: 0.9em;
  margin: 0;
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <CopyrightText>&copy; {new Date().getFullYear()} eDrogerija. Sva prava zadržana.</CopyrightText>
      </FooterContent>
    </FooterContainer>
  );
}

export default Footer;