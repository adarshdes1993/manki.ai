// Menus + year + form + lightbox + playful double-tap on Adarsh
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
  function toggleMenu() { menu && (menu.classList.contains('open') ? closeMenu() : openMenu()); }

  toggle && toggle.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });

  // Close on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (!isMobile() || !menu || !menu.classList.contains('open')) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  // Close on Esc (mobile)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile()) closeMenu();
  });

  // Close mobile menu when clicking any link inside (except the top Services toggle link)
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
    if (!isMobile()) submenu.style.display = 'block'; // hover bridge support
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
    if (!isMobile()) return;            // desktop: allow navigation
    e.preventDefault();
    e.stopPropagation();
    submenuParent.classList.contains('open') ? closeSubmenu(true) : openSubmenu();
  });

  // Desktop: keep submenu open while hovering link or panel (with tiny delay)
  let hideTimer;
  if (submenuParent && submenu) {
    const enter = () => { if (!isMobile()) { clearTimeout(hideTimer); openSubmenu(); } };
    const leave = () => { if (!isMobile()) hideTimer = setTimeout(() => closeSubmenu(false), 120); };
    submenuParent.addEventListener('mouseenter', enter);
    submenuParent.addEventListener('mouseleave', leave);
    submenu.addEventListener('mouseenter', enter);
    submenu.addEventListener('mouseleave', leave);

    // Keyboard focus support
    menu && menu.addEventListener('focusin', (e) => { if (submenuParent.contains(e.target)) openSubmenu(); });
    menu && menu.addEventListener('focusout', (e) => { if (!menu.contains(e.relatedTarget)) closeSubmenu(true); });
  }

  // Safety: reset state when resizing to desktop
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      document.body.style.overflow = '';
      closeMenu();
      closeSubmenu(true);
    }
  });

  /* ---------- Lightbox for team photos ---------- */
  const grid = document.querySelector('.team-grid');
  if (grid) {
    // Build overlay once
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML = `
      <div class="lb-inner" role="dialog" aria-modal="true" aria-label="Team photo viewer">
        <button class="lb-close" type="button" aria-label="Close">Close ✕</button>
        <div class="lb-img-wrap"><img alt=""></div>
        <div class="lb-caption">
          <div>
            <div class="lb-title"></div>
            <div class="lb-role"></div>
          </div>
        </div>
        <div class="lb-toast" aria-live="polite">Hey, welcome to manki.ai 👋</div>
      </div>`;
    document.body.appendChild(lb);
    const lbImg   = lb.querySelector('.lb-img-wrap img');
    const lbClose = lb.querySelector('.lb-close');
    const lbTitle = lb.querySelector('.lb-title');
    const lbRole  = lb.querySelector('.lb-role');
    const lbToast = lb.querySelector('.lb-toast');

    function openLB(src, title, role) {
      lbImg.src = src;
      lbTitle.textContent = title || '';
      lbRole.textContent = role || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLB() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.src = '';
      lbToast.classList.remove('show');
    }

    // Click handlers
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.lightbox-trigger');
      if (!btn) return;
      const img = btn.querySelector('img');
      const card = btn.closest('.team-card');
      const name = card.querySelector('.person-name')?.textContent ?? '';
      const role = card.querySelector('.role')?.textContent ?? '';
      // Use the same src (already reasonably sized); could swap to a -full if you add one later
      openLB(img.currentSrc || img.src, name, role);
    });

    // Double-click (or double-tap) Easter egg on Adarsh
    let lastTap = 0;
    grid.addEventListener('dblclick', (e) => {
      const btn = e.target.closest('.lightbox-trigger[data-member="adarsh"]');
      if (!btn || !lb.classList.contains('open')) return;
      lbToast.classList.add('show');
      setTimeout(() => lbToast.classList.remove('show'), 1600);
    });
    grid.addEventListener('click', (e) => {
      const now = Date.now();
      const btn = e.target.closest('.lightbox-trigger[data-member="adarsh"]');
      if (!btn || !lb.classList.contains('open')) return;
      if (now - lastTap < 350) { // double tap
        lbToast.classList.add('show');
        setTimeout(() => lbToast.classList.remove('show'), 1600);
      }
      lastTap = now;
    });

    // Close controls
    lbClose.addEventListener('click', closeLB);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('open')) closeLB(); });
  }
})();
