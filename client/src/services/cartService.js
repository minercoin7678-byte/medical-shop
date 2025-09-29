// src/services/cartService.js
import api from './api';

// اضافه کردن به سبد خرید
export const addToCart = async (productId, quantity = 1) => {
  return api('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  });
};

// دریافت سبد خرید
export const getCart = async () => {
  return api('/cart');
};

// حذف آیتم از سبد خرید
export const removeFromCart = async (cartItemId) => {
  return api(`/cart/${cartItemId}`, {
    method: 'DELETE',
  });
};