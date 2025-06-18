import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    // Definisanje palete boja na osnovu logotipa
    // Molim te, prilagodi ove heksadecimalne vrijednosti nakon što vidiš logo i odlučiš se
    // Ovo su samo primjeri nježnih tonova
    --primary-color: #A7BCCB; // Npr. nježno plava
    --secondary-color: #E2B2B6; // Npr. nježno roza
    --accent-color: #B5EAD7;   // Npr. nježno zelena
    --text-color: #333333;     // Tamno siva za tekst
    --light-text-color: #666666; // Svjetlija siva
    --background-color: #F8F8F8; // Blaga skoro-bijela pozadina
    --white-color: #FFFFFF;    // Čista bijela
    --border-color: #E0E0E0;   // Svijetlo siva za obrube
    --shadow-color: rgba(0, 0, 0, 0.05); // Blaga sjena
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; // Možeš promijeniti font
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
`;

export default GlobalStyles;