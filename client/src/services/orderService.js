// src/services/orderService.js
import api from './api';

// ثبت سفارش جدید
export const placeOrder = async () => {
  return api('/orders', {
    method: 'POST',
  });
};