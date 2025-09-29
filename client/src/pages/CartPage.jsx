import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeFromCart } from '../services/cartService';
import { placeOrder } from '../services/orderService';

export default function CartPage() {
  const [cart, setCart] = useState({ cart: [], totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCart(data);
      } catch (err) {
        console.error('خطا در دریافت سبد خرید:', err);
        alert('لطفاً وارد حساب کاربری شوید.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleRemove = async (itemId) => {
    if (!window.confirm('آیا مطمئن هستید؟')) return;
    try {
      await removeFromCart(itemId);
      const data = await getCart();
      setCart(data);
    } catch (err) {
      alert('خطا در حذف محصول: ' + err.message);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await placeOrder();
      alert('سفارش شما با موفقیت ثبت شد!');
      navigate('/dashboard');
    } catch (err) {
      alert('خطا در ثبت سفارش: ' + err.message);
    }
  };

  if (loading) return <div className="p-6">در حال بارگذاری سبد خرید...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">سبد خرید شما</h1>

      {cart.totalItems === 0 ? (
        <p>سبد خرید شما خالی است.</p>
      ) : (
        <div className="space-y-4">
          {cart.cart.map(item => (
            <div key={item.id} className="flex justify-between items-center border p-4 rounded">
              <div>
                <h3 className="font-bold">{item.name}</h3>
                <p>تعداد: {item.quantity}</p>
                <p>قیمت واحد: {item.price} تومان</p>
              </div>
              <div className="text-right">
                <p className="font-bold">جمع: {item.price * item.quantity} تومان</p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.totalItems > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handlePlaceOrder}
            className="bg-purple-600 text-white px-6 py-3 rounded text-lg hover:bg-purple-700"
          >
            ثبت سفارش نهایی
          </button>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          بازگشت
        </button>
      </div>
    </div>
  );
}