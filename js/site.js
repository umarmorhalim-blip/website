(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (btn && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    };
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 881px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
  }

  // Mark the current page in the nav
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  // Entrance
  var items = document.querySelectorAll('.rise');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Enquiry form → Web3Forms
  var form = document.getElementById('enquiry');
  if (!form) return;
  var submit = form.querySelector('[type="submit"]');
  var submitLabel = submit.firstChild.textContent;
  var ok = document.getElementById('form-ok');
  var fail = document.getElementById('form-fail');

  function validate() {
    var first = null;
    form.querySelectorAll('[required]').forEach(function (f) {
      var bad = !f.checkValidity();
      f.setAttribute('aria-invalid', String(bad));
      var msg = document.getElementById(f.id + '-err');
      if (msg) msg.textContent = bad ? (f.type === 'email' && f.value ? 'Enter a valid email address.' : 'This field is required.') : '';
      if (bad && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
      e.target.setAttribute('aria-invalid', 'false');
      var msg = document.getElementById(e.target.id + '-err');
      if (msg) msg.textContent = '';
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    submit.disabled = true;
    submit.firstChild.textContent = 'Sending… ';
    fail.hidden = true;

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (!json.success) throw new Error(json.message);
        form.querySelectorAll('.field, .form-foot, .form-req').forEach(function (el) { el.hidden = true; });
        ok.hidden = false;
        ok.focus();
        form.reset();
      })
      .catch(function () {
        fail.hidden = false;
        submit.disabled = false;
        submit.firstChild.textContent = submitLabel;
      });
  });
})();
