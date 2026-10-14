import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, ShoppingCart, Heart, UserRound, Menu, ChevronRight, ChevronDown,
  Zap, Truck, ShieldCheck, Headphones, Star, Plus, Minus, X, Package,
  LayoutDashboard, Boxes, ClipboardList, Users, BarChart3, Settings,
  Tag, ArrowRight, SlidersHorizontal, Smartphone, Shirt, House, Sparkles,
  Dumbbell, BookOpen, Baby, Car, Laptop, Watch, CircleUserRound, LogOut, Pencil, Trash2
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

function fallbackProductImage(product) {
  const name = String(product.name || '').toLowerCase();
  const category = String(product.category || '').toLowerCase();
  const photos = [
    [/sneaker|shoe|trainer|footwear/, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=82'],
    [/dress|jacket|tee|shirt|fashion|denim|clothing/, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=82'],
    [/bag|backpack|handbag/, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=82'],
    [/sunglass|watch|accessor/, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=82'],
    [/headphone|speaker|electronic|phone|tablet|laptop/, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=82'],
    [/home|lamp|cookware|kitchen|living/, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=82'],
    [/beauty|skin|cosmetic/, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=82'],
  ];
  const match = photos.find(([pattern]) => pattern.test(name) || pattern.test(category));
  return match?.[1] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=82';
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
    image: product.image_url || fallbackProductImage(product),
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
      <div className={`product-art ${product.tint}`}><img src={product.image} alt={product.name} loading="lazy" onError={e => { const img = e.currentTarget; const fallback = fallbackProductImage(product); if (!img.dataset.fallbackTried && img.src !== fallback) { img.dataset.fallbackTried = 'true'; img.src = fallback; } else { img.hidden = true; img.nextElementSibling.hidden = false; } }} /><span className="product-art-fallback" hidden>{product.art}</span></div>
    </div>
    <div className="product-info">
      <p className="product-category">{product.category}</p>
      <h3>{product.name}</h3>
      {product.reviews > 0 && <div className="rating"><Star size={13} fill="currentColor" /><b>{product.rating.toFixed(1)}</b><span>({product.reviews})</span></div>}
      <div className="price-line"><strong>{money(product.price)}</strong>{product.oldPrice > product.price && <del>{money(product.oldPrice)}</del>}</div>
      <button className="add-cart" onClick={() => onAdd(product)}><Plus size={16} /> Add to cart</button>
    </div>
  </article>;
}

const heroSlides = [
  {
    kicker: 'THE MWAMBA EVERYDAY EDIT',
    title: <>Good things.<br/><em>Great prices.</em></>,
    description: 'Discover the little upgrades that make everyday life feel extraordinary.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85',
    alt: 'Modern retail store with curated clothing and accessories',
    cta: 'Explore the store',
  },
  {
    kicker: 'STYLE FOR EVERY DAY',
    title: <>Find your look.<br/><em>Love your price.</em></>,
    description: 'Everyday fashion and accessories picked for your next favourite outfit.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85',
    alt: 'Fashion shoppers browsing clothing together',
    cta: 'Shop fashion',
    category: 'Fashion',
  },
  {
    kicker: 'SMART FINDS, BETTER LIVING',
    title: <>Little upgrades.<br/><em>Big difference.</em></>,
    description: 'Discover useful tech, home essentials and gifts for everyday life.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=85',
    alt: 'Modern consumer electronics on display',
    cta: 'Browse electronics',
    category: 'Electronics',
  },
];

function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All products');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [drawer, setDrawer] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [sort, setSort] = useState('featured');
  const [adminTab, setAdminTab] = useState('Overview');
  const [showAll, setShowAll] = useState(false);
  const [notice, setNotice] = useState('');
  const noticeTimerRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authBusy, setAuthBusy] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [dealEndsAt, setDealEndsAt] = useState(null);
  const [dealSecondsLeft, setDealSecondsLeft] = useState(0);
  const [productError, setProductError] = useState('');
  const [adminSummary, setAdminSummary] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminPromotions, setAdminPromotions] = useState([]);
  const [promotionForm, setPromotionForm] = useState({ name: '', code: '', discount_type: 'percentage', discount_value: '10', starts_at: '', ends_at: '' });
  const [publicConfig, setPublicConfig] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [productForm, setProductForm] = useState({ name: '', description: '', category_id: '', price: '', compare_at_price: '', stock_quantity: '0', sku: '', image_url: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [productImageBusy, setProductImageBusy] = useState(false);
  const [infoPage, setInfoPage] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [returnMessage, setReturnMessage] = useState('');
  const [paymentReference, setPaymentReference] = useState(() => new URLSearchParams(window.location.search).get('reference') || '');
  const [pathname, setPathname] = useState(() => window.location.pathname.replace(/\/+$/, '') || '/');

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
      // Keep the storefront view available while the API is offline.
      setPreviewMode(true);
      setCategoryData([]);
      setProductError('');
      setProducts(initialProducts);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const result = await api('/api/auth/me');
      const currentUser = result.user || null;
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  };

  const loadAdminData = async (tab = adminTab) => {
    if (!user || user.role !== 'admin') return;
    setAdminBusy(true);
    try {
      if (tab === 'Overview') {
        const [summary, productResult] = await Promise.all([
          api('/api/admin/summary'),
          api('/api/products/admin/all'),
        ]);
        setAdminSummary(summary);
        setAdminProducts(productResult.products || []);
      } else if (tab === 'Products') {
        const result = await api('/api/products/admin/all');
        setAdminProducts(result.products || []);
        const cats = await api('/api/categories/admin/all');
        setAdminCategories(cats.categories || []);
      } else if (tab === 'Categories') {
        const cats = await api('/api/categories/admin/all');
        setAdminCategories(cats.categories || []);
      } else if (tab === 'Orders') {
        const result = await api('/api/admin/orders');
        setAdminOrders(result.orders || []);
      } else if (tab === 'Customers') {
        const result = await api('/api/admin/customers');
        setAdminCustomers(result.customers || []);
      } else if (tab === 'Promotions') {
        const result = await api('/api/admin/promotions');
        setAdminPromotions(result.promotions || []);
      } else if (tab === 'Settings') {
        const result = await api('/api/config/public');
        setPublicConfig(result);
      }
    } catch (error) {
      setNotice(formatApiError(error));
    } finally {
      setAdminBusy(false);
    }
  };

  useEffect(() => {
    if (!notice) return undefined;
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 1800);
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, [notice]);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroSlide(current => (current + 1) % heroSlides.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadDealTimer = async () => {
      try {
        const result = await api('/api/deals/timer');
        if (mounted) setDealEndsAt(result.ends_at ? new Date(result.ends_at).getTime() : null);
      } catch {
        if (mounted) setDealEndsAt(null);
      }
    };
    loadDealTimer();
    const refresh = window.setInterval(loadDealTimer, 60000);
    return () => { mounted = false; window.clearInterval(refresh); };
  }, []);

  useEffect(() => {
    if (!dealEndsAt || !Number.isFinite(dealEndsAt)) {
      setDealSecondsLeft(0);
      return undefined;
    }
    const tick = () => setDealSecondsLeft(Math.max(0, Math.floor((dealEndsAt - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [dealEndsAt]);

  useEffect(() => {
    loadStorefront();
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    setPathname(currentPath);
    const isAdminPath = currentPath === '/admin';
    loadCurrentUser().then(currentUser => {
      if (isAdminPath) {
        if (currentUser?.role === 'admin') setDrawer('admin');
        else {
          setDrawer('account');
          setNotice('Sign in with an administrator account to access the admin workspace.');
        }
      }
    });
    if (pathname === '/login' || pathname === '/register' || pathname === '/account') {
      setAuthMode(pathname === '/register' ? 'register' : 'login');
      setDrawer('account');
    }
    if (paymentReference) {
      setReturnMessage('Payment return received. Sign in with the account used for checkout to verify your order.');
      setDrawer('account');
      const url = new URL(window.location.href);
      url.searchParams.delete('reference');
      url.searchParams.delete('trxref');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  }, []);

  useEffect(() => {
    if (!paymentReference) return;
    if (!user) {
      setDrawer('account');
      return;
    }
    verifyPaymentReturn(paymentReference);
  }, [paymentReference, user]);

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
    const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const searchTerm = normalize(query);
    let result = products.filter(p => {
      const categoryMatches = activeCategory === 'All products' || p.category === activeCategory;
      const searchableText = [p.name, p.category, p.description, p.brand, p.sku].map(normalize).join(' ');
      return categoryMatches && (!searchTerm || searchableText.includes(searchTerm));
    });
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
    setNotice('Added to your cart');
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
      setReturnMessage('');
    } catch (error) {
      setNotice(formatApiError(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const navigateTo = path => {
    const nextPath = path === '/' ? '/' : path.replace(/\/+$/, '');
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
    setPathname(nextPath);
    setDrawer('');
    setNotice('');
    if (nextPath === '/admin') {
      if (user?.role === 'admin') {
        setDrawer('admin');
        setAdminTab('Overview');
      } else {
        setAuthMode('login');
        setDrawer('account');
        setNotice('Sign in with an administrator account to access the admin workspace.');
      }
    } else if (nextPath === '/login' || nextPath === '/register' || nextPath === '/account') {
      setAuthMode(nextPath === '/register' ? 'register' : 'login');
      setDrawer('account');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => {
      const nextPath = window.location.pathname.replace(/\/+$/, '') || '/';
      setPathname(nextPath);
      if (nextPath === '/admin') {
        if (user?.role === 'admin') {
          setDrawer('admin');
          setAdminTab('Overview');
          setNotice('');
        } else {
          setDrawer('account');
          setNotice('Sign in with an administrator account to access the admin workspace.');
        }
      } else if (['/login', '/register', '/account'].includes(nextPath)) {
        setAuthMode(nextPath === '/register' ? 'register' : 'login');
        setDrawer('account');
      } else {
        setDrawer('');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [user]);

  const signOut = async () => {
    try { await api('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) }); }
    catch (error) { setNotice(formatApiError(error)); }
    setUser(null);
    setDrawer('');
  };

  const verifyPaymentReturn = async reference => {
    if (!reference) return;
    setPaymentReference('');
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
      await api(editingProductId ? '/api/products/' + editingProductId : '/api/products', { method: editingProductId ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      setProductForm({ name: '', description: '', category_id: '', price: '', compare_at_price: '', stock_quantity: '0', sku: '', image_url: '' });
      setEditingProductId(null);
      await loadAdminData('Products');
      await loadStorefront();
      setNotice(editingProductId ? 'Product updated.' : 'Product added to the catalogue.');
    } catch (error) {
      setNotice(formatApiError(error));
    } finally { setAdminBusy(false); }
  };

  const editProduct = product => {
    setEditingProductId(product.id);
    setProductForm({ name: product.name || '', description: product.description || '', category_id: product.category_id ? String(product.category_id) : '', price: String(product.price ?? ''), compare_at_price: product.compare_at_price == null ? '' : String(product.compare_at_price), stock_quantity: String(product.stock_quantity ?? 0), sku: product.sku || '', image_url: product.image_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const archiveProduct = async product => {
    if (!window.confirm('Archive this product? It will be hidden from customers and order history will be preserved.')) return;
    setAdminBusy(true);
    try { await api('/api/products/' + product.id, { method: 'PATCH', body: JSON.stringify({ status: 'archived' }) }); await loadAdminData('Products'); await loadStorefront(); setNotice('Product archived.'); }
    catch (error) { setNotice(formatApiError(error)); } finally { setAdminBusy(false); }
  };
  const uploadProductImage = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) { setNotice('Choose a JPG, PNG, WEBP or GIF image.'); event.target.value=''; return; }
    if (file.size > 5*1024*1024) { setNotice('Choose an image smaller than 5 MB.'); event.target.value=''; return; }
    setProductImageBusy(true);
    try {
      const dataUrl = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(new Error('Could not read image.')); reader.readAsDataURL(file); });
      const result = await api('/api/products/upload-image', { method:'POST', body:JSON.stringify({ image:dataUrl, filename:file.name }) });
      setProductForm(old=>({...old,image_url:result.url})); setNotice('Image uploaded. Save the product to publish it.');
    } catch(error) { setNotice(formatApiError(error)); } finally { setProductImageBusy(false); event.target.value=''; }
  };

  const updateOrderStatus = async (id, status) => {
    setAdminBusy(true);
    try {
      await api('/api/admin/orders/' + id, { method: 'PATCH', body: JSON.stringify({ status }) });
      const result = await api('/api/admin/orders');
      setAdminOrders(result.orders || []);
      setNotice('Order status updated.');
    } catch (error) {
      setNotice(formatApiError(error));
    } finally {
      setAdminBusy(false);
    }
  };

  const createPromotion = async event => {
    event.preventDefault();
    setAdminBusy(true);
    try {
      const payload = {
        ...promotionForm,
        discount_value: Number(promotionForm.discount_value),
        starts_at: promotionForm.starts_at || null,
        ends_at: promotionForm.ends_at || null,
      };
      await api('/api/admin/promotions', { method: 'POST', body: JSON.stringify(payload) });
      setPromotionForm({ name: '', code: '', discount_type: 'percentage', discount_value: '10', starts_at: '', ends_at: '' });
      const result = await api('/api/admin/promotions');
      setAdminPromotions(result.promotions || []);
      setNotice('Promotion created as inactive. Activate it when ready.');
    } catch (error) {
      setNotice(formatApiError(error));
    } finally {
      setAdminBusy(false);
    }
  };

  const togglePromotion = async promotion => {
    setAdminBusy(true);
    try {
      await api('/api/admin/promotions/' + promotion.id, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !Boolean(promotion.is_active) }),
      });
      const result = await api('/api/admin/promotions');
      setAdminPromotions(result.promotions || []);
      setNotice(promotion.is_active ? 'Promotion deactivated.' : 'Promotion activated.');
    } catch (error) {
      setNotice(formatApiError(error));
    } finally {
      setAdminBusy(false);
    }
  };

  if (drawer === 'admin' && user?.role === 'admin') return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Brand /><div className="admin-label">STORE MANAGEMENT</div>
      {[['Overview',BarChart3],['Products',Boxes],['Categories',Tag],['Orders',ClipboardList],['Customers',Users],['Promotions',Tag],['Settings',Settings]].map(([name,Icon]) => <button key={name} className={adminTab===name?'admin-nav active':'admin-nav'} onClick={()=>setAdminTab(name)}><Icon size={18}/>{name}</button>)}
      <div className="admin-side-bottom"><button className="admin-nav" onClick={()=>navigateTo('/')}><ArrowRight size={18}/> Back to store</button><button className="admin-nav" onClick={signOut}><LogOut size={18}/> Sign out</button><p>MWAMBA STORE<br/><span>Admin workspace</span></p></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><span className="eyebrow">WORKSPACE / {adminTab.toUpperCase()}</span><h1>{adminTab}</h1></div><div className="admin-profile"><span className="avatar">{(user.name || 'A').slice(0,1).toUpperCase()}</span><div><b>{user.name}</b><small>Administrator</small></div><ChevronDown size={16}/></div></header>
      {adminBusy && <p className="inline-notice">Loading live store data…</p>}
      {notice && <p className="inline-notice" role="status">{notice}</p>}
      {adminTab==='Overview' ? <>
        <div className="admin-welcome"><div><p>YOUR STORE AT A GLANCE</p><h2>Good day, {user.name} 👋</h2><span>Here’s what’s happening with Mwamba Store.</span></div><button className="dark-btn" onClick={()=>setAdminTab('Products')}><Plus size={17}/> Manage products</button></div>
        <div className="stats-grid">{[['Total revenue',money(adminSummary?.revenue || 0),'Paid orders this month','This month'],['Orders',String(adminSummary?.orders ?? 0),'All orders','In the store'],['Products',String(adminSummary?.products ?? 0),String(adminSummary?.low_stock ?? 0)+' low stock','In your catalogue'],['Customers',String(adminSummary?.customers ?? 0),'Active accounts','Registered']].map(([label,value,trend,sub])=><div className="stat-card" key={label}><span>{label}</span><h3>{value}</h3><div><b>{trend}</b><small>{sub}</small></div></div>)}</div>
        <section className="admin-panel"><div className="panel-heading"><div><h3>Inventory watch</h3><p>Products that need attention</p></div><Boxes size={19}/></div>{adminProducts.filter(p=>Number(p.stock_quantity)<=5 && p.status==='active').slice(0,8).map(p=><div className="inventory-row" key={p.id}><span className="mini-product">▦</span><div><b>{p.name}</b><small>Stock level</small></div><span className="stock-low">{p.stock_quantity} left</span></div>)}{!adminProducts.length&&<p>No product inventory loaded yet. Use Products to add catalogue items.</p>}</section>
      </> : adminTab==='Products' ? <div className="admin-panels">
        <section className="admin-panel"><div className="panel-heading"><div><h3>{editingProductId ? 'Edit product' : 'Add a product'}</h3><p>Products become visible to customers when saved.</p></div></div>
          <form className="admin-form" onSubmit={createProduct}>
            <label>Product name<input required minLength="2" maxLength="180" value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})}/></label>
            <label>Category<select value={productForm.category_id} onChange={e=>setProductForm({...productForm,category_id:e.target.value})}><option value="">No category</option>{adminCategories.filter(c=>c.is_active).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label>Price (KES)<input required type="number" min="1" step="0.01" value={productForm.price} onChange={e=>setProductForm({...productForm,price:e.target.value})}/></label>
            <label>Compare-at price (KES)<input type="number" min="0.01" step="0.01" value={productForm.compare_at_price} onChange={e=>setProductForm({...productForm,compare_at_price:e.target.value})}/></label>
            <label>Stock quantity<input type="number" min="0" step="1" value={productForm.stock_quantity} onChange={e=>setProductForm({...productForm,stock_quantity:e.target.value})}/></label>
            <label>SKU (optional)<input maxLength="100" value={productForm.sku} onChange={e=>setProductForm({...productForm,sku:e.target.value})}/></label>
            <label className="wide-field">Image URL (HTTPS)<input type="url" placeholder="https://…" value={productForm.image_url} onChange={e=>setProductForm({...productForm,image_url:e.target.value})}/></label>
            <label className="wide-field upload-field">Upload from phone or computer<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadProductImage} disabled={productImageBusy}/><small>{productImageBusy ? 'Uploading image…' : 'JPG, PNG, WEBP or GIF · maximum 5 MB'}</small></label>
            {productForm.image_url && <div className="wide-field product-image-preview"><img src={productForm.image_url} alt="Product preview" onError={e=>{e.currentTarget.hidden=true;}}/><span>Image preview</span></div>}
            <label className="wide-field">Description<textarea rows="3" maxLength="10000" value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})}/></label>
            <div className="form-actions"><button className="dark-btn" disabled={adminBusy || productImageBusy}>{editingProductId ? <Pencil size={16}/> : <Plus size={16}/>} {adminBusy ? 'Saving…' : editingProductId ? 'Update product' : 'Save product'}</button>{editingProductId && <button type="button" className="secondary-btn" onClick={()=>{setEditingProductId(null);setProductForm({name:'',description:'',category_id:'',price:'',compare_at_price:'',stock_quantity:'0',sku:'',image_url:''});}}>Cancel edit</button>}</div>
          </form>
        </section>
        <section className="admin-panel"><div className="panel-heading"><div><h3>Catalogue</h3><p>{adminProducts.length} products</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>PRODUCT</th><th>PRICE</th><th>STOCK</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{adminProducts.map(p=><tr key={p.id}><td>{p.name}</td><td>{money(p.price)}</td><td>{p.stock_quantity}</td><td>{p.status}</td><td><div className="table-actions"><button className="text-link" onClick={()=>editProduct(p)}><Pencil size={14}/> Edit</button>{p.status !== 'archived' && <button className="text-link danger-link" disabled={adminBusy} onClick={()=>archiveProduct(p)}><Trash2 size={14}/> Archive</button>}</div></td></tr>)}</tbody></table></div></section>
      </div> : adminTab==='Categories' ? <div className="admin-panels">
        <section className="admin-panel"><div className="panel-heading"><div><h3>Add a category</h3><p>New active categories appear in the storefront catalogue.</p></div></div><form className="admin-form" onSubmit={createCategory}>
          <label>Category name<input required minLength="2" maxLength="100" value={categoryName} onChange={e=>setCategoryName(e.target.value)}/></label>
          <label>Description<input maxLength="500" value={categoryDescription} onChange={e=>setCategoryDescription(e.target.value)}/></label>
          <button className="dark-btn" disabled={adminBusy}><Plus size={16}/> Create category</button>
        </form></section>
        <section className="admin-panel"><div className="panel-heading"><div><h3>Categories</h3><p>{adminCategories.length} configured</p></div></div><div className="admin-table-wrap"><table><thead><tr><th>NAME</th><th>SLUG</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{adminCategories.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.slug}</td><td>{c.is_active?'Active':'Inactive'}</td><td>{c.is_active&&<button className="text-link" onClick={async()=>{try{await api('/api/categories/'+c.id,{method:'DELETE'});await loadAdminData('Categories');await loadStorefront();setNotice('Category deactivated.');}catch(error){setNotice(formatApiError(error));}}}>Deactivate</button>}</td></tr>)}</tbody></table></div></section>
      </div> : adminTab==='Orders' ? <section className="admin-panel">
        <div className="panel-heading"><div><h3>Customer orders</h3><p>{adminOrders.length} recent orders · paid orders can move through fulfillment</p></div></div>
        <div className="admin-table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PAYMENT</th><th>TOTAL</th><th>FULFILLMENT</th></tr></thead><tbody>
          {adminOrders.map(o=><tr key={o.id}><td><b>{o.order_number}</b><small>{new Date(o.created_at).toLocaleDateString()}</small></td><td>{o.customer_name}<small>{o.customer_email}</small></td><td>{o.payment_status}</td><td>{money(o.total)}</td><td><select aria-label={'Fulfillment status for '+o.order_number} value={o.status} disabled={adminBusy} onChange={e=>updateOrderStatus(o.id,e.target.value)}><option value={o.status}>{o.status.replaceAll('_',' ')}</option>{o.payment_status==='paid'&&['processing','packed','shipped','delivered'].filter(s=>s!==o.status).map(s=><option key={s} value={s}>{s}</option>)}{o.status!=='review_required'&&<option value="review_required">review required</option>}</select></td></tr>)}
        </tbody></table>{!adminOrders.length&&<p>No orders yet.</p>}</div>
      </section> : adminTab==='Customers' ? <section className="admin-panel">
        <div className="panel-heading"><div><h3>Customers</h3><p>{adminCustomers.length} customer accounts</p></div></div>
        <div className="admin-table-wrap"><table><thead><tr><th>CUSTOMER</th><th>STATUS</th><th>ORDERS</th><th>PAID TOTAL</th><th>JOINED</th></tr></thead><tbody>
          {adminCustomers.map(customer=><tr key={customer.id}><td><b>{customer.name}</b><small>{customer.email}</small></td><td>{customer.status}</td><td>{customer.order_count}</td><td>{money(customer.paid_total)}</td><td>{new Date(customer.created_at).toLocaleDateString()}</td></tr>)}
        </tbody></table>{!adminCustomers.length&&<p>No customer accounts yet.</p>}</div>
      </section> : adminTab==='Promotions' ? <div className="admin-panels">
        <section className="admin-panel"><div className="panel-heading"><div><h3>Create a promotion</h3><p>New promotions are created inactive and must be activated intentionally.</p></div></div>
          <form className="admin-form" onSubmit={createPromotion}>
            <label>Promotion name<input required minLength="2" maxLength="160" value={promotionForm.name} onChange={e=>setPromotionForm({...promotionForm,name:e.target.value})}/></label>
            <label>Code (optional)<input maxLength="60" placeholder="WELCOME10" value={promotionForm.code} onChange={e=>setPromotionForm({...promotionForm,code:e.target.value.toUpperCase()})}/></label>
            <label>Discount type<select value={promotionForm.discount_type} onChange={e=>setPromotionForm({...promotionForm,discount_type:e.target.value})}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed amount (KES)</option></select></label>
            <label>Discount value<input required type="number" min="0.01" max={promotionForm.discount_type==='percentage'?'100':undefined} step="0.01" value={promotionForm.discount_value} onChange={e=>setPromotionForm({...promotionForm,discount_value:e.target.value})}/></label>
            <label>Starts at (optional)<input type="datetime-local" value={promotionForm.starts_at} onChange={e=>setPromotionForm({...promotionForm,starts_at:e.target.value})}/></label>
            <label>Ends at (optional)<input type="datetime-local" value={promotionForm.ends_at} onChange={e=>setPromotionForm({...promotionForm,ends_at:e.target.value})}/></label>
            <button className="dark-btn" disabled={adminBusy}><Plus size={16}/>{adminBusy?'Saving…':'Create promotion'}</button>
          </form>
        </section>
        <section className="admin-panel"><div className="panel-heading"><div><h3>Promotions</h3><p>{adminPromotions.length} configured</p></div></div>
          <div className="admin-table-wrap"><table><thead><tr><th>NAME / CODE</th><th>DISCOUNT</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
            {adminPromotions.map(p=><tr key={p.id}><td><b>{p.name}</b><small>{p.code || 'No code'}</small></td><td>{p.discount_type==='percentage'?p.discount_value+'%':money(p.discount_value)}</td><td>{p.is_active?'Active':'Inactive'}</td><td><button className="text-link" disabled={adminBusy} onClick={()=>togglePromotion(p)}>{p.is_active?'Deactivate':'Activate'}</button></td></tr>)}
          </tbody></table>{!adminPromotions.length&&<p>No promotions created yet.</p>}</div>
        </section>
      </div> : <section className="admin-panel">
        <div className="panel-heading"><div><h3>Store configuration</h3><p>Read-only status from the server. Secret values are never sent to the browser.</p></div></div>
        {publicConfig ? <div className="stats-grid"><div className="stat-card"><span>Store currency</span><h3>{publicConfig.currency || 'KES'}</h3><small>Displayed prices use this currency.</small></div><div className="stat-card"><span>Paystack configuration</span><h3>{publicConfig.paymentsConfigured?'Configured':'Not configured'}</h3><small>{publicConfig.paymentsConfigured?'Server has a secret key and HTTPS callback URL.':'Set PAYSTACK_SECRET_KEY and PAYSTACK_CALLBACK_URL in Hostinger.'}</small></div></div> : <p>Loading configuration…</p>}
        <p className="inline-notice">Database credentials and payment secret keys are intentionally not displayed here.</p>
      </section>}
    </main>
  </div>;

  return <div className="app-shell">
    <div className="announcement"><span>Good finds. Better prices. Every day.</span><span className="announcement-right"><Truck size={14}/> Delivery across Kenya <i/> Need help? <button className="contact-link" onClick={()=>setNotice("Customer support contact details will be added before launch.")}>Contact us</button></span></div>
    <header className="main-header">
      <button className="mobile-menu icon-btn" aria-label={mobileMenu ? "Close categories menu" : "Open categories menu"} aria-expanded={mobileMenu} aria-controls="category-dropdown" onClick={()=>setMobileMenu(!mobileMenu)}><Menu size={22}/></button>
      <button className="brand-button" onClick={()=>{setActiveCategory('All products');setQuery('');window.scrollTo({top:0,behavior:'smooth'});}}><Brand /></button>
      <form className="search-box" role="search" onSubmit={e=>{e.preventDefault();setShowAll(true);setActiveCategory('All products');document.getElementById('products')?.scrollIntoView({behavior:'smooth',block:'start'});}}><Search size={19}/><input type="search" aria-label="Search products" value={query} onChange={e=>{setQuery(e.target.value);setShowAll(true);}} placeholder="Search products, brands and more..." /><kbd>↵</kbd>{query && <button type="button" className="search-clear" aria-label="Clear search" onClick={()=>{setQuery('');setShowAll(true);}}>×</button>}<button type="submit">Search</button></form>
      <div className="header-actions">
        <button className="header-action" onClick={()=>setDrawer('account')}><UserRound size={21}/><span><small>Hello, welcome</small><b>My account</b></span></button>
        <button className="header-action wishlist-action" onClick={()=>setDrawer('wishlist')}><span className="action-icon"><Heart size={21}/>{wishlist.length>0&&<i>{wishlist.length}</i>}</span><span><small>Your saved</small><b>Wishlist</b></span></button>
        <button className="header-action cart-action" onClick={()=>setDrawer('cart')}><span className="action-icon"><ShoppingCart size={22}/><i>{cartCount}</i></span><span><small>Your bag</small><b>Cart</b></span></button>
      </div>
    </header>
    {mobileMenu && <div id="category-dropdown" className="header-category-dropdown">
      <button className="dropdown-category all-categories-link" onClick={()=>{setMobileMenu(false);document.getElementById('category-section')?.scrollIntoView({behavior:'smooth',block:'start'});}}><Boxes size={17}/><span>All categories</span><ChevronRight size={15}/></button>
      {(categoryData.length ? [...categories.filter(c => categoryData.some(live => live.name === c.name)), ...categoryData.filter(live => !categories.some(c => c.name === live.name)).map(live => ({ name: live.name, icon: Tag }))] : categories).map(({name,icon:Icon=Tag})=><button key={name} className={activeCategory===name?'dropdown-category selected':''} onClick={()=>{goCategory(name);setMobileMenu(false)}}><Icon size={17}/><span>{name}</span><ChevronRight size={15}/></button>)}
      <button className="dropdown-category" onClick={()=>{setActiveCategory('All products');setShowAll(true);setMobileMenu(false);document.getElementById('products')?.scrollIntoView({behavior:'smooth',block:'start'})}}><Zap size={17}/><span>Deals & all products</span><ChevronRight size={15}/></button>
    </div>}

    {previewMode && <div role="status" style={{ background: '#fff4e5', color: '#714400', padding: '10px 16px', textAlign: 'center', fontSize: '14px' }}>Preview mode: the live backend is temporarily unavailable. Sample products are shown; account and checkout services require the backend.</div>}
    <main>
      <section className="hero-layout">
        
        <div className="hero-main">
          <div className="hero-banner" aria-roledescription="carousel" aria-label="Mwamba store highlights">
            <div className="hero-copy" key={heroSlide}>
              <span className="hero-kicker"><Sparkles size={14}/> {heroSlides[heroSlide].kicker}</span>
              <h1>{heroSlides[heroSlide].title}</h1>
              <p>{heroSlides[heroSlide].description}</p>
              <button onClick={()=>{if(heroSlides[heroSlide].category)setActiveCategory(heroSlides[heroSlide].category);else setActiveCategory('All products');setShowAll(true);document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}}>{heroSlides[heroSlide].cta} <ArrowRight size={17}/></button>
              <div className="hero-dots" role="group" aria-label="Choose featured slide">{heroSlides.map((slide,index)=><button key={slide.kicker} className={index===heroSlide?'active':''} aria-label={'Show slide '+(index+1)} aria-pressed={index===heroSlide} onClick={()=>setHeroSlide(index)}/>)}</div>
            </div>
            <div className="hero-photo" key={heroSlides[heroSlide].image}>
              <img src={heroSlides[heroSlide].image} alt={heroSlides[heroSlide].alt} loading="eager" />
              <div className="hero-photo-shade"/>
              <span className="hero-photo-tag">FRESH FINDS · EVERY DAY</span>
            </div>
            <div className="hero-number">0{heroSlide+1} / 0{heroSlides.length}</div>
          </div><div className="benefit-strip"><div><span className="benefit-icon"><Truck size={20}/></span><div><b>Convenient delivery</b><small>Across Kenya</small></div></div><div><span className="benefit-icon"><ShieldCheck size={20}/></span><div><b>Shop with confidence</b><small>Secure checkout</small></div></div><div><span className="benefit-icon"><Headphones size={20}/></span><div><b>Here to help</b><small>Customer support</small></div></div></div>
        </div>
      </section>

      <section id="category-section" className="category-section"><div className="section-heading"><div><span className="eyebrow">FIND YOUR NEXT FAVOURITE</span><h2>Browse by category</h2></div><button className="text-link" onClick={()=>document.getElementById('category-section')?.scrollIntoView({behavior:'smooth',block:'start'})}>All categories <ArrowRight size={16}/></button></div><div className="category-grid category-grid-scroll" aria-label="Browse categories; scroll horizontally to see more">{(categoryData.length ? [...categories.filter(c => categoryData.some(live => live.name === c.name)), ...categoryData.filter(live => !categories.some(c => c.name === live.name)).map(live => ({ name: live.name, color: 'lavender', image: '', icon: Tag }))] : categories).map(({name,color,image,icon:Icon})=><button className="category-tile" key={name} onClick={()=>goCategory(name)}><span className={'category-illustration '+(color || 'lavender')}><Icon size={27}/>{image&&<img src={image} alt="" loading="eager" decoding="async" onError={e=>{e.currentTarget.remove();}} />}</span><b>{name}</b><small>{products.filter(p=>p.category===name).length} items</small></button>)}</div></section>

      <section className="deal-banner"><div className="deal-mark"><Zap size={24} fill="currentColor"/></div><div className="deal-copy"><span>THE DAILY DROP</span><h2>Little prices. Big energy.</h2><p>Handpicked deals for your everyday.</p></div><div className="deal-countdown"><span>THIS WEEK'S FINDS</span><div><b>{String(Math.floor(dealSecondsLeft / 3600)).padStart(2, '0')}</b><i>:</i><b>{String(Math.floor((dealSecondsLeft % 3600) / 60)).padStart(2, '0')}</b><i>:</i><b>{String(dealSecondsLeft % 60).padStart(2, '0')}</b></div><small>Hours&nbsp;&nbsp;&nbsp; Mins&nbsp;&nbsp;&nbsp; Secs</small></div><button onClick={()=>{setActiveCategory('All products');setSort('price-low');setShowAll(true);document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}}>Shop the deals <ArrowRight size={17}/></button><div className="deal-decoration">✳</div></section>

      <section className="products-section" id="products"><div className="section-heading product-heading"><div><span className="eyebrow">GOOD FINDS, PICKED FOR YOU</span><h2>{activeCategory==='All products'?'Popular right now':activeCategory}</h2><p>Everyday essentials and little luxuries worth discovering.</p></div><div className="product-tools"><label><SlidersHorizontal size={16}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label></div></div>
        {productError&&<div className="empty-state"><h3>We couldn't load the catalogue</h3><p>{productError}</p><button className="dark-btn" onClick={loadStorefront}>Try again</button></div>}
        {loadingProducts&&!productError&&<div className="empty-state"><p>Loading products…</p></div>}
        {!loadingProducts&&!productError&&<div className="product-grid">{visibleProducts.map(p=><ProductCard key={p.id} product={p} wished={wishlist.includes(p.id)} onWish={toggleWish} onAdd={addToCart}/>)}</div>}
        {!loadingProducts&&!productError&&visibleProducts.length===0&&<div className="empty-state"><Search size={30}/><h3>No products found</h3><p>Try a different search or choose another category.</p><button className="dark-btn" onClick={()=>{setQuery('');setActiveCategory('All products')}}>Clear filters</button></div>}
        {visibleProducts.length>0&&<button className="load-more" onClick={()=>{setShowAll(!showAll);if(showAll)document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}}>{showAll?'Show fewer products':'Explore all products'} <ArrowRight size={16}/></button>}
      </section>

      <section className="trust-section"><div className="trust-heading"><span className="eyebrow">A LITTLE MORE PEACE OF MIND</span><h2>Shopping should feel good.</h2></div><div className="trust-grid"><div><Truck size={23}/><h3>Delivery made simple</h3><p>Convenient delivery options for your location.</p></div><div><ShieldCheck size={23}/><h3>Checkout you can trust</h3><p>Your shopping experience and payment security matter.</p></div><div><Headphones size={23}/><h3>Real help, when needed</h3><p>Our team is here to help you shop with confidence.</p></div></div></section>
    </main>
    <footer className="footer"><div className="footer-top"><div className="footer-brand"><Brand/><p>Everyday essentials, unexpected finds,<br/>and good prices all in one place.</p><button className="footer-about-link" onClick={()=>setInfoPage('about')}>About Mwamba Store</button><div className="social-dots"><button aria-label="Facebook" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>f</button><button aria-label="Instagram" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>◎</button><button aria-label="X" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>𝕏</button></div></div><div><h4>SHOP</h4><button onClick={()=>goCategory('All products')}>All products</button><button onClick={()=>goCategory('Fashion')}>Fashion</button><button onClick={()=>goCategory('Electronics')}>Electronics</button><button onClick={()=>goCategory('Home & Living')}>Home & Living</button></div><div><h4>YOUR MWAMBA</h4><button onClick={()=>setDrawer('account')}>My account</button><button onClick={()=>setDrawer('cart')}>Shopping cart</button><button onClick={()=>setDrawer('wishlist')}>Wishlist</button><button onClick={()=>setDrawer('account')}>Order history</button></div><div className="newsletter"><h4>A GOOD THING IN YOUR INBOX</h4><p>Get first dibs on new finds and special deals.</p><form onSubmit={e=>{e.preventDefault();setNotice('Thanks for joining the Mwamba list!')}}><input type="email" placeholder="Your email address" required/><button aria-label="Subscribe"><ArrowRight size={18}/></button></form>{notice&&<small className="newsletter-notice">{notice}</small>}</div></div><div className="footer-bottom"><span>© 2026 Mwamba Store. Made for everyday living.</span><div><button onClick={()=>setInfoPage('privacy')}>Privacy</button><button onClick={()=>setInfoPage('terms')}>Terms</button><button onClick={()=>setInfoPage('help')}>Help centre</button></div><span className="footer-pay">Secure payments · Paystack</span></div></footer>
    <nav className="mobile-bottom-nav"><button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><House size={19}/><span>Home</span></button><button onClick={()=>goCategory('All products')}><Search size={19}/><span>Explore</span></button><button onClick={()=>setDrawer('wishlist')}><Heart size={19}/><span>Saved</span></button><button onClick={()=>setDrawer('cart')}><ShoppingCart size={19}/><span>Cart {cartCount>0&&`(${cartCount})`}</span></button><button onClick={()=>setDrawer('account')}><CircleUserRound size={19}/><span>Account</span></button></nav>

    {infoPage && <div className="drawer-backdrop info-backdrop" onClick={()=>setInfoPage('')}><section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title"><button className="icon-btn info-close" aria-label="Close information" onClick={()=>setInfoPage('')}><X size={20}/></button><span className="eyebrow">MWAMBA STORE</span><h2 id="info-modal-title">{({about:'About us',terms:'Terms and conditions',privacy:'Privacy',help:'Help centre'})[infoPage]}</h2>{infoPage==='about' ? <p>Mwamba Store brings everyday finds together in one convenient place, with a growing catalogue across fashion, electronics, home and living, beauty and more. We aim to make browsing, ordering and delivery across Kenya straightforward.</p> : infoPage==='terms' ? <><h3>Orders and payment</h3><p>Orders are subject to product availability and confirmation. Prices are displayed in Kenyan shillings unless stated otherwise. Payment must be confirmed before an order is fulfilled.</p><h3>Delivery</h3><p>Delivery timelines depend on the destination and courier availability. Please provide accurate contact and delivery details when ordering.</p><h3>Returns and support</h3><p>Contact store support with your order details if an item arrives damaged or an order needs attention. Applicable consumer rights under Kenyan law remain unaffected.</p></> : infoPage==='privacy' ? <p>We use account, delivery and order details to operate the store, process purchases, support customers and prevent fraud. Payment credentials are handled by the payment provider. Do not send passwords through support messages.</p> : <p>For help with an order, keep your order number and the email used at checkout available. You can also sign in to review your account and place orders.</p>}<button className="dark-btn" onClick={()=>setInfoPage('')}>Close</button></section></div>}
    {drawer && <div className="drawer-backdrop" onClick={()=>setDrawer('')}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-header"><div><span className="eyebrow">MWAMBA STORE</span><h2>{drawer==='cart'?'Your shopping bag':drawer==='wishlist'?'Your wishlist':drawer==='checkout'?'Checkout':'Welcome to Mwamba'}</h2></div><button className="icon-btn" onClick={()=>setDrawer('')}><X size={22}/></button></div>
      {drawer==='cart'&&<>{cart.length===0?<div className="drawer-empty"><ShoppingCart size={35}/><h3>Your bag is waiting</h3><p>Find something you love and add it here.</p><button className="dark-btn" onClick={()=>setDrawer('')}>Keep exploring</button></div>:<><div className="drawer-items">{cart.map(item=><div className="drawer-item" key={item.id}><div className={'drawer-item-art '+item.tint}>{item.art}</div><div className="drawer-item-info"><b>{item.name}</b><strong>{money(item.price)}</strong><div className="qty-control"><button onClick={()=>changeQty(item.id,-1)}><Minus size={13}/></button><span>{item.qty}</span><button onClick={()=>changeQty(item.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={()=>setCart(old=>old.filter(x=>x.id!==item.id))}><X size={16}/></button></div>)}</div><div className="drawer-total"><div><span>Subtotal</span><b>{money(cartTotal)}</b></div><small>Delivery fee calculated at checkout.</small><button className="dark-btn full-btn" onClick={startCheckout}>Continue to checkout <ArrowRight size={17}/></button></div></>}</>}
      {drawer==='wishlist'&&(wishlist.length===0?<div className="drawer-empty"><Heart size={35}/><h3>Keep the good finds close</h3><p>Tap the heart on a product to save it for later.</p><button className="dark-btn" onClick={()=>setDrawer('')}>Explore products</button></div>:<div className="drawer-items">{products.filter(p=>wishlist.includes(p.id)).map(p=><div className="drawer-item" key={p.id}><div className={'drawer-item-art '+p.tint}>{p.art}</div><div className="drawer-item-info"><b>{p.name}</b><strong>{money(p.price)}</strong><button className="mini-add" onClick={()=>addToCart(p)}>Add to cart</button></div><button className="remove-item" onClick={()=>toggleWish(p.id)}><X size={16}/></button></div>)}</div>)}
      {drawer==='account'&&<div className="account-content">{user ? <><div className="account-icon"><UserRound size={28}/></div><h3>Welcome, {user.name}</h3><p>{user.email}</p><div className="account-links">{user.role==='admin'&&<button onClick={()=>{setAdminTab('Overview');setDrawer('admin');}}><LayoutDashboard size={17}/> Open admin workspace <ChevronRight size={15}/></button>}<button onClick={()=>setReturnMessage('Order history is not available in this version yet.')}><Package size={17}/> My orders <ChevronRight size={15}/></button><button onClick={signOut}><LogOut size={17}/> Sign out <ChevronRight size={15}/></button></div></> : <><div className="account-icon"><UserRound size={28}/></div><h3>{authMode==='register'?'Create your Mwamba account':'Your Mwamba account'}</h3><p>{authMode==='register'?'Create an account to save your cart and complete checkout.':'Sign in to check out and manage your account.'}</p><form onSubmit={submitAuth}>{authMode==='register'&&<label>Full name<input name="name" type="text" minLength="2" maxLength="120" placeholder="Your full name" required/></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" required/></label><label>Password<input name="password" type="password" minLength={authMode==='register'?10:1} maxLength="72" placeholder={authMode==='register'?'At least 10 characters':'Enter your password'} required/></label><button className="dark-btn full-btn" disabled={authBusy}>{authBusy?'Please wait…':authMode==='register'?'Create account':'Sign in'} <ArrowRight size={17}/></button></form><p className="auth-note">{authMode==='register'?'Already have an account?':'New to Mwamba?'} <button onClick={()=>{setAuthMode(authMode==='register'?'login':'register');setNotice('');}}>{authMode==='register'?'Sign in':'Create an account'}</button></p></>}{returnMessage&&<small className="inline-notice">{returnMessage}</small>}{notice&&<small className="inline-notice">{notice}</small>}</div>}
      {drawer==='checkout'&&<div className="checkout-content"><div className="checkout-summary"><h3>Order summary</h3>{cart.map(i=><div key={i.id}><span>{i.qty} × {i.name}</span><b>{money(i.qty*i.price)}</b></div>)}<div className="checkout-grand"><span>Subtotal</span><b>{money(cartTotal)}</b></div></div><form onSubmit={submitCheckout}><label>Full name<input name="full_name" value={user?.name || ''} readOnly required placeholder="Your full name"/></label><label>Phone number<input name="phone" required type="tel" placeholder="+254 7xx xxx xxx"/></label><label>Delivery location<input name="delivery_address" required minLength="5" maxLength="500" placeholder="Estate, town or delivery address"/></label><label>Payment method<select name="payment_method" defaultValue="paystack"><option value="paystack">Pay online (Paystack)</option><option value="delivery">Pay on delivery (not enabled)</option></select></label><button className="dark-btn full-btn" disabled={checkoutBusy}>{checkoutBusy?'Connecting to Paystack…':'Continue to payment'} <ArrowRight size={17}/></button></form><p className="secure-note"><ShieldCheck size={15}/> The server calculates the total and confirms payment.</p>{paymentError&&<small className="inline-notice">{paymentError}</small>}</div>}
    </aside></div>}
    {notice&&drawer===''&&<div className="toast"><span>✓</span>{notice}</div>}
    <button className="admin-shortcut" title="Open admin workspace" onClick={()=>navigateTo('/admin')}><LayoutDashboard size={17}/><span>Admin</span></button>
  </div>;
}

export default App;