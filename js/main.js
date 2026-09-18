/* =============================================
   QAWWAM EMPIRE — Main JavaScript
   ============================================= */

/* --- Page Loader --- */
const loader = document.getElementById('page-loader');
window.addEventListener('load', () => {
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 500);
  }
});

/* --- Dark Mode Toggle --- */
const THEME_KEY = 'qe-theme';
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
}

(function initTheme() {
  let saved;
  try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || sys);
})();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}

/* --- Scroll Progress Bar --- */
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

/* --- Sticky Header Shadow --- */
const header = document.querySelector('.site-header');
function updateHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', updateHeader, { passive: true });

/* --- Back to Top --- */
const backTop = document.getElementById('back-to-top');
function updateBackTop() {
  if (!backTop) return;
  backTop.classList.toggle('visible', window.scrollY > 400);
}
if (backTop) {
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
window.addEventListener('scroll', updateBackTop, { passive: true });

/* --- Mobile Nav --- */
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileClose = document.getElementById('mobile-nav-close');

function openMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.add('open');
  document.body.classList.add('menu-open');
  menuToggle && menuToggle.setAttribute('aria-expanded', 'true');
}

function closeMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle && menuToggle.addEventListener('click', openMobileNav);
mobileClose && mobileClose.addEventListener('click', closeMobileNav);
mobileNav && mobileNav.addEventListener('click', (e) => {
  if (e.target === mobileNav) closeMobileNav();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeMobileNav(); closeAllModals(); }
});

/* --- Full-Site Search --- */
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

const searchData = [
  { title: 'Home', url: '/', desc: 'Welcome to Qawwam Empire', section: 'Pages' },
  { title: 'About Us', url: '#about', desc: 'Our story, mission and values', section: 'Pages' },
  { title: 'Services', url: '#services', desc: 'Consulting, strategy and execution', section: 'Pages' },
  { title: 'Blog', url: '#blog', desc: 'Articles and insights', section: 'Pages' },
  { title: 'Contact', url: '#contact', desc: 'Get in touch with our team', section: 'Pages' },
  { title: 'Performance Optimization Guide', url: 'blog/performance.html', desc: 'N+1 queries, re-renders, and more', section: 'Blog' },
  { title: 'Web Vitals Deep Dive', url: '#', desc: 'LCP, CLS, FID and TTFB explained', section: 'Blog' },
  { title: 'FAQ', url: '#faq', desc: 'Frequently asked questions', section: 'Pages' },
  { title: 'Newsletter', url: '#newsletter', desc: 'Stay updated with our content', section: 'Pages' },
];

function renderSearch(query) {
  if (!searchResults) return;
  if (!query.trim()) { searchResults.classList.remove('open'); return; }
  const q = query.toLowerCase();
  const hits = searchData.filter(d =>
    d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)
  );
  const grouped = {};
  hits.forEach(h => { (grouped[h.section] = grouped[h.section] || []).push(h); });
  const inner = searchResults.querySelector('.search-results-inner');
  if (hits.length === 0) {
    inner.innerHTML = `<p class="search-empty">No results for "<strong>${escapeHtml(query)}</strong>"</p>`;
  } else {
    inner.innerHTML = Object.entries(grouped).map(([section, items]) => `
      <h3>${escapeHtml(section)}</h3>
      ${items.map(item => `
        <a class="search-result-item" href="${item.url}">
          <div>
            <h4>${highlight(item.title, q)}</h4>
            <p>${highlight(item.desc, q)}</p>
          </div>
        </a>
      `).join('')}
    `).join('');
  }
  searchResults.classList.add('open');
}

function highlight(str, query) {
  const safe = escapeHtml(str);
  const safeQ = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(`(${safeQ})`, 'gi'), '<mark>$1</mark>');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

if (searchInput) {
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => renderSearch(searchInput.value), 200);
  });
  searchInput.addEventListener('focus', () => { if (searchInput.value) renderSearch(searchInput.value); });
  document.addEventListener('click', (e) => {
    if (!searchResults) return;
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
      searchResults.classList.remove('open');
    }
  });
}

