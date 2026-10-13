import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from './lib/api.js';
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

const money = value => 'KSh ' + Number(value).toLocaleString('en-KE');

function Brand() {
  return <div className="brand-lockup"><span className="brand-mark">m<span>.</span></span><span className="brand-name">mwamba<span>store</span></span></div>;
}

function ProductCard({ product, wished, onWish, onAdd }) {
  const discount = product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return <article className="product-card">
    <div className="product-art-wrap">
      {(product.badge || discount > 0) && <span className="sale-badge">{product.badge || `−${discount}%`}</span>}
      <button className={`wish-btn ${wished ? 'is-wished' : ''}`} aria-label="Add to wishlist" onClick={() => onWish(product.id)}><Heart size={18} fill={wished ? 'currentColor' : 'none'} /></button>
      <div className={`product-art ${product.tint}`}>{product.image ? <img src={product.image} alt={product.name} loading="lazy" onError={e => { e.currentTarget.hidden = true; e.currentTarget.nextElementSibling.hidden = false; }} /> : null}<span className="product-art-fallback" hidden={Boolean(product.image)}>{product.art}</span></div>
    </div>
    <div className="product-info">
      <p className="product-category">{product.category}</p>
      <h3>{product.name}</h3>
      {product.rating && product.reviews > 0 && <div className="rating"><Star size={13} fill="currentColor" /><b>{product.rating}</b><span>({product.reviews})</span></div>}
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
  const [productsLoading, setProductsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [adminSummary, setAdminSummary] = useState(null);
  const [adminLoadError, setAdminLoadError] = useState('');
  const [paymentReturn, setPaymentReturn] = useState({ loading: false, success: false, message: '' });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest('/products'),
      apiRequest('/auth/me').catch(() => null),
    ]).then(([catalogue, session]) => {
      if (cancelled) return;
      const liveProducts = (catalogue.products || []).map(product => ({
        ...product,
        price: Number(product.price),
        oldPrice: product.compare_at_price == null ? null : Number(product.compare_at_price),
        rating: null,
        reviews: 0,
        badge: null,
        art: '🛍️',
        tint: 'lavender',
        image: product.image_url || '',
      }));
      setProducts(liveProducts);
      setUser(session?.user || null);
    }).catch(error => {
      if (!cancelled) setApiError(error.message || 'Could not load products from the store API.');
    }).finally(() => {
      if (!cancelled) setProductsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (drawer !== 'admin' || user?.role !== 'admin') return;
    let cancelled = false;
    apiRequest('/admin/summary').then(data => { if (!cancelled) { setAdminSummary(data); setAdminLoadError(''); } }).catch(error => { if (!cancelled) setAdminLoadError(error.message); });
    return () => { cancelled = true; };
  }, [drawer, user]);

  useEffect(() => {
    if (window.location.pathname !== '/payment/return') return;
    const reference = new URLSearchParams(window.location.search).get('reference');
    if (!reference) {
      setPaymentReturn({ loading: false, success: false, message: 'No payment reference was provided. Check your order or contact store support.' });
      return;
    }
    let cancelled = false;
    setPaymentReturn({ loading: true, success: false, message: 'Confirming your payment securely…' });
    apiRequest(`/payments/verify/${encodeURIComponent(reference)}`).then(() => {
      if (!cancelled) setPaymentReturn({ loading: false, success: true, message: 'Payment confirmed. Your order is being processed.' });
    }).catch(error => {
      if (!cancelled) setPaymentReturn({ loading: false, success: false, message: error.message || 'We could not confirm this payment. Do not pay again immediately; contact support with your payment reference.' });
    });
    return () => { cancelled = true; };
  }, []);

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
    setCart(old => old.some(item => item.id === product.id) ? old.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item) : [...old, {...product, qty: 1}]);
    setNotice('Added to your cart'); setTimeout(() => setNotice(''), 2200);
  };
  const changeQty = (id, delta) => setCart(old => old.map(item => item.id === id ? {...item, qty: item.qty + delta} : item).filter(item => item.qty > 0));
  const toggleWish = id => setWishlist(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const goCategory = name => { setActiveCategory(name); setShowAll(true); document.getElementById('products')?.scrollIntoView({behavior:'smooth'}); };
  const startCheckout = () => { setDrawer('checkout'); };

  if (window.location.pathname === '/payment/return') return <main className="app-shell"><section className="empty-state"><div className="account-icon">{paymentReturn.loading ? '…' : paymentReturn.success ? '✓' : '!'}</div><h1>{paymentReturn.loading ? 'Checking your payment' : paymentReturn.success ? 'Thank you for your order' : 'Payment confirmation pending'}</h1><p>{paymentReturn.message || 'Please wait while we verify the payment with the server.'}</p><button className="dark-btn" onClick={() => window.location.assign('/')}>Return to Mwamba Store</button></section></main>;

  if (drawer === 'admin' && user?.role !== 'admin') return <div className="drawer-backdrop"><section className="drawer"><div className="drawer-header"><div><span className="eyebrow">MWAMBA STORE</span><h2>Administrator sign-in required</h2></div><button className="icon-btn" onClick={() => setDrawer('')}><X size={22}/></button></div><p>The admin workspace is restricted to authenticated administrator accounts.</p><button className="dark-btn full-btn" onClick={() => { setDrawer('account'); setAuthMode('login'); }}>Sign in to continue</button></section></div>;

  if (drawer === 'admin') return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Brand /><div className="admin-label">STORE MANAGEMENT</div>
      {[['Overview',BarChart3],['Products',Boxes],['Orders',ClipboardList],['Customers',Users],['Promotions',Tag],['Settings',Settings]].map(([name,Icon]) => <button key={name} className={adminTab===name?'admin-nav active':'admin-nav'} onClick={()=>setAdminTab(name)}><Icon size={18}/>{name}</button>)}
      <div className="admin-side-bottom"><button className="admin-nav" onClick={()=>setDrawer('')}><ArrowRight size={18}/> Back to store</button><p>MWAMBA STORE<br/><span>Admin workspace</span></p></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><span className="eyebrow">WORKSPACE / {adminTab.toUpperCase()}</span><h1>{adminTab}</h1></div><div className="admin-profile"><span className="avatar">M</span><div><b>Store Admin</b><small>Administrator</small></div><ChevronDown size={16}/></div></header>
      {adminTab==='Overview' ? <>
        <div className="admin-welcome"><div><p>YOUR STORE AT A GLANCE</p><h2>Good day, Admin 👋</h2><span>Here’s what’s happening with Mwamba Store.</span></div><button className="dark-btn" onClick={()=>setAdminTab('Products')}><Plus size={17}/> Manage products</button></div>
        <div className="stats-grid">{[['Total revenue',money(adminSummary?.revenue ?? 0),'Database total','Paid orders this month'],['Orders',adminSummary?.orders ?? '—','Live count','All orders'],['Products',adminSummary?.products ?? '—','Live count','Non-archived products'],['Customers',adminSummary?.customers ?? '—','Live count','Active customer accounts']].map(([label,value,trend,sub])=><div className="stat-card" key={label}><span>{label}</span><h3>{value}</h3><div><b>{trend}</b><small>{sub}</small></div></div>)}</div>{adminLoadError&&<p className="inline-notice">Could not load live admin metrics: {adminLoadError}</p>}
        <div className="admin-panels"><section className="admin-panel"><div className="panel-heading"><div><h3>Recent orders</h3><p>Your latest customer purchases</p></div><button onClick={()=>setAdminTab('Orders')}>View all <ArrowRight size={15}/></button></div><p className="admin-placeholder">Live order-list API is not implemented yet. No demonstration orders are shown here.</p></section>
        <section className="admin-panel inventory-panel"><div className="panel-heading"><div><h3>Inventory watch</h3><p>Products that need attention</p></div><Boxes size={19}/></div>{adminSummary ? <div className="inventory-row"><span className="mini-product">▦</span><div><b>Low-stock products</b><small>Active products with five or fewer units</small></div><span className="stock-low">{adminSummary.low_stock}</span></div> : <p className="admin-placeholder">Loading inventory summary…</p>}</section></div>
      </> : <section className="admin-panel admin-placeholder"><div className="placeholder-icon"><Boxes size={30}/></div><h2>{adminTab} management</h2><p>This workspace is ready for the live {adminTab.toLowerCase()} module. The next build step connects this view to persistent product, order, and customer data.</p>{adminTab==='Products'&&<button className="dark-btn" onClick={()=>setNotice('Product management API is the next integration step.')}><Plus size={17}/> Add product</button>}{notice&&<p className="inline-notice">{notice}</p>}</section>}
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
        <div className="product-grid">{visibleProducts.map(p=><ProductCard key={p.id} product={p} wished={wishlist.includes(p.id)} onWish={toggleWish} onAdd={addToCart}/>)}</div>
        {productsLoading && <div className="empty-state"><p>Loading products from Mwamba Store…</p></div>}
        {!productsLoading && apiError && <div className="empty-state"><h3>Store catalogue unavailable</h3><p>{apiError}</p><button className="dark-btn" onClick={()=>window.location.reload()}>Try again</button></div>}
        {!productsLoading && !apiError && visibleProducts.length===0&&<div className="empty-state"><Search size={30}/><h3>No products found</h3><p>Try a different search or choose another category.</p><button className="dark-btn" onClick={()=>{setQuery('');setActiveCategory('All products')}}>Clear filters</button></div>}
        {visibleProducts.length>0&&<button className="load-more" onClick={()=>{setShowAll(!showAll);if(showAll)document.getElementById('products')?.scrollIntoView({behavior:'smooth'})}}>{showAll?'Show fewer products':'Explore all products'} <ArrowRight size={16}/></button>}
      </section>

      <section className="trust-section"><div className="trust-heading"><span className="eyebrow">A LITTLE MORE PEACE OF MIND</span><h2>Shopping should feel good.</h2></div><div className="trust-grid"><div><Truck size={23}/><h3>Delivery made simple</h3><p>Convenient delivery options for your location.</p></div><div><ShieldCheck size={23}/><h3>Checkout you can trust</h3><p>Your shopping experience and payment security matter.</p></div><div><Headphones size={23}/><h3>Real help, when needed</h3><p>Our team is here to help you shop with confidence.</p></div></div></section>
    </main>
    <footer className="footer"><div className="footer-top"><div className="footer-brand"><Brand/><p>Everyday essentials, unexpected finds,<br/>and good prices all in one place.</p><div className="social-dots"><button aria-label="Facebook" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>f</button><button aria-label="Instagram" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>◎</button><button aria-label="X" onClick={()=>setNotice("Mwamba Store social links will be connected before launch.")}>𝕏</button></div></div><div><h4>SHOP</h4><button onClick={()=>goCategory('All products')}>All products</button><button onClick={()=>goCategory('Fashion')}>Fashion</button><button onClick={()=>goCategory('Electronics')}>Electronics</button><button onClick={()=>goCategory('Home & Living')}>Home & Living</button></div><div><h4>YOUR MWAMBA</h4><button onClick={()=>setDrawer('account')}>My account</button><button onClick={()=>setDrawer('cart')}>Shopping cart</button><button onClick={()=>setDrawer('wishlist')}>Wishlist</button><button onClick={()=>setDrawer('account')}>Order history</button></div><div className="newsletter"><h4>A GOOD THING IN YOUR INBOX</h4><p>Get first dibs on new finds and special deals.</p><form onSubmit={e=>{e.preventDefault();setNotice('Thanks for joining the Mwamba list!');setTimeout(()=>setNotice(''),2500)}}><input type="email" placeholder="Your email address" required/><button aria-label="Subscribe"><ArrowRight size={18}/></button></form>{notice&&<small className="newsletter-notice">{notice}</small>}</div></div><div className="footer-bottom"><span>© 2026 Mwamba Store. Made for everyday living.</span><div><button onClick={()=>setNotice("Privacy information will be published before launch.")}>Privacy</button><button onClick={()=>setNotice("Terms and conditions will be published before launch.")}>Terms</button><button onClick={()=>setNotice("Customer support details will be added before launch.")}>Help centre</button></div><span className="footer-pay">Secure payments · Paystack integration planned</span></div></footer>
    <nav className="mobile-bottom-nav"><button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><House size={19}/><span>Home</span></button><button onClick={()=>goCategory('All products')}><Search size={19}/><span>Explore</span></button><button onClick={()=>setDrawer('wishlist')}><Heart size={19}/><span>Saved</span></button><button onClick={()=>setDrawer('cart')}><ShoppingCart size={19}/><span>Cart {cartCount>0&&`(${cartCount})`}</span></button><button onClick={()=>setDrawer('account')}><CircleUserRound size={19}/><span>Account</span></button></nav>

    {drawer && <div className="drawer-backdrop" onClick={()=>setDrawer('')}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-header"><div><span className="eyebrow">MWAMBA STORE</span><h2>{drawer==='cart'?'Your shopping bag':drawer==='wishlist'?'Your wishlist':drawer==='checkout'?'Checkout':'Welcome to Mwamba'}</h2></div><button className="icon-btn" onClick={()=>setDrawer('')}><X size={22}/></button></div>
      {drawer==='cart'&&<>{cart.length===0?<div className="drawer-empty"><ShoppingCart size={35}/><h3>Your bag is waiting</h3><p>Find something you love and add it here.</p><button className="dark-btn" onClick={()=>setDrawer('')}>Keep exploring</button></div>:<><div className="drawer-items">{cart.map(item=><div className="drawer-item" key={item.id}><div className={'drawer-item-art '+item.tint}>{item.art}</div><div className="drawer-item-info"><b>{item.name}</b><strong>{money(item.price)}</strong><div className="qty-control"><button onClick={()=>changeQty(item.id,-1)}><Minus size={13}/></button><span>{item.qty}</span><button onClick={()=>changeQty(item.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={()=>setCart(old=>old.filter(x=>x.id!==item.id))}><X size={16}/></button></div>)}</div><div className="drawer-total"><div><span>Subtotal</span><b>{money(cartTotal)}</b></div><small>Delivery fee calculated at checkout.</small><button className="dark-btn full-btn" onClick={startCheckout}>Continue to checkout <ArrowRight size={17}/></button></div></>}</>}
      {drawer==='wishlist'&&(wishlist.length===0?<div className="drawer-empty"><Heart size={35}/><h3>Keep the good finds close</h3><p>Tap the heart on a product to save it for later.</p><button className="dark-btn" onClick={()=>setDrawer('')}>Explore products</button></div>:<div className="drawer-items">{products.filter(p=>wishlist.includes(p.id)).map(p=><div className="drawer-item" key={p.id}><div className={'drawer-item-art '+p.tint}>{p.art}</div><div className="drawer-item-info"><b>{p.name}</b><strong>{money(p.price)}</strong><button className="mini-add" onClick={()=>addToCart(p)}>Add to cart</button></div><button className="remove-item" onClick={()=>toggleWish(p.id)}><X size={16}/></button></div>)}</div>)}
      {drawer==='account'&&<div className="account-content">{user ? <><div className="account-icon"><UserRound size={28}/></div><h3>Hello, {user.name}</h3><p>{user.email}</p><p className="auth-note">Signed in as {user.role}.</p><button className="dark-btn full-btn" disabled={busy} onClick={async()=>{setBusy(true);try{await apiRequest('/auth/logout',{method:'POST'});setUser(null);setNotice('You have signed out.');}catch(error){setNotice(error.message);}finally{setBusy(false);}}}><LogOut size={17}/> Sign out</button>{user.role==='admin'&&<button className="dark-btn full-btn" onClick={()=>setDrawer('admin')}>Open admin workspace</button>}</> : <><div className="account-icon"><UserRound size={28}/></div><h3>{authMode==='login'?'Your Mwamba account':'Create your account'}</h3><p>Sign in to track orders and check out securely.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);setNotice('');const form=new FormData(e.currentTarget);const payload={email:String(form.get('email')||''),password:String(form.get('password')||'')};if(authMode==='register')payload.name=String(form.get('name')||'');try{const result=await apiRequest(`/auth/${authMode}`,{method:'POST',body:JSON.stringify(payload)});setUser(result.user);setNotice(authMode==='register'?'Account created successfully.':'Welcome back!');}catch(error){setNotice(error.message||'Authentication failed.');}finally{setBusy(false);}}}>{authMode==='register'&&<label>Full name<input name="name" autoComplete="name" required minLength="2" maxLength="120" placeholder="Your full name"/></label>}<label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required/></label><label>Password<input name="password" type="password" autoComplete={authMode==='login'?'current-password':'new-password'} minLength={authMode==='register'?10:1} maxLength="72" placeholder="Enter your password" required/></label><button className="dark-btn full-btn" disabled={busy}>{busy?'Please wait…':authMode==='login'?'Sign in':'Create account'} <ArrowRight size={17}/></button></form><p className="auth-note">{authMode==='login'?'New to Mwamba?':'Already have an account?'} <button onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setNotice('');}}>{authMode==='login'?'Create an account':'Sign in'}</button></p>{notice&&<small className="inline-notice">{notice}</small>}</> }<div className="account-links"><button onClick={()=>setNotice(user?'Order history API is not yet implemented.':'Sign in to view your orders.') }><Package size={17}/> My orders <ChevronRight size={15}/></button><button onClick={()=>setNotice('Account settings API is not yet implemented.') }><Settings size={17}/> Account settings <ChevronRight size={15}/></button></div></div>}
      {drawer==='checkout'&&<div className="checkout-content"><div className="checkout-summary"><h3>Order summary</h3>{cart.map(i=><div key={i.id}><span>{i.qty} × {i.name}</span><b>{money(i.qty*i.price)}</b></div>)}<div className="checkout-grand"><span>Subtotal</span><b>{money(cartTotal)}</b></div></div>{!user&&<p className="inline-notice">Please sign in before checkout. <button onClick={()=>setDrawer('account')}>Sign in</button></p>}<form onSubmit={async e=>{e.preventDefault();setCheckoutError('');if(!user){setDrawer('account');setAuthMode('login');setCheckoutError('Sign in before continuing to payment.');return;}if(!cart.length){setCheckoutError('Your cart is empty.');return;}setBusy(true);const form=new FormData(e.currentTarget);try{const result=await apiRequest('/payments/initialize',{method:'POST',body:JSON.stringify({items:cart.map(item=>({product_id:item.id,quantity:item.qty})),phone:String(form.get('phone')||''),delivery_address:String(form.get('address')||'')})});if(!result.authorization_url)throw new Error('Payment provider did not return a checkout URL.');window.location.assign(result.authorization_url);}catch(error){setCheckoutError(error.message||'Could not start checkout.');}finally{setBusy(false);}}}><label>Phone number<input name="phone" required type="tel" minLength="7" maxLength="30" placeholder="+254 7xx xxx xxx"/></label><label>Delivery location<input name="address" required minLength="5" maxLength="500" placeholder="Estate, town or delivery address"/></label><button className="dark-btn full-btn" disabled={busy||!cart.length}>{busy?'Connecting to Paystack…':'Continue to payment'} <ArrowRight size={17}/></button></form><p className="secure-note"><ShieldCheck size={15}/> Final prices and payment status are verified by the server.</p>{checkoutError&&<small className="inline-notice">{checkoutError}</small>}</div>}
    </aside></div>}
    {notice&&drawer===''&&<div className="toast"><span>✓</span>{notice}</div>}
    <button className="admin-shortcut" title="Open admin workspace" onClick={()=>setDrawer('admin')}><LayoutDashboard size={17}/><span>Admin</span></button>
  </div>;
}

export default App;