// Guest Cart Utility - localStorage-based cart for non-authenticated users

const GUEST_CART_KEY = 'biznest_guest_cart';

export const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : { items: [] };
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return { items: [] };
  }
};

export const addToGuestCart = (product, quantity = 1) => {
  try {
    const cart = getGuestCart();
    const existingItemIndex = cart.items.findIndex(
      item => item.product._id === product._id
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        _id: `guest_${Date.now()}_${Math.random()}`,
        product: product,
        quantity: quantity,
        price: product.price
      });
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error('Error adding to guest cart:', error);
    throw error;
  }
};

export const updateGuestCartItem = (itemId, quantity) => {
  try {
    const cart = getGuestCart();
    const itemIndex = cart.items.findIndex(item => item._id === itemId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    }

    return cart;
  } catch (error) {
    console.error('Error updating guest cart:', error);
    throw error;
  }
};

export const removeFromGuestCart = (itemId) => {
  try {
    const cart = getGuestCart();
    cart.items = cart.items.filter(item => item._id !== itemId);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    return cart;
  } catch (error) {
    console.error('Error removing from guest cart:', error);
    throw error;
  }
};

export const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
    return { items: [] };
  } catch (error) {
    console.error('Error clearing guest cart:', error);
    throw error;
  }
};

export const getGuestCartCount = () => {
  const cart = getGuestCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};
