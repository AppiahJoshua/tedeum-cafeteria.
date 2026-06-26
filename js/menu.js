/* ============================================================
   TE-DEUM L'AUDAMUS — Menu Page JS
   ============================================================ */

let cart     = JSON.parse(localStorage.getItem('tedeum_cart') || '[]');
let allItems = [];
let activecat = 'all';
let searchQ   = '';

const CATS = {
  all:          { label:'Full Menu',       emoji:'🍽️' },
  breakfast:    { label:'Breakfast',        emoji:'🌅' },
  salads:       { label:'Salads',           emoji:'🥗' },
  continental:  { label:'Continental',      emoji:'🥩' },
  ghanaian:     { label:'Ghanaian Dishes',  emoji:'🫕' },
  chinese:      { label:'Chinese Dishes',   emoji:'🥢' },
  sauces:       { label:'Sauces & Curries', emoji:'🍲' },
  pizza:        { label:'Pizza',            emoji:'🍕' },
  sandwiches:   { label:'Sandwiches & Burgers', emoji:'🍔' },
  snacks:       { label:'Snacks & Sides',   emoji:'🍟' },
  pastries:     { label:'Pastries & Cakes', emoji:'🎂' },
  drinks:       { label:'Drinks & Bar',     emoji:'🍺' },
};

function saveCart() { localStorage.setItem('tedeum_cart', JSON.stringify(cart)); }

function addToCart(item) {
  const ex = cart.find(c => c.id === item.id);
  if (ex) ex.qty++;
  else cart.push({ ...item, qty: 1 });
  saveCart(); renderCartBar();
  showToast(item.name + ' added ✓', 'success');
}

function renderCartBar() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const bar   = document.getElementById('cartBar');
  if (!bar) return;
  document.getElementById('cartCount').textContent  = count;
  document.getElementById('cartLabel').textContent  = count === 1 ? 'item' : 'items';
  document.getElementById('cartTotal').textContent  = 'GHS ' + total.toFixed(2);
  bar.classList.toggle('visible', count > 0);
}

function itemThumb(item) {
  if (item.image_url) {
    return `<img src="${item.image_url}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:2rem">${item.emoji||'🍽️'}</div>`;
  }
  return item.emoji || '🍽️';
}

function renderMenu() {
  const content = document.getElementById('menuContent');
  const q = searchQ.toLowerCase();
  const filtered = allItems.filter(item => {
    const matchCat = activecat === 'all' || item.category === activecat;
    const matchQ   = !q || item.name.toLowerCase().includes(q) || (item.description||'').toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  if (!filtered.length) {
    content.innerHTML = `<div class="no-results"><div style="font-size:3rem;margin-bottom:14px">🔍</div>
      <h3 style="font-family:'Playfair Display',serif;margin-bottom:8px">No dishes found</h3>
      <p>Try a different search or category.</p></div>`;
    return;
  }

  const sections = {};
  filtered.forEach(item => {
    if (!sections[item.category]) sections[item.category] = [];
    sections[item.category].push(item);
  });

  content.innerHTML = Object.entries(sections).map(([cat, items]) => {
    const info = CATS[cat] || { label: cat, emoji: '🍽️' };
    return `
      <div class="menu-section">
        <div class="menu-section-header">
          <div class="menu-section-icon">${info.emoji}</div>
          <div class="menu-section-title">${info.label}</div>
          <div class="menu-section-count">${items.length} item${items.length!==1?'s':''}</div>
        </div>
        <div class="menu-list">
          ${items.map(item => `
            <div class="menu-item">
              <div class="menu-item-emoji">${itemThumb(item)}</div>
              <div class="menu-item-info">
                <div class="menu-item-name">${item.name}${item.popular?'<span class="popular-badge">Popular</span>':''}</div>
                <div class="menu-item-desc">${item.description||''}</div>
                <div class="menu-item-price">GHS ${item.price}</div>
              </div>
              <button class="menu-item-add" onclick='addToCart(${JSON.stringify({id:item.id,name:item.name,price:item.price,emoji:item.emoji||"🍽️"})})'>+</button>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');

  content.querySelectorAll('.menu-section').forEach((el, i) => {
    el.style.opacity = '0'; el.style.transform = 'translateY(18px)';
    setTimeout(() => { el.style.transition='opacity .45s ease,transform .45s ease'; el.style.opacity='1'; el.style.transform='translateY(0)'; }, i*70);
  });
}

async function loadMenu() {
  document.getElementById('menuContent').innerHTML = `
    <div style="text-align:center;padding:80px 20px;color:var(--text-muted)">
      <div style="font-size:2.5rem;margin-bottom:14px;animation:spin 1s linear infinite;display:inline-block">⏳</div>
      <p>Loading menu…</p></div>`;
  try {
    const res = await API.getMenu();
    allItems  = res.data || [];
    renderMenu();
  } catch {
    document.getElementById('menuContent').innerHTML = `
      <div style="text-align:center;padding:60px 20px">
        <div style="font-size:2.5rem;margin-bottom:12px">⚠️</div>
        <p style="color:var(--text-muted)">Could not load menu.</p>
        <button class="btn btn-outline btn-sm" style="margin-top:14px" onclick="loadMenu()">Retry</button>
      </div>`;
  }
}

document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active'); activecat = tab.dataset.cat; renderMenu();
  });
});
document.getElementById('menuSearch')?.addEventListener('input', e => { searchQ = e.target.value; renderMenu(); });

loadMenu(); renderCartBar();
