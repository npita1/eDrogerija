export const formatPrice = (price) => {
    if (price === null || price === undefined) {
        return '0.00';
    }
    // Provjeri je li cijena broj i formatiraj je na dvije decimale
    const formattedPrice = parseFloat(price).toFixed(2);
    // Zamijeni točku zarezom za lokalni format
    return formattedPrice.replace('.', ',');
};