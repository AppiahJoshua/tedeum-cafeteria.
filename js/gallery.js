/* ============================================================
   TE-DEUM L'AUDAMUS — Gallery JS
   ============================================================ */

const GALLERY = [
  {id:1,  cat:'food',     emoji:'🍕', title:'Special Te-Deum Pizza',        height:220},
  {id:2,  cat:'interior', emoji:'🏠', title:'Main Dining Area',             height:290},
  {id:3,  cat:'food',     emoji:'🥗', title:'Choice Salads',                height:200},
  {id:4,  cat:'events',   emoji:'🎂', title:'Birthday Celebration',         height:260},
  {id:5,  cat:'food',     emoji:'🫕', title:'Fufu & Groundnut Soup',        height:190},
  {id:6,  cat:'interior', emoji:'✨', title:'Restaurant Interior',          height:280},
  {id:7,  cat:'food',     emoji:'🍔', title:'Signature Burger',             height:210},
  {id:8,  cat:'events',   emoji:'🎉', title:'Group Dining Event',           height:250},
  {id:9,  cat:'food',     emoji:'🥢', title:'Chinese Fried Rice',           height:200},
  {id:10, cat:'interior', emoji:'🪑', title:'Round Table Seating',          height:270},
  {id:11, cat:'food',     emoji:'🍳', title:'English Breakfast Spread',     height:200},
  {id:12, cat:'events',   emoji:'🥂', title:'Celebration Dinner',           height:240},
  {id:13, cat:'food',     emoji:'🍝', title:'Spaghetti Cabonara',           height:190},
  {id:14, cat:'interior', emoji:'💡', title:'Bar & Drinks Display',         height:280},
  {id:15, cat:'food',     emoji:'🎂', title:'Premium Birthday Cake',        height:230},
  {id:16, cat:'events',   emoji:'👥', title:'Corporate Lunch',              height:220},
  {id:17, cat:'food',     emoji:'🦐', title:'Golden Fried Prawns',          height:200},
  {id:18, cat:'food',     emoji:'🍞', title:'Pastries & Baked Goods',       height:190},
];

let activeCat = 'all';
let lightboxIdx = 0;
let visibleItems = [];

function renderGallery() {
  visibleItems = activeCat === 'all' ? GALLERY : GALLERY.filter(i => i.cat === activeCat);
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = visibleItems.map((item, idx) => `
    <div class="masonry-item" onclick="openLightbox(${idx})" style="opacity:0;transform:scale(.94);transition:opacity .4s ease ${idx*35}ms,transform .4s ease ${idx*35}ms">
      <div class="gallery-thumb-placeholder" style="height:${item.height}px">${item.emoji}</div>
      <div class="gallery-overlay">
        <div class="gallery-overlay-title">${item.title}</div>
        <div class="gallery-overlay-cat">${item.cat.charAt(0).toUpperCase()+item.cat.slice(1)}</div>
      </div>
    </div>`).join('');
  requestAnimationFrame(() => grid.querySelectorAll('.masonry-item').forEach(el => { el.style.opacity='1'; el.style.transform='scale(1)'; }));
}

function openLightbox(idx) { lightboxIdx=idx; updateLightbox(); document.getElementById('lightbox').classList.add('open'); document.body.style.overflow='hidden'; }
function closeLightbox()   { document.getElementById('lightbox').classList.remove('open'); document.body.style.overflow=''; }
function lightboxNav(dir)  { lightboxIdx=(lightboxIdx+dir+visibleItems.length)%visibleItems.length; updateLightbox(); }
function updateLightbox()  {
  const item = visibleItems[lightboxIdx];
  const img  = document.getElementById('lightboxImg');
  img.textContent = item.emoji; img.style.fontSize = '8rem';
  document.getElementById('lightboxTitle').textContent = item.title;
  document.getElementById('lightboxCat').textContent   = item.cat.charAt(0).toUpperCase()+item.cat.slice(1);
}

document.querySelectorAll('.gal-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gal-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); activeCat = btn.dataset.cat; renderGallery();
  });
});
document.getElementById('lightbox')?.addEventListener('click', e => { if(e.target===document.getElementById('lightbox')) closeLightbox(); });
document.addEventListener('keydown', e => {
  if(!document.getElementById('lightbox')?.classList.contains('open')) return;
  if(e.key==='Escape') closeLightbox();
  if(e.key==='ArrowLeft') lightboxNav(-1);
  if(e.key==='ArrowRight') lightboxNav(1);
});

renderGallery();
