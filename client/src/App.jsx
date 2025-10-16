import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import api from './services/api';
import './App.css';

function Home() {
  const [products, setProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const navigate = useNavigate();

  useEffect(() => {
    api('/products')
      .then(data => setProducts(data))
      .catch(err => console.error('Error loading products:', err));
  }, []);

  const addToCart = async (productId) => {
    try {
      await api('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      alert('محصول به سبد خرید اضافه شد!');
    } catch (err) {
      alert('خطا: ' + err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">فروشگاه تجهیزات پزشکی</h1>
      {user && (
  <button
    onClick={() => {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }}
    className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
  >
    بازگشت به داشبورد
  </button>
)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-4 rounded">
            <h2 className="font-bold">{p.name}</h2>
            <p>{p.description}</p>
            <p className="text-green-600 font-bold">قیمت: {p.price} تومان</p>
            <button
              onClick={() => addToCart(p.id)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              افزودن به سبد
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت لاگین واحد (برای همه کاربران)
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ورود</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل"
          className="w-full p-2 border mb-2 rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
          className="w-full p-2 border mb-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          ورود
        </button>
      </form>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    api('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
      .then(data => {
        if (data.user.role !== 'admin') {
          throw new Error('دسترسی ادمین مورد نیاز است.');
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ورود ادمین</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل ادمین"
          className="w-full p-2 border mb-2 rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
          className="w-full p-2 border mb-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded">ورود</button>
      </form>
    </div>
  );
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api('/orders')
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading orders:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">داشبورد کاربر</h2>
      <p><strong>نام:</strong> {user.name}</p>
      <p><strong>ایمیل:</strong> {user.email}</p>
      <p><strong>نقش:</strong> {user.role}</p>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">لینک‌های سریع</h3>
        <button
          onClick={() => navigate('/cart')}
          className="bg-green-600 text-white px-4 py-2 rounded mr-2"
        >
          سبد خرید
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">سابقه سفارشات</h3>
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : orders.length === 0 ? (
          <p>شما هنوز سفارشی ثبت نکرده‌اید.</p>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <div key={order.id} className="border p-3 rounded">
                <p>شماره سفارش: #{order.id}</p>
                <p>تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                <p>مبلغ کل: {order.total_amount.toLocaleString()} تومان</p>
                <p>وضعیت: <span className="font-bold">{order.status === 'pending' ? 'در انتظار' : order.status}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
      >
        خروج
      </button>
    </div>
  );
}
// کامپوننت افزودن محصول
function AddProduct() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('999');
  const [category, setCategory] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // اعتبارسنجی
    if (!name || !price || !category) {
      setError('نام، قیمت و دسته‌بندی اجباری هستند.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description, price: parseFloat(price), stock: parseInt(stock), category, image_url })
    })
      .then(res => {
        if (!res.ok) throw new Error('خطا در افزودن محصول');
        return res.json();
      })
      .then(() => {
        setSuccess('محصول با موفقیت اضافه شد!');
        // ریست فرم
        setName('');
        setDescription('');
        setPrice('');
        setStock('999');
        setCategory('');
        setImageUrl('');
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">افزودن محصول جدید</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام محصول *"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات"
          className="w-full p-2 border rounded"
          rows="3"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="قیمت (تومان) *"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="موجودی *"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="دسته‌بندی *"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="url"
          value={image_url}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="لینک تصویر (اختیاری)"
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
    افزودن محصول
  </button>
  <button
    type="button"
    onClick={() => navigate('/admin/dashboard')}
    className="bg-gray-500 text-white px-4 py-2 rounded"
  >
    بازگشت به داشبورد ادمین
  </button>
</div>
      </form>
    </div>
  );
}
// کامپوننت افزودن دسته‌بندی جدید
// کامپوننت افزودن دسته‌بندی جدید
function AddCategory() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ حالا استفاده می‌شه
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ تابع flattenCategories رو داخل useEffect تعریف می‌کنیم
    const flattenCategories = (cats, level = 0) => {
      let result = [];
      cats.forEach(cat => {
        result.push({
          id: cat.id,
          name: `${'—'.repeat(level)} ${cat.name}`
        });
        if (cat.children && cat.children.length > 0) {
          result = result.concat(flattenCategories(cat.children, level + 1));
        }
      });
      return result;
    };

    const token = localStorage.getItem('token');
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCategories(flattenCategories(data));
        setLoading(false); // ✅ حالا مقدارش خونده می‌شه
      })
      .catch(() => {
        setError('خطا در بارگذاری لیست دسته‌بندی‌ها');
        setLoading(false);
      });
  }, []); // ✅ بدون نیاز به flattenCategories در وابستگی‌ها

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !slug) {
      setError('نام و نامک (slug) اجباری هستند.');
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      name,
      slug,
      description
    };
    if (parentId) payload.parent_id = parseInt(parentId);

    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('خطا در افزودن دسته‌بندی');
        return res.json();
      })
      .then(() => {
        setSuccess('دسته‌بندی با موفقیت اضافه شد!');
        setTimeout(() => navigate('/admin/categories'), 1500);
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">افزودن دسته‌بندی جدید</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>}
      
      {/* ✅ نمایش وضعیت بارگذاری */}
      {loading ? (
        <p className="text-center">در حال بارگذاری دسته‌بندی‌ها...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام دسته‌بندی *"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
            placeholder="نامک (slug) * — مثال: lab-devices"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات (اختیاری)"
            className="w-full p-2 border rounded"
            rows="3"
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">دسته اصلی (بدون والد)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              افزودن دسته‌بندی
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              لغو
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
// کامپوننت ویرایش محصول
// کامپوننت ویرایش محصول (با انتخاب دسته‌بندی از لیست)
// کامپوننت ویرایش محصول (با category_id)
function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // تبدیل درخت به لیست مسطح
  const flattenCategories = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({
        id: cat.id,
        name: `${'—'.repeat(level)} ${cat.name}`
      });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  // بارگذاری داده‌ها
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // دریافت دسته‌بندی‌ها
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCategories(flattenCategories(data));
      })
      .catch(err => console.error('Error loading categories:', err));

    // دریافت محصول
    fetch(`https://medical-shop-backend-v1u1.onrender.com/api/admin/products/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('محصول یافت نشد.');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // اعتبارسنجی
    if (!product.name || !product.price || !product.stock || !product.category_id) {
      setError('لطفاً همه فیلدهای اجباری را پر کنید.');
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      name: product.name.trim(),
      description: product.description?.trim() || '',
      price: parseFloat(product.price),
      stock: parseInt(product.stock),
      category_id: parseInt(product.category_id), // ✅ تغییر اصلی: category_id
      image_url: product.image_url?.trim() || ''
    };

    if (isNaN(payload.price) || isNaN(payload.stock) || isNaN(payload.category_id)) {
      setError('مقادیر وارد شده معتبر نیستند.');
      return;
    }

    fetch(`https://medical-shop-backend-v1u1.onrender.com/api/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'خطا در به‌روزرسانی محصول'); });
        }
        return res.json();
      })
      .then(() => {
        setSuccess('محصول با موفقیت به‌روزرسانی شد!');
        setTimeout(() => navigate('/admin/products'), 1500);
      })
      .catch(err => setError(err.message));
  };

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;
  if (!product) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">ویرایش محصول</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={product.name || ''}
          onChange={(e) => setProduct({...product, name: e.target.value})}
          placeholder="نام محصول *"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          value={product.description || ''}
          onChange={(e) => setProduct({...product, description: e.target.value})}
          placeholder="توضیحات"
          className="w-full p-2 border rounded"
          rows="3"
        />
        <input
          type="number"
          value={product.price || ''}
          onChange={(e) => setProduct({...product, price: e.target.value})}
          placeholder="قیمت (تومان) *"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          value={product.stock || ''}
          onChange={(e) => setProduct({...product, stock: e.target.value})}
          placeholder="موجودی *"
          className="w-full p-2 border rounded"
          required
        />
        {/* ✅ انتخاب دسته‌بندی با category_id */}
        <select
          value={product.category_id || ''}
          onChange={(e) => setProduct({...product, category_id: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">انتخاب دسته‌بندی *</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={product.image_url || ''}
          onChange={(e) => setProduct({...product, image_url: e.target.value})}
          placeholder="لینک تصویر (اختیاری)"
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            ذخیره تغییرات
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            لغو
          </button>
        </div>
      </form>
    </div>
  );
}
// کامپوننت مدیریت محصولات
function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">مدیریت محصولات</h2>
      
      <div className="mb-4">
        <Link to="/admin/add-product" className="bg-green-600 text-white px-4 py-2 rounded mr-2">
          افزودن محصول جدید
        </Link>
        <button 
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/admin/dashboard')}
        >
          بازگشت
        </button>
      </div>

      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : products.length === 0 ? (
        <p>محصولی وجود ندارد.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border p-2">نام</th>
                <th className="border p-2">قیمت</th>
                <th className="border p-2">موجودی</th>
                <th className="border p-2">دسته‌بندی</th>
                <th className="border p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.price.toLocaleString()} تومان</td>
                  <td className="border p-2">{product.stock || 'نامشخص'}</td>
                  <td className="border p-2">{product.category || '-'}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      ویرایش
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// کامپوننت مدیریت دسته‌بندی
function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // دریافت لیست دسته‌ها
  const fetchCategories = () => {
    const token = localStorage.getItem('token');
    fetch('https://medical-shop-backend-v1u1.onrender.com/api/admin/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
  setError('خطا در دریافت دسته‌بندی‌ها');
  setLoading(false);
});
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  
// نمایش درختی با رنگ‌بندی سلسله‌مراتبی
// نمایش درختی با رنگ‌بندی سلسله‌مراتبی واضح
const renderCategoryTree = (cats, level = 0) => {
  return cats.map(cat => {
    // رنگ‌بندی
    const getStyle = (level) => {
      if (level === 0) return { backgroundColor: '#fee2e2', border: '1px solid #fecaca' };
      if (level === 1) return { backgroundColor: '#dbeafe', border: '1px solid #bfdbfe' };
      return { backgroundColor: '#fef9c3', border: '1px solid #fde047' };
    };

    return (
      <div key={cat.id} className="mb-2">
        <div 
          className="flex items-center justify-between rounded p-2"
          style={getStyle(level)}
        >
          <span className="font-medium">{cat.name}</span>
          <span className="text-sm text-gray-600">({cat.slug})</span>
          <div className="flex gap-1">
            <button className="bg-blue-500 text-white text-xs px-2 py-1 rounded">ویرایش</button>
            <button className="bg-red-500 text-white text-xs px-2 py-1 rounded">حذف</button>
          </div>
        </div>
        {/* نمایش زیرمجموعه‌ها با فاصله سلسله‌مراتبی */}
        {cat.children && cat.children.length > 0 && (
          <div style={{ paddingLeft: `${(level + 1) * 20}px`, marginTop: '8px' }}>
            {renderCategoryTree(cat.children, level + 1)}
          </div>
        )}
      </div>
    );
  });
};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">مدیریت دسته‌بندی‌ها</h2>
      
      <div className="mb-4">
  <Link to="/admin/categories/add" className="bg-green-600 text-white px-4 py-2 rounded">
    افزودن دسته جدید
  </Link>
  <button 
    className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
    onClick={() => navigate('/admin/dashboard')}
  >
    بازگشت
  </button>
</div>

      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div>
          {categories.length === 0 ? (
            <p>هیچ دسته‌بندی‌ای وجود ندارد.</p>
          ) : (
            renderCategoryTree(categories)
          )}
        </div>
      )}
    </div>
  );
}
// کامپوننت داشبورد ادمین (کامل‌شده)
// کامپوننت داشبورد ادمین (نسخه ایمن و کامل)
function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchWithAuth = (endpoint) => {
      return fetch(`https://medical-shop-backend-v1u1.onrender.com/api${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/admin/login');
          }
          throw new Error('خطا در دریافت داده');
        }
        return res.json();
      });
    };

    fetchWithAuth('/admin/products')
      .then(data => setProducts(data))
      .catch(err => console.error('Error loading products:', err));

    fetchWithAuth('/admin/orders')
      .then(data => setOrders(data))
      .catch(err => console.error('Error loading orders:', err));

    fetchWithAuth('/admin/users')
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading users:', err);
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">داشبورد ادمین</h2>
      <div className="mb-6">
  <Link to="/admin/products" className="bg-purple-600 text-white px-4 py-2 rounded">
    مدیریت محصولات
  </Link>
</div>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">لیست محصولات</h3>
        {products.length === 0 ? (
          <p>محصولی وجود ندارد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border p-2">نام</th>
                  <th className="border p-2">قیمت</th>
                  <th className="border p-2">موجودی</th>
                  <th className="border p-2">دسته‌بندی</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="border p-2">{product.name}</td>
                    <td className="border p-2">{product.price.toLocaleString()} تومان</td>
                    <td className="border p-2">{product.stock || 'نامشخص'}</td>
                    <td className="border p-2">{product.category || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">لیست سفارشات</h3>
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : orders.length === 0 ? (
          <p>سفارشی وجود ندارد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border p-2">شماره سفارش</th>
                  <th className="border p-2">کاربر</th>
                  <th className="border p-2">مبلغ</th>
                  <th className="border p-2">وضعیت</th>
                  <th className="border p-2">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="border p-2">#{order.id}</td>
                    <td className="border p-2">{order.user_name} ({order.email})</td>
                    <td className="border p-2">{order.total_amount.toLocaleString()} تومان</td>
                    <td className="border p-2">
                      <span className="font-bold">
                        {order.status === 'pending' ? 'در انتظار' : order.status}
                      </span>
                    </td>
                    <td className="border p-2">
                      {new Date(order.created_at).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">لیست کاربران</h3>
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : users.length === 0 ? (
          <p>کاربری وجود ندارد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border p-2">نام</th>
                  <th className="border p-2">ایمیل</th>
                  <th className="border p-2">نقش</th>
                  <th className="border p-2">تاریخ عضویت</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">
                      <span className={user.role === 'admin' ? 'text-red-600 font-bold' : ''}>
                        {user.role}
                      </span>
                    </td>
                    <td className="border p-2">
                      {new Date(user.created_at).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        <div className="mb-4">
  <Link to="/admin/add-product" className="bg-blue-600 text-white px-4 py-2 rounded">
    افزودن محصول جدید
  </Link>
  <Link to="/admin/categories" className="bg-purple-600 text-white px-4 py-2 rounded mr-2">
  مدیریت دسته‌بندی‌ها
</Link>
</div>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-600 text-white p-2 rounded"
      >
        خروج
      </button>
    </div>
  );
}
// کامپوننت ثبت‌نام
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    api('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, address }),
    })
      .then(data => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      })
      .catch(err => setError(err.message || 'خطا در ثبت‌نام'));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">ثبت‌نام</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام کامل"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="شماره تلفن"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="آدرس"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          ثبت‌نام
        </button>
      </form>
    </div>
  );
}
function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api('/cart')
      .then(data => {
        setCartItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const removeFromCart = (id) => {
    api(`/cart/${id}`, { method: 'DELETE' })
      .then(() => {
        setCartItems(cartItems.filter(item => item.id !== id));
      })
      .catch(err => alert('خطا در حذف از سبد: ' + err.message));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;
  if (error) return <div className="p-6 text-red-600">خطا: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">سبد خرید شما</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">سبد خرید شما خالی است.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between border p-4 rounded">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p>تعداد: {item.quantity}</p>
                  <p className="text-green-600">قیمت واحد: {item.price} تومان</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-xl font-bold">جمع کل: {total.toLocaleString()} تومان</h3>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
              ادامه فرآیند خرید
            </button>
          </div>
        </>
      )}
      <button
        onClick={() => navigate(-1)}
        className="mt-4 text-blue-600"
      >
        بازگشت
      </button>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const validateAndSetUser = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      // اگر هر دو وجود ندارن، کاربر مهمان هست
      if (!storedUser || !storedToken) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        
        // اعتبارسنجی اولیه: چک کن فیلدهای ضروری وجود دارن
        if (parsedUser.email && (parsedUser.role === 'user' || parsedUser.role === 'admin')) {
          setUser(parsedUser);
        } else {
          // اگر داده نامعتبر بود، پاکش کن
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (e) {
        // اگر JSON نامعتبر بود، پاکش کن
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
      
      setLoadingUser(false);
    };

    validateAndSetUser();

    // نظارت بر تغییرات در تب‌های دیگه
    const handleStorageChange = () => {
      validateAndSetUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loadingUser) {
    return <div className="p-6">در حال بارگذاری...</div>;
  }

  return (
    <div className="p-6">
      <nav className="mb-6">
        <Link to="/" className="mr-2">خانه</Link>
        {' - '}
        <Link to="/cart" className="mr-2">سبد خرید</Link>
        {!user ? (
          <>
            {' - '}
            <Link to="/login" className="mr-2">ورود</Link>
            {' - '}
            <Link to="/register" className="mr-2">ثبت‌نام</Link>
          </>
        ) : (
          <>
            {' - '}
            <Link to="/dashboard">داشبورد</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/categories" element={<CategoryManager />} />
        <Route path="/admin/categories/add" element={<AddCategory />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/products" element={<ProductManager />} />
        <Route path="/admin/products/edit/:id" element={<EditProduct />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;