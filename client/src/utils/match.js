export const sumProductTotal = (updateProducts) => {
  const total =
    updateProducts.reduce((prev, product) => {
      const strValue = (product.quantity * product.amount)
        .toFixed(4)
        .toString()
        .slice(0, -2);

      return parseFloat(strValue) + prev;
    }, 0) || 0;
  return total;
};

export const sumTotalAmount = (updateProducts) => {
  if (!Array.isArray(updateProducts)) {
    console.error("updateProducts is not an array");
    return 0; // or handle it in a way that makes sense for your application
  }

  const total =
    updateProducts.reduce((prev, product) => {
      const strValue = (product.quantity * product.amount)
        .toFixed(4)
        .toString()
        .slice(0, -2);

      return parseFloat(strValue) + prev;
    }, 0) || 0;
  
  return total;
};
