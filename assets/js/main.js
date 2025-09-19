// Enhanced, dependency-free JS (menus + lightbox + toast + year + form)
(function () {
  /* ---------- Year ---------- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Contact form (fake send) ---------- */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.textContent = 'Sending…';
      setTimeout(function () {
        if (status) status.textContent = "Thanks! We'll get back within 1 business day.";
        form.reset();
      }, 700);
    });
  }

  /* ---------- Navigation / Menus ---------- */
  const menu = document.getElementById('primary-menu');
  const toggle = document.querySelector('.nav-toggle');
  const submenuParent = document.querySelector('.has-submenu');
  const submenuLink = submenuParent ? submenuParent.querySelector('.menu-link') : null;
  const submenu = submenuParent ? submenuParent.querySelector('.submenu') : null;
  const mqMobile = window.matchMedia('(max-width: 900px)');
  const isMobile = () => mqMobile.matches;

  function openMenu() {
    if (!menu) return;
    menu.classList.add('open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    closeSubmenu(true);
  }
  function toggleMenu() {
    if (!menu) return;
    menu.classList.contains('open') ? closeMenu() : openMenu();
  }

  toggle && toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (!isMobile() || !menu || !menu.classList.contains('open')) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  // Close on Esc (mobile)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile()) closeMenu();
  });

  // Close mobile menu on link click (except Services top link)
  menu && menu.addEventListener('click', (e) => {
    if (!isMobile()) return;
    const a = e.target.closest('a');
    if (!a) return;
    const isTopServicesLink = submenuParent && a === submenuLink;
    if (!isTopServicesLink) closeMenu();
  });

  // Submenu controls
  function openSubmenu() {
    if (!submenuParent || !submenu) return;
    submenuParent.classList.add('open');
    submenuLink && submenuLink.setAttribute('aria-expanded', 'true');
    if (!isMobile()) submenu.style.display = 'block';
  }
  function closeSubmenu(force) {
    if (!submenuParent || !submenu) return;
    submenuParent.classList.remove('open');
    submenuLink && submenuLink.setAttribute('aria-expanded', 'false');
    if (force || (!submenuParent.matches(':hover') && !submenu.matches(':hover'))) {
      submenu.style.display = '';
    }
  }

  // Mobile: tap Services toggles inline submenu
  submenuLink && submenuLink.addEventListener('click', (e) => {
    if (!isMobile()) return;
    e.preventDefault();
    e.stopPropagation();
    submenuParent.classList.contains('open') ? closeSubmenu(true) : openSubmenu();
  });

  // Desktop hover with tiny delay (prevents flicker)
  let hideTimer;
  if (submenuParent && submenu) {
    const enter = () => { if (!isMobile()) { clearTimeout(hideTimer); openSubmenu(); } };
    const leave = () => { if (!isMobile()) { hideTimer = setTimeout(() => closeSubmenu(false), 120); } };
    submenuParent.addEventListener('mouseenter', enter);
    submenuParent.addEventListener('mouseleave', leave);
    submenu.addEventListener('mouseenter', enter);
    submenu.addEventListener('mouseleave', leave);

    // Keyboard support
    menu && menu.addEventListener('focusin', (e) => {
      if (submenuParent.contains(e.target)) openSubmenu();
    });
    menu && menu.addEventListener('focusout', (e) => {
      if (!menu.contains(e.relatedTarget)) closeSubmenu(true);
    });
  }

  // Reset when resizing to desktop
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      document.body.style.overflow = '';
      closeMenu();
      closeSubmenu(true);
    }
  });

  /* ---------- Lightbox for team photos ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCap = document.getElementById('lightbox-caption');
  const lbClose = lb ? lb.querySelector('.lightbox-close') : null;

  function openLightbox(src, alt, caption) {
    if (!lb) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbCap.textContent = caption || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
    lbImg.alt = '';
    lbCap.textContent = '';
  }

  // open on avatar click
  document.querySelectorAll('.open-lightbox').forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      if (!img) return;
      // use full-size (strip cache-bust for safety)
      const src = img.src.replace(/\?.*$/,'');
      const card = btn.closest('.team-card');
      const name = card ? card.querySelector('.person-name')?.textContent?.trim() : '';
      const role = card ? card.querySelector('.role')?.textContent?.trim() : '';
      openLightbox(src, name, [name, role].filter(Boolean).join(' • '));
    });
  });

  // close handlers
  lb && lb.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox-backdrop') || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb?.classList.contains('open')) closeLightbox();
  });

  /* ---------- Fun: double-tap Adarsh toast ---------- */
  // shows a quick greeting when the co-founder photo is double-clicked/tapped
  const adarshBtn = document.querySelector('.open-lightbox[data-person="adarsh"]');
  if (adarshBtn) {
    let tapTimer = null, lastTap = 0;
    const showToast = (msg) => {
      const t = document.createElement('div');
      t.textContent = msg;
      Object.assign(t.style, {
        position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)',
        background: '#111', color: '#fff', padding: '10px 14px', borderRadius: '12px',
        boxShadow: '0 10px 24px rgba(0,0,0,.25)', zIndex: 1400, fontWeight: 700
      });
      document.body.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 1400);
      setTimeout(() => t.remove(), 1750);
    };
    const onDouble = () => showToast('Hey, welcome to manki.ai 👋');

    adarshBtn.addEventListener('dblclick', onDouble);

    adarshBtn.addEventListener('touchend', () => {
      const now = Date.now();
      if (now - lastTap < 350) { // double tap
        onDouble();
        lastTap = 0;
        clearTimeout(tapTimer);
      } else {
        lastTap = now;
        tapTimer = setTimeout(() => { lastTap = 0; }, 380);
      }
    }, { passive: true });
  }
})();
