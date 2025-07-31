import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #A7BCCB;
    --secondary-color: #E2B2B6;
    --accent-color: #B5EAD7;
    --text-color: #333333;
    --light-text-color: #666666;
    --background-color: #F8F8F8;
    --white-color: #FFFFFF;
    --border-color: #E0E0E0;
    --shadow-color: rgba(0, 0, 0, 0.05);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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