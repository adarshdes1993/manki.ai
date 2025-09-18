// Enhanced, dependency-free JS (menus + year + form + lightbox + “talk”)
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

  // Main menu controls
  function openMenu() {
    if (!menu) return;
    menu.classList.add('open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
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

  // Close mobile menu when clicking any link inside (except top Services toggle)
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
    if (!isMobile()) submenu.style.display = 'block'; // desktop anti-flicker
  }
  function closeSubmenu(force) {
    if (!submenuParent || !submenu) return;
    submenuParent.classList.remove('open');
    submenuLink && submenuLink.setAttribute('aria-expanded', 'false');
    if (force || (!submenuParent.matches(':hover') && !submenu.matches(':hover'))) {
      submenu.style.display = '';
    }
  }

  // Mobile: tap “Services” toggles the submenu inline
  submenuLink && submenuLink.addEventListener('click', (e) => {
    if (!isMobile()) return;          // desktop: let hover/keyboard handle
    e.preventDefault();
    e.stopPropagation();
    submenuParent.classList.contains('open') ? closeSubmenu(true) : openSubmenu();
  });

  // Desktop: keep submenu open while hovering link or panel (w/ small delay)
  let hideTimer;
  if (submenuParent && submenu) {
    const enter = () => { if (!isMobile()) { clearTimeout(hideTimer); openSubmenu(); } };
    const leave = () => { if (!isMobile()) hideTimer = setTimeout(() => closeSubmenu(false), 120); };
    submenuParent.addEventListener('mouseenter', enter);
    submenuParent.addEventListener('mouseleave', leave);
    submenu.addEventListener('mouseenter', enter);
    submenu.addEventListener('mouseleave', leave);

    // Keyboard focus support
    menu && menu.addEventListener('focusin', (e) => {
      if (submenuParent.contains(e.target)) openSubmenu();
    });
    menu && menu.addEventListener('focusout', (e) => {
      if (!menu.contains(e.relatedTarget)) closeSubmenu(true);
    });
  }

  // Reset state when resizing to desktop
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      closeMenu();
      closeSubmenu(true);
    }
  });

  /* ---------- Lightbox (team images) + “talk” on Adarsh ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb ? lb.querySelector('.lightbox-img') : null;
  const lbCaption = lb ? lb.querySelector('#lightbox-caption') : null;
  const lbClose = lb ? lb.querySelector('.lightbox-close') : null;

  const lbSpeech = lb ? lb.querySelector('#lightbox-speech') : null;
  const lbSpeechText = lbSpeech ? lbSpeech.querySelector('.text') : null;

  let currentSays = '';
  let speechTimer = null;
  let lastTouchTime = 0;

  function showSpeech(message) {
    if (!lbSpeech || !lbSpeechText) return;
    lbSpeech.classList.add('show');
    lbSpeech.classList.remove('ready');
    lbSpeechText.textContent = '';
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => {
      lbSpeechText.textContent = message || 'Hey, welcome to manki.ai!';
      lbSpeech.classList.add('ready');
    }, 700); // brief “thinking…” delay
  }
  function hideSpeech() {
    if (!lbSpeech) return;
    lbSpeech.classList.remove('show', 'ready');
    if (lbSpeechText) lbSpeechText.textContent = '';
    clearTimeout(speechTimer);
  }

  function openLightbox(src, alt, caption, says) {
    if (!lb || !lbImg) return;
    hideSpeech();
    currentSays = says || '';
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbCaption && (lbCaption.textContent = caption || alt || '');
    lb.classList.add('open');
    document.body.classList.add('lb-open');
    lb.setAttribute('aria-hidden', 'false');
    lbClose && lbClose.focus();
  }
  function closeLightbox() {
    if (!lb || !lbImg) return;
    hideSpeech();
    lb.classList.remove('open');
    document.body.classList.remove('lb-open');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    lbImg.alt = '';
    currentSays = '';
  }

  // Open on click of any .lightboxable
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.lightboxable');
    if (!img) return;
    const full = img.getAttribute('data-full') || img.src;
    const alt = img.getAttribute('alt') || '';
    const caption = img.getAttribute('data-caption') || '';
    const says = img.getAttribute('data-says') || '';
    openLightbox(full, alt, caption, says);
  });

  // Close interactions
  lbClose && lbClose.addEventListener('click', closeLightbox);
  lb && lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox(); // backdrop click
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb && lb.classList.contains('open')) closeLightbox();
  });

  // “Talk” interactions (inside lightbox)
  lbImg && lbImg.addEventListener('dblclick', (e) => {
    e.preventDefault();
    showSpeech(currentSays || 'Hey, welcome to manki.ai!');
  });
  lbImg && lbImg.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchTime < 300) {
      e.preventDefault();
      showSpeech(currentSays || 'Hey, welcome to manki.ai!');
    }
    lastTouchTime = now;
  });
})();
