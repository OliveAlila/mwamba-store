import { useEffect, useMemo, useState } from 'react';
import {
  Search, ShoppingCart, Heart, UserRound, Menu, ChevronRight, ChevronDown,
  Zap, Truck, ShieldCheck, Headphones, Star, Plus, Minus, X, Package,
  LayoutDashboard, Boxes, ClipboardList, Users, BarChart3, Settings,
  Tag, ArrowRight, SlidersHorizontal, Smartphone, Shirt, House, Sparkles,
  Dumbbell, BookOpen, Baby, Car, Laptop, Watch, CircleUserRound, LogOut
} from 'lucide-react';

const categories = [
  { name: 'Phones & Tablets', icon: Smartphone, color: 'lavender', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=360&q=80' },
  { name: 'Fashion', icon: Shirt, color: 'peach', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=360&q=80' },
  { name: 'Home & Living', icon: House, color: 'mint', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=360&q=80' },
  { name: 'Electronics', icon: Laptop, color: 'blue', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=360&q=80' },
  { name: 'Beauty', icon: Sparkles, color: 'pink', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=360&q=80' },
  { name: 'Sports & Outdoors', icon: Dumbbell, color: 'yellow', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=360&q=80' },
  { name: 'Books & Stationery', icon: BookOpen, color: 'blue', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=360&q=80' },
  { name: 'Baby & Kids', icon: Baby, color: 'peach', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=360&q=80' },
  { name: 'Automotive', icon: Car, color: 'mint', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=360&q=80' },
  { name: 'Watches & Accessories', icon: Watch, color: 'lavender', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=360&q=80' },
];

const initialProducts = [
  { id: 1, name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 2499, oldPrice: 3999, rating: 4.7, reviews: 128, badge: '−38%', art: '🎧', tint: 'lavender', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=82' },
  { id: 2, name: 'Everyday Classic Sneakers', category: 'Fashion', price: 2890, oldPrice: 4200, rating: 4.5, reviews: 86, badge: '−31%', art: '👟', tint: 'peach', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=82' },
  { id: 3, name: 'Smart Watch Series 8', category: 'Phones & Tablets', price: 3599, oldPrice: 5500, rating: 4.8, reviews: 204, badge: 'HOT DEAL', art: '⌚', tint: 'mint', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=82' },
  { id: 4, name: 'Minimal Ceramic Table Lamp', category: 'Home & Living', price: 1850, oldPrice: 2500, rating: 4.4, reviews: 53, badge: '−26%', art: '💡', tint: 'yellow', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=82' },
  { id: 5, name: 'Daily Glow Skincare Set', category: 'Beauty', price: 1699, oldPrice: 2200, rating: 4.6, reviews: 97, badge: '−23%', art: '🧴', tint: 'pink', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=82' },
  { id: 6, name: 'Compact Portable Speaker', category: 'Electronics', price: 1999, oldPrice: 2800, rating: 4.5, reviews: 71, badge: '−29%', art: '🔊', tint: 'blue', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=82' },
  { id: 7, name: 'Structured Everyday Backpack', category: 'Fashion', price: 2199, oldPrice: 3200, rating: 4.7, reviews: 62, badge: '−31%', art: '🎒', tint: 'peach', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=82' },
  { id: 8, name: 'Non-stick Cookware Set', category: 'Home & Living', price: 3299, oldPrice: 4500, rating: 4.3, reviews: 44, badge: '−27%', art: '🍳', tint: 'mint', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=82' },
];

const money = value => 'KSh ' + Number(value || 0).toLocaleString('en-KE');
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
  return data;
}

function normalizeProduct(product) {
  const price = Number(product.price || 0);
  const oldPrice = Number(product.compare_at_price || price);
  return {
    ...product,
    id: Number(product.id),
    price,
    oldPrice,
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    category: product.category || 'Uncategorised',
    image: product.image_url || '',
    badge: oldPrice > price ? '−' + Math.round((1 - price / oldPrice) * 100) + '%' : '',
    art: '🛍️',
    tint: 'lavender',
  };
}

function formatApiError(error) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function Brand() {
  return <div className="brand-lockup"><span className="brand-mark">m<span>.</span></span><span className="brand-name">mwamba<span>store</span></span></div>;
}

function ProductCard({ product, wished, onWish, onAdd }) {
  const discount = product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return <article className="product-card">
    <div className="product-art-wrap">
      <span className="sale-badge">{product.badge || (discount ? `−${discount}%` : 'NEW')}</span>
      <button className={`wish-btn ${wished ? 'is-wished' : ''}`} aria-label="Add to wishlist" onClick={() => onWish(product.id)}><Heart size={18} fill={wished ? 'currentColor' : 'none'} /></button>
      <div className={`product-art ${product.tint}`}><img src={product.image} alt={product.name} loading="lazy" onError={e => { e.currentTarget.hidden = true; e.currentTarget.nextElementSibling.hidden = false; }} /><span className="product-art-fallback" hidden>{product.art}</span></div>
    </div>
    <div className="product-info">
      <p className="product-category">{product.category}</p>
      <h3>{product.name}</h3>
      <div className="rating"><Star size={13} fill="currentColor" /><b>{product.rating}</b><span>({product.reviews})</span></div>
      <div className="price-line"><strong>{money(product.price)}</strong>{product.oldPrice > product.price && <del>{money(product.oldPrice)}</del>}</div>
      <button className="add-cart" onClick={() => onAdd(product)}><Plus size={16} /> Add to cart</button>
    </div>
  </article>;
}

function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All products');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [drawer, setDrawer] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sort, setSort] = useState('featured');
  const [adminTab, setAdminTab] = useState('Overview');
  const [showAll, setShowAll] = useState(false);
  const [notice, setNotice] = useState('');
  const [products, setProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authBusy, setAuthBusy] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [adminSummary, setAdminSummary] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [productForm, setProductForm] = useState({ name: '', description: '', category_id: '', price: '', compare_at_price: '', stock_quantity: '0', sku: '', image_url: '' });
  const [adminBusy, setAdminBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [returnMessage, setReturnMessage] = useState('');

  const loadStorefront = async () => {
    setLoadingProducts(true);
    setProductError('');
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        api('/api/products'),
        api('/api/categories'),
      ]);
      setProducts((productResponse.products || []).map(normalizeProduct));
      setCategoryData(categoryResponse.categories || []);
    } catch (error) {
      setProductError(formatApiError(error));
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const result = await api('/api/auth/me');
      setUser(result.user || null);
    } catch {
      setUser(null);
    }
  };

  const loadAdminData = async (tab = adminTab) => {
    if (!user || user.role !== 'admin') return;
    setAdminBusy(true);
    try {
      if (tab === 'Overview') {
        const summary = await api('/api/admin/summary');
        setAdminSummary(summary);
      } else if (tab === 'Products') {
        const result = await api('/api/products/admin/all');
        setAdminProducts(result.products || []);
        const cats = await api('/api/categories/admin/all');
        setAdminCategories(cats.categories || []);
      } else if (tab === 'Categories') {
        const cats = await api('/api/categories/admin/all');
        setAdminCategories(cats.categories || []);
      }
    } catch (error) {
      setNotice(formatApiError(error));
    } finally {
      setAdminBusy(false);
    }
  };

  useEffect(() => {
    loadStorefront();
    loadCurrentUser();
    const reference = new URLSearchParams(window.location.search).get('reference');
    if (reference) {
      setReturnMessage('Payment return received. Sign in with the account used for checkout to verify your order.');
      setDrawer('account');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (drawer === 'admin') {
      if (!user) {
        setDrawer('account');
        setNotice('Please sign in with an administrator account to access the admin workspace.');
        return;
      }
      if (user.role !== 'admin') {
        setDrawer('');
        setNotice('Your account does not have administrator access.');
        return;
      }
      loadAdminData(adminTab);
    }
  }, [drawer, adminTab, user]);

  const visibleProducts = useMemo(() => {
    let result = products.filter(p => (activeCategory === 'All products' || p.category === activeCategory) && (p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())));
    if (sort === 'price-low') result = [...result].sort((a,b) => a.price-b.price);
    if (sort === 'price-high') result = [...result].sort((a,b) => b.price-a.price);
    if (sort === 'rating') result = [...result].sort((a,b) => b.rating-a.rating);
    return showAll ? result : result.slice(0, 8);
  }, [products, activeCategory, query, sort, showAll]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const addToCart = product => {
    if (!product?.id) return;
    setCart(old => old.some(item => item.id === product.id) ? old.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item) : [...old, {...product, qty: 1}]);
    setNotice('Added to your cart'); setTimeout(() => setNotice(''), 2200);
  };
  const changeQty = (id, delta) => setCart(old => old.map(item => item.id === id ? {...item, qty: item.qty + delta} : item).filter(item => item.qty > 0));
  const toggleWish = id => setWishlist(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const goCategory = name => { setActiveCategory(name); setShowAll(true); document.getElementById('products')?.scrollIntoView({behavior:'smooth'}); };
  const startCheckout = () => {
    setPaymentError('');
    if (!cart.length) return setNotice('Your cart is empty.');
    if (!user) {
      setReturnMessage('Sign in or create an account before checkout.');
      setDrawer('account');
      return;
    }
    setDrawer('checkout');
  };

  const submitAuth = async event => {
    event.preventDefault();
    setAuthBusy(true);
    setNotice('');
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || ''),
    };
    if (authMode === 'register') payload.name = String(form.get('name') || '').trim();
    try {
      const result = await api(authMode === 'register' ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setUser(result.user);
      setNotice(authMode === 'register' ? 'Your account has been created.' : 'Signed in successfully.');
      if (returnMessage && new URLSearchParams(window.location.search).get('reference')) {
        await verifyPaymentReturn(new URLSearchParams(window.location.search).get('reference'));
      }
      setReturnMessage('');
    } catch (error) {
      setNotice(formatApiError(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    try { await api('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) }); }
    catch (error) { setNotice(formatApiError(error)); }
    setUser(null);
    setDrawer('');
  };

  const verifyPaymentReturn = async reference => {
    try {
      const result = await api('/api/payments/verify/' + encodeURIComponent(reference));
      setCart([]);
      setNotice(result.payment_status === 'paid' ? 'Payment confirmed. Your order is being processed.' : 'Payment returned, but confirmation is pending.');
      setReturnMessage('');
    } catch (error) {
      setReturnMessage(formatApiError(error));
    }
  };

  const submitCheckout = async event => {
    event.preventDefault();
    if (!user) {
      setPaymentError('Please sign in before paying.');
      setDrawer('account');
      return;
    }
    if (!cart.length) {
      setPaymentError('Your cart is empty.');
      return;
    }
    const form = new FormData(event.currentTarget);
    const phone = String(form.get('phone') || '').trim();
    const delivery_address = String(form.get('delivery_address') || '').trim();
    const paymentMethod = String(form.get('payment_method') || 'paystack');
    if (paymentMethod !== 'paystack') {
      setPaymentError('Pay on delivery is not enabled yet. Please choose Paystack.');
      return;
    }
    setCheckoutBusy(true);
    setPaymentError('');
    try {
      const result = await api('/api/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: Number(item.id), quantity: Number(item.qty) })),
          phone,
          delivery_address,
        }),
      });
      if (!result.authorization_url) throw new Error('The payment provider did not return a checkout URL.');
      window.location.assign(result.authorization_url);
    } catch (error) {
      setPaymentError(formatApiError(error));
      setCheckoutBusy(false);
    }
  };

  const createCategory = async event => {
    event.preventDefault();
    setAdminBusy(true);
    try {
      await api('/api/categories', { method: 'POST', body: JSON.stringify({ name: categoryName, description: categoryDescription || null }) });
      setCategoryName('');
      setCategoryDescription('');
      await loadAdminData('Categories');
      await loadStorefront();
      setNotice('Category created.');
    } catch (error) {
      setNotice(formatApiError(error));
    } finally { setAdminBusy(false); }
  };

  const createProduct = async event => {
    event.preventDefault();
    setAdminBusy(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        compare_at_price: productForm.compare_at_price === '' ? null : Number(productForm.compare_at_price),
        stock_quantity: Number(productForm.stock_quantity),
        category_id: productForm.category_id === '' ? null : Number(productForm.category_id),
      };
      await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      setProductForm({ name: '', description: '', category_id: '', price: '', compare_at_price: '', stock_quantity: '0', sku: '', image_url: '' });
      await loadAdminData('Products');
      await loadStorefront();
      setNotice('Product added to the catalogue.');
    } catch (error) {
      setNotice(formatApiError(error));
    } finally { setAdminBusy(false); }
  };

  if (drawer === 'admin' && user?.role === 'admin') return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Brand /><div className="admin-label">STORE MANAGEMENT</div>
      {[['Overview',BarChart3],['Products',Boxes],['Categories',Tag],['Orders',ClipboardList],['Customers',Users],['Promotions',Tag],['Settings',Settings]].map(([name,Icon]) => <button key={name} className={adminTab===name?'admin-nav active':'admin-nav'} onClick={()=>setAdminTab(name)}><Icon size={18}/>{name}</button>)}
      <div className="admin-side-bottom"><button className="admin-nav" onClick={()=>setDrawer('')}><ArrowRight size={18}/> Back to store</button><button className="admin-nav" onClick={signOut}><LogOut size={18}/> Sign out</button><p>MWAMBA STORE<br/><span>Admin workspace</span></p></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><span className="eyebrow">WORKSPACE / {adminTab.toUpperCase()}</span><h1>{adminTab}</h1></div><div className="admin-profile"><span className="avatar">{(user.name || 'A').slice(0,1).toUpperCase()}</span><div><b>{user.name}</b><small>Administrator</small></div><ChevronDown size={16}/></div></header>
      {adminBusy && <p className="inline-notice">Loading live store data…</p>}
      {adminTab==='Overview' ? <>
        <div className="admin-welcome"><div><p>YOUR STORE AT A GLANCE</p><h2>Good day, {user.name} 👋</h2><span>Here’s what’s happening with Mwamba Store.</span></div><button className="dark-btn" onClick={()=>setAdminTab('Products')}><Plus size={17}/> Manage products</button></div>
        <div className="stats-grid">{[['Total revenue',money(adminSummary?.revenue || 0),'Paid orders this month','This month'],['Orders',String(adminSummary?.orders ?? 0),'All orders','In the store'],['Products',String(adminSummary?.products ?? 0),String(adminSummary?.low_stock ?? 0)+' low stock','In your catalogue'],['Customers',String(adminSummary?.customers ?? 0),'Active accounts','Registered']].map(([label,value,trend,sub])=><div className="stat-card" key={label}><span>{label}</span><h3>{value}</h3><div><b>{trend}</b><small>{sub}</small></div></div>)}</div>
        <section className="admin-panel"><div className="panel-heading"><div><h3>Inventory watch</h3><p>Products that need attention</p></div><Boxes size={19}/></div>{adminProducts.filter(p=>Number(p.stock_quantity)<=5 && p.status==='active').slice(0,8).map(p=><div className="inventory-row" key={p.id}><span className="mini-product">▦</span><div><b>{p.name}</b><small>Stock level</small></div><span className="stock-low">{p.stock_quantity} left</span></div>)}{!adminProducts.length&&<p>No product inventory loaded yet. Use Products to add catalogue items.</p>}</section>
      </> : adminTab==='Products' ? <div className="admin-panels">
        <section className="admin-panel"><div className="panel-heading"><div><h3>Add a product</h3><p>Products become visible to customers when saved.</p></div></div>
          <form className="admin-form" onSubmit={createProduct}>
            <label>Product name<input required minLength="2" maxLength="180" value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})}/></label>
            <label>Category<select value={productForm.category_id} onChange={e=>setProductForm({...productForm,category_id:e.target.value})}><option value="">No category</option>{adminCategories.filter(c=>c.is_active).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label>Price (KES)<input required type="number" min="1" step="0.01" value={productForm.price} onChange={e=>setProductForm({...productForm,price:e.target.value})}/></label>
            <label>Compare-at price (KES)<input type="number" min="0.01" step="0.01" value={productForm.compare_at_price} onChange={e=>setProductForm({...productForm,compare_at_price:e.target.value})}/></label>
            <label>Stock quantity<input type="number" min="0" step="1" value={productForm.stock_quantity} onChange={e=>setProductForm({...productForm,stock_quantity:e.target.value})}/></label>
            <label>SKU (optional)<input maxLength="100" value={productForm.sku} onChange={e=>setProductForm({...productForm,sku:e.target.value})}/></label>
            <label className="wide-field">Image URL (HTTPS)<input type="url" placeholder="https://…" value={productForm.image_url} onChange={e=>setProductForm({...productForm,image_url:e.target.value})}/></label>
            <label className="wide-field">Description<textarea rows="3" maxLength="10000" value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})}/></label>
            <button className="dark-btn" disabled={adminBusy}><Plus size={16}/> {adminBusy?'Saving…':'Save product'}</button>
          </form>
        </section>
        <section className="admin-panel"><div className="panel-heading"><div><h3>Catalogue</h3><p>{adminProducts.length} products</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>PRODUCT</th><th>PRICE</th><th>STOCK</th><th>STATUS</th></tr></thead><tbody>{adminProducts.map(p=><tr key={p.id}><td>{p.name}</td><td>{money(p.price)}</td><td>{p.stock_quantity}</td><td>{p.status}</td></tr>)}</tbody></table></div></section>
      </div> : adminTab==='Categories' ? <div className="admin-panels">
        <section className="admin-panel"><div className="panel-heading"><div><h3>Add a category</h3><p>New active categories appear in the storefront catalogue.</p></div></div><form className="admin-form" onSubmit={createCategory}>
          <label>Category name<input required minLength="2" maxLength="100" value={categoryName} onChange={e=>setCategoryName(e.target.value)}/></label>
          <label>Description<input maxLength="500" value={categoryDescription} onChange={e=>setCategoryDescription(e.target.value)}/></label>
          <button className="dark-btn" disabled={adminBusy}><Plus size={16}/> Create category</button>
        </form></section>
        <section className="admin-panel"><div className="panel-heading"><div><h3>Categories</h3><p>{adminCategories.length} configured</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>NAME</th><th>SLUG</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{adminCategories.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.slug}</td><td>{c.is_active?'Active':'Inactive'}</td><td>{c.is_active&&<button className="text-link" onClick={async()=>{try{await api('/api/categories/'+c.id,{method:'DELETE'});await loadAdminData('Categories');await loadStorefront();setNotice('Category deactivated.');}catch(error){setNotice(formatApiError(error));}}}>Deactivate</button>}</td></tr>)}</tbody></table></div></section>
      </div> : <section className="admin-panel admin-placeholder"><div className="placeholder-icon"><Boxes size={30}/></div><h2>{adminTab} management</h2><p>The live {adminTab.toLowerCase()} management module is not implemented yet. It is intentionally not displaying sample records.</p></section>}
    </main>
  </div>;

  return <div className="app-shell">
    <div className="announcement"><span>Good finds. Better prices. Every day.</span><span className="announcement-right"><Truck size={14}/> Delivery across Kenya <i/> Need help? <button className="contact-link" onClick={()=>setNotice("Customer support contact details will be added before launch.")}>Contact us</button></span></div>
    <header className="main-header">
      <button className="mobile-menu icon-btn" aria-label="Open menu" onClick={()=>setMobileMenu(!mobileMenu)}><Menu size={22}/></button>
      <button className="brand-button" onClick={()=>{setActiveCategory('All products');setQuery('');window.scrollTo({top:0,behavior:'smooth'});}}><Brand /></button>
      <div className="search-box"><Search size={19}/><input value={query} onChange={e=>{setQuery(e.target.value);setShowAll(true);}} placeholder="Search products, brands and more..." /><kbd>↵</kbd><button onClick={()=>document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}>Search</button></div>
      <div className="header-actions">
        <button className="header-action" onClick={()=>setDrawer('account')}><UserRound size={21}/><span><small>Hello, welcome</small><b>My account</b></span></button>
        <button className="header-action wishlist-action" onClick={()=>setDrawer('wishlist')}><span className="action-icon"><Heart size={21}/>{wishlist.length>0&&<i>{wishlist.length}</i>}</span><span><small>Your saved</small><b>Wishlist</b></span></button>
        <button className="header-action cart-action" onClick={()=>setDrawer('cart')}><span className="action-icon"><ShoppingCart size={22}/><i>{cartCount}</i></span><span><small>Your bag</small><b>Cart</b></span></button>
      </div>
    </header>
    <nav className={mobileMenu?'category-nav mobile-open':'category-nav'}><button className="all-categories" onClick={()=>setMobileMenu(!mobileMenu)}><Menu size={17}/> All categories <ChevronDown size={14}/></button>{['Phones & Tablets','Fashion','Home & Living','Electronics','Beauty','Sports & Outdoors'].map(c=><button key={c} className={activeCategory===c?'nav-category selected':''} onClick={()=>{goCategory(c);setMobileMenu(false)}}>{c}</button>)}<button className="nav-deals" onClick={()=>{setActiveCategory('All products');setShowAll(true);document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}}><Zap size={15} fill="currentColor"/> Deals</button></nav>

    <main>
      <section className="hero-layout">
        <aside className="category-rail"><div className="rail-title">SHOP BY CATEGORY</div>{categories.slice(0,8).map(({name,icon:Icon})=><button key={name} onClick={()=>goCategory(name)}><Icon size={17}/><span>{name}</span><ChevronRight size={14}/></button>)}<button className="view-cats" onClick={()=>goCategory('All products')}>View all categories <ArrowRight size={15}/></button></aside>
        <div className="hero-main">
          <div className="hero-banner"><div className="hero-copy"><span className="hero-kicker"><Sparkles size={14}/> THE MWAMBA EVERYDAY EDIT</span><h1>Good things.<br/><em>Great prices.</em></h1><p>Discover the little upgrades that make<br className="desktop-break"/> everyday life feel extraordinary.</p><button onClick={()=>{setActiveCategory('All products');setShowAll(true);document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}}>Explore the store <ArrowRight size={17}/></button><div className="hero-dots"><span className="active"/><span/><span/></div></div><div className="hero-art"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-product hero-phone">📱</div><div className="hero-product hero-headphones">🎧</div><div className="hero-product hero-bag">👜</div><div className="hero-product hero-sneaker">👟</div><div className="hero-sticker"><span>FRESH</span><b>FINDS</b><small>EVERY DAY</small></div></div><div className="hero-number">01 / 03</div></div>
          <div className="benefit-strip"><div><span className="benefit-icon"><Truck size={20}/></span><div><b>Convenient delivery</b><small>Across Kenya</small></div></div><div><span className="benefit-icon"><ShieldCheck size={20}/></span><div><b>Shop with confidence</b><small>Secure checkout</small></div></div><div><span className="benefit-icon"><Headphones size={20}/></span><div><b>Here to help</b><small>Customer support</small></div></div></div>
        </div>
      </section>

      <section className="category-section"><div className="section-heading"><div><span className="eyebrow">FIND YOUR NEXT FAVOURITE</span><h2>Browse by category</h2></div><button className="text-link" onClick={()=>goCategory('All products')}>All categories <ArrowRight size={16}/></button></div><div className="category-grid">{categories.map(({name,color,image,icon:Icon},i)=><button className="category-tile" key={name} onClick={()=>goCategory(name)}><span className={'category-illustration '+color}><Icon size={27}/><img src={image} alt="" loading="eager" decoding="async" onError={e=>{e.currentTarget.remove();}} /></span><b>{name}</b><small>{[48,126,84,72,56,39,61,32,41,68][i]}+ items</small></button>)}</div></section>

      <section className="deal-banner"><div className="deal-mark"><Zap size={24} fill="currentColor"/></div><div className="deal-copy"><span>THE DAILY DROP</span><h2>Little prices. Big energy.</h2><p>Handpicked deals for your everyday.</p></div><div className="deal-countdown"><span>THIS WEEK'S FINDS</span><div><b>01</b><i>:</i><b>24</b><i>:</i><b>36</b></div><small>Hours&nbsp;&nbsp;&nbsp; Mins&nbsp;&nbsp;&nbsp; Secs</small></div><button onClick={()=>{setActiveCategory('All products');setSort('price-low');setShowAll(true);document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}}>Shop the deals <ArrowRight size={17}/></button><div className="deal-decoration">✳</div></section>

      <section className="products-section" id="products"><div className="section-heading product-heading"><div><span className="eyebrow">GOOD FINDS, PICKED FOR YOU</span><h2>{activeCategory==='All products'?'Popular right now':activeCategory}</h2><p>Everyday essentials and little luxuries worth discovering.</p></div><div className="product-tools"><label><SlidersHorizontal size={16}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label></div></div>
        {productError&&<div className="empty-state"><h3>We couldn't load the catalogue</h3><p>{productError}</p><button className="dark-btn" onClick={loadStorefront}>Try again</button></div>}
        {loadingProducts&&!productError&&<div className="empty-state"><p>Loading products…</p></div>}
        {!loadingProducts&&!productError&&<div className="product-grid">{visibleProducts.map(p=><ProductCard key={p.id} product={p} wished={wishlist.includes(p.id)} onWish={toggleWish} onAdd={addToCart}/>)}</div>}
        {!loadingProducts&&!productError&&visibleProducts.length===0&&<div className="empty-state"><Search size={30}/><h3>No products found</h3><p>Try a different search or choose another category.</p><button className="dark-btn" onClick={()=>{setQuery('');setActiveCategory('All products')}}>Clear filters</button></div>}
        {visibleProducts.length>0&&<button className="load-more" onClick={()=>{setShowAll(!showAll);if(showAll)document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}}>{showAll?'Show fewer products':'Explore all products'} <ArrowRight size={16}/></button>}
      </section>

      <section className="trust-section"><div className="trust-heading"><span className="eyebrow">A LITTLE MORE PEACE OF MIND</span><h2>Shopping should feel good.</h2></div><div className="trust-grid"><div><Truck size={23}/><h3>Delivery made simple</h3><p>Convenient delivery options for your location.</p></div><div><ShieldCheck size={23}/><h3>Checkout you can trust</h3><p>Your shopping experience and payment security matter.</p></div><div><Headphones size={23}/><h3>Real help, when needed</h3><p>Our team is here to help you shop with confidence.</p></div></div></section>
    </main>
    <footer className="footer"><div className="footer-top"><div className="footer-brand"><Brand/><p>Everyday essentials, unexpected finds,<br/>and good prices all in one place.</p><div className="social-dots"><button aria-label="Facebook" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>f</button><button aria-label="Instagram" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>◎</button><button aria-label="X" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>𝕏</button></div></div><div><h4>SHOP</h4><button onClick={()=>goCategory('All products')}>All products</button><button onClick={()=>goCategory('Fashion')}>Fashion</button><button onClick={()=>goCategory('Electronics')}>Electronics</button><button onClick={()=>goCategory('Home & Living')}>Home & Living</button></div><div><h4>YOUR MWAMBA</h4><button onClick={()=>setDrawer('account')}>My account</button><button onClick={()=>setDrawer('cart')}>Shopping cart</button><button onClick={()=>setDrawer('wishlist')}>Wishlist</button><button onClick={()=>setDrawer('account')}>Order history</button></div><div className="newsletter"><h4>A GOOD THING IN YOUR INBOX</h4><p>Get first dibs on new finds and special deals.</p><form onSubmit={e=>{e.preventDefault();setNotice('Thanks for joining the Mwamba list!');setTimeout(()=>setNotice(''),2500)}}><input type="email" placeholder="Your email address" required/><button aria-label="Subscribe"><ArrowRight size={18}/></button></form>{notice&&<small className="newsletter-notice">{notice}</small>}</div></div><div className="footer-bottom"><span>© 2026 Mwamba Store. Made for everyday living.</span><div><button onClick={()=>setNotice("Privacy information will be published before launch.")}>Privacy</button><button onClick={()=>setNotice("Terms and conditions will be published before launch.")}>Terms</button><button onClick={()=>setNotice("Customer support details will be added before launch.")}>Help centre</button></div><span className="footer-pay">Secure payments · Paystack</span></div></footer>
    <nav className="mobile-bottom-nav"><button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><House size={19}/><span>Home</span></button><button onClick={()=>goCategory('All products')}><Search size={19}/><span>Explore</span></button><button onClick={()=>setDrawer('wishlist')}><Heart size={19}/><span>Saved</span></button><button onClick={()=>setDrawer('cart')}><ShoppingCart size={19}/><span>Cart {cartCount>0&&`(${cartCount})`}</span></button><button onClick={()=>setDrawer('account')}><CircleUserRound size={19}/><span>Account</span></button></nav>

    {drawer && <div className="drawer-backdrop" onClick={()=>setDrawer('')}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-header"><div><span className="eyebrow">MWAMBA STORE</span><h2>{drawer==='cart'?'Your shopping bag':drawer==='wishlist'?'Your wishlist':drawer==='checkout'?'Checkout':'Welcome to Mwamba'}</h2></div><button className="icon-btn" onClick={()=>setDrawer('')}><X size={22}/></button></div>
      {drawer==='cart'&&<>{cart.length===0?<div className="drawer-empty"><ShoppingCart size={35}/><h3>Your bag is waiting</h3><p>Find something you love and add it here.</p><button className="dark-btn" onClick={()=>setDrawer('')}>Keep exploring</button></div>:<><div className="drawer-items">{cart.map(item=><div className="drawer-item" key={item.id}><div className={'drawer-item-art '+item.tint}>{item.art}</div><div className="drawer-item-info"><b>{item.name}</b><strong>{money(item.price)}</strong><div className="qty-control"><button onClick={()=>changeQty(item.id,-1)}><Minus size={13}/></button><span>{item.qty}</span><button onClick={()=>changeQty(item.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={()=>setCart(old=>old.filter(x=>x.id!==item.id))}><X size={16}/></button></div>)}</div><div className="drawer-total"><div><span>Subtotal</span><b>{money(cartTotal)}</b></div><small>Delivery fee calculated at checkout.</small><button className="dark-btn full-btn" onClick={startCheckout}>Continue to checkout <ArrowRight size={17}/></button></div></>}</>}
      {drawer==='wishlist'&&(wishlist.length===0?<div className="drawer-empty"><Heart size={35}/><h3>Keep the good finds close</h3><p>Tap the heart on a product to save it for later.</p><button className="dark-btn" onClick={()=>setDrawer('')}>Explore products</button></div>:<div className="drawer-items">{products.filter(p=>wishlist.includes(p.id)).map(p=><div className="drawer-item" key={p.id}><div className={'drawer-item-art '+p.tint}>{p.art}</div><div className="drawer-item-info"><b>{p.name}</b><strong>{money(p.price)}</strong><button className="mini-add" onClick={()=>addToCart(p)}>Add to cart</button></div><button className="remove-item" onClick={()=>toggleWish(p.id)}><X size={16}/></button></div>)}</div>)}
      {drawer==='account'&&<div className="account-content">{user ? <><div className="account-icon"><UserRound size={28}/></div><h3>Welcome, {user.name}</h3><p>{user.email}</p><div className="account-links">{user.role==='admin'&&<button onClick={()=>{setAdminTab('Overview');setDrawer('admin');}}><LayoutDashboard size={17}/> Open admin workspace <ChevronRight size={15}/></button>}<button onClick={()=>setReturnMessage('Order history is not available in this version yet.')}><Package size={17}/> My orders <ChevronRight size={15}/></button><button onClick={signOut}><LogOut size={17}/> Sign out <ChevronRight size={15}/></button></div></> : <><div className="account-icon"><UserRound size={28}/></div><h3>{authMode==='register'?'Create your Mwamba account':'Your Mwamba account'}</h3><p>{authMode==='register'?'Create an account to save your cart and complete checkout.':'Sign in to check out and manage your account.'}</p><form onSubmit={submitAuth}>{authMode==='register'&&<label>Full name<input name="name" type="text" minLength="2" maxLength="120" placeholder="Your full name" required/></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" required/></label><label>Password<input name="password" type="password" minLength={authMode==='register'?10:1} maxLength="72" placeholder={authMode==='register'?'At least 10 characters':'Enter your password'} required/></label><button className="dark-btn full-btn" disabled={authBusy}>{authBusy?'Please wait…':authMode==='register'?'Create account':'Sign in'} <ArrowRight size={17}/></button></form><p className="auth-note">{authMode==='register'?'Already have an account?':'New to Mwamba?'} <button onClick={()=>{setAuthMode(authMode==='register'?'login':'register');setNotice('');}}>{authMode==='register'?'Sign in':'Create an account'}</button></p></>}{returnMessage&&<small className="inline-notice">{returnMessage}</small>}{notice&&<small className="inline-notice">{notice}</small>}</div>}
      {drawer==='checkout'&&<div className="checkout-content"><div className="checkout-summary"><h3>Order summary</h3>{cart.map(i=><div key={i.id}><span>{i.qty} × {i.name}</span><b>{money(i.qty*i.price)}</b></div>)}<div className="checkout-grand"><span>Subtotal</span><b>{money(cartTotal)}</b></div></div><form onSubmit={submitCheckout}><label>Full name<input name="full_name" value={user?.name || ''} readOnly required placeholder="Your full name"/></label><label>Phone number<input name="phone" required type="tel" placeholder="+254 7xx xxx xxx"/></label><label>Delivery location<input name="delivery_address" required minLength="5" maxLength="500" placeholder="Estate, town or delivery address"/></label><label>Payment method<select name="payment_method" defaultValue="paystack"><option value="paystack">Pay online (Paystack)</option><option value="delivery">Pay on delivery (not enabled)</option></select></label><button className="dark-btn full-btn" disabled={checkoutBusy}>{checkoutBusy?'Connecting to Paystack…':'Continue to payment'} <ArrowRight size={17}/></button></form><p className="secure-note"><ShieldCheck size={15}/> The server calculates the total and confirms payment.</p>{paymentError&&<small className="inline-notice">{paymentError}</small>}</div>}
    </aside></div>}
    {notice&&drawer===''&&<div className="toast"><span>✓</span>{notice}</div>}
    <button className="admin-shortcut" title="Open admin workspace" onClick={()=>{if(user?.role==='admin'){setAdminTab('Overview');setDrawer('admin');}else{setDrawer('account');setNotice('Sign in with your administrator account to continue.');}}}><LayoutDashboard size={17}/><span>Admin</span></button>
  </div>;
}

export default App;