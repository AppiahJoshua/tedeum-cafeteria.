/* ============================================================
   TE-DEUM L'AUDAMUS — Shared JavaScript
   ============================================================ */

const navbar    = document.querySelector('.navbar');
const hamburger = document.querySelector('.nav-hamburger');
const mobileNav = document.querySelector('.nav-mobile');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const s = hamburger.querySelectorAll('span');
    if (mobileNav.classList.contains('open')) {
      s[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      s[1].style.opacity   = '0';
      s[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      s.forEach(x => { x.style.transform = ''; x.style.opacity = ''; });
    }
  });
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}
setActiveNav();

const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

function showToast(message, type = 'success') {
  let c = document.querySelector('.toast-container');
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span><span>${message}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function openModal(id)  { const o = document.getElementById(id); if (o) { o.classList.add('open'); document.body.style.overflow = 'hidden'; } }
function closeModal(id) { const o = document.getElementById(id); if (o) { o.classList.remove('open'); document.body.style.overflow = ''; } }
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) { o.classList.remove('open'); document.body.style.overflow = ''; } });
});
document.querySelectorAll('.modal-close').forEach(b => {
  b.addEventListener('click', () => { const o = b.closest('.modal-overlay'); if (o) { o.classList.remove('open'); document.body.style.overflow = ''; } });
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });
});