/* --- FAQ Accordion --- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* --- Newsletter --- */
const newsletterForm = document.getElementById('newsletter-form');
const newsletterSuccess = document.getElementById('newsletter-success');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    if (!email) return;
    newsletterForm.style.display = 'none';
    if (newsletterSuccess) newsletterSuccess.classList.add('visible');
    try { localStorage.setItem('qe-newsletter', '1'); } catch (_) {}
  });
}

/* --- Password Visibility Toggle --- */
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.input-group').querySelector('input');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    btn.innerHTML = isHidden
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });
});

/* --- Confirmation Modals --- */
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
}

document.querySelectorAll('[data-confirm]').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const modalId = trigger.getAttribute('data-confirm');
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  });
});

document.querySelectorAll('.modal-cancel').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAllModals();
  });
});

document.querySelectorAll('.modal-confirm').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-action');
    closeAllModals();
    if (action === 'delete') showToast('Item deleted successfully', 'success');
    if (action === 'unsubscribe') showToast('Unsubscribed successfully', 'success');
  });
});

/* --- Cookie Banner --- */
const cookieBanner = document.getElementById('cookie-banner');
const COOKIE_KEY = 'qe-cookie-consent';

function initCookieBanner() {
  let accepted;
  try { accepted = localStorage.getItem(COOKIE_KEY); } catch (_) {}
  if (!accepted && cookieBanner) {
    setTimeout(() => cookieBanner.classList.add('visible'), 1200);
  }
}

document.getElementById('cookie-accept')?.addEventListener('click', () => {
  try { localStorage.setItem(COOKIE_KEY, '1'); } catch (_) {}
  cookieBanner && cookieBanner.classList.remove('visible');
});

document.getElementById('cookie-decline')?.addEventListener('click', () => {
  cookieBanner && cookieBanner.classList.remove('visible');
});

initCookieBanner();

/* --- Copy-to-Clipboard --- */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const block = btn.closest('.code-block');
    const code = block?.querySelector('code')?.textContent || '';
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    } catch (_) {
      btn.textContent = 'Failed';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    }
  });
});

/* --- Toast Notification --- */
let toastTimer;
function showToast(msg, type = 'default') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✓' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span> ${escapeHtml(msg)}`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* --- Ripple Effect --- */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* --- Scroll Animations (Intersection Observer) --- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* --- Counter Animation --- */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1500;
  const step = target / (duration / 16);
  let current = 0;
  const tick = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString() + (el.getAttribute('data-suffix') || '');
    if (current < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

/* --- UTM Tracking on Outbound Links --- */
function addUtmToLink(url) {
  try {
    const u = new URL(url, window.location.href);
    if (u.hostname === window.location.hostname) return url;
    u.searchParams.set('utm_source', 'qawwamempire');
    u.searchParams.set('utm_medium', 'referral');
    u.searchParams.set('utm_campaign', 'outbound');
    return u.toString();
  } catch (_) { return url; }
}

document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href) return;
  try {
    const u = new URL(href, window.location.href);
    if (u.hostname && u.hostname !== window.location.hostname && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      link.addEventListener('click', function() {
        this.setAttribute('href', addUtmToLink(this.getAttribute('href')));
      });
    }
  } catch (_) {}
});

/* --- Last Updated Timestamps --- */
document.querySelectorAll('[data-updated]').forEach(el => {
  const ts = el.getAttribute('data-updated');
  if (!ts) return;
  const d = new Date(ts);
  if (isNaN(d)) return;
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  let rel;
  if (diff < 60) rel = 'just now';
  else if (diff < 3600) rel = `${Math.floor(diff/60)}m ago`;
  else if (diff < 86400) rel = `${Math.floor(diff/3600)}h ago`;
  else if (diff < 2592000) rel = `${Math.floor(diff/86400)}d ago`;
  else rel = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  el.textContent = `Updated ${rel}`;
  el.setAttribute('title', d.toLocaleString());
});

/* --- Active Nav Link --- */
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a, .mobile-nav-panel a').forEach(link => {
  const linkPath = new URL(link.href, window.location.href).pathname;
  if (linkPath === currentPath) link.setAttribute('aria-current', 'page');
});
