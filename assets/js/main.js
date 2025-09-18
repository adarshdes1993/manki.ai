// Enhanced, dependency-free JS (menus + year + form)
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

  function isMobile() { return mqMobile.matches; }

  // Main menu controls
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

    // For desktop hover-bridge: force show even if :hover temporarily lost
    if (!isMobile()) submenu.style.display = 'block';
  }
  function closeSubmenu(force) {
    if (!submenuParent || !submenu) return;
    submenuParent.classList.remove('open');
    submenuLink && submenuLink.setAttribute('aria-expanded', 'false');

    // Only clear inline display when we’re not actively hovering OR when forced
    if (force || !submenuParent.matches(':hover') && !submenu.matches(':hover')) {
      submenu.style.display = '';
    }
  }

  // Mobile: tap “Services” toggles the submenu inline
  submenuLink && submenuLink.addEventListener('click', (e) => {
    if (!isMobile()) return;            // desktop: let link navigate if desired
    e.preventDefault();
    e.stopPropagation();
    if (submenuParent.classList.contains('open')) {
      closeSubmenu(true);
    } else {
      openSubmenu();
    }
  });

  // Desktop: keep submenu open while hovering link or panel (tiny delay to prevent flicker)
  let hideTimer;
  if (submenuParent && submenu) {
    const enter = () => {
      if (isMobile()) return;
      clearTimeout(hideTimer);
      openSubmenu();
    };
    const leave = () => {
      if (isMobile()) return;
      hideTimer = setTimeout(() => closeSubmenu(false), 120);
    };
    submenuParent.addEventListener('mouseenter', enter);
    submenuParent.addEventListener('mouseleave', leave);
    submenu.addEventListener('mouseenter', enter);
    submenu.addEventListener('mouseleave', leave);

    // Keyboard focus support
    menu && menu.addEventListener('focusin', (e) => {
      if (submenuParent.contains(e.target)) openSubmenu();
    });
    menu && menu.addEventListener('focusout', (e) => {
      // close only if focus leaves the whole menu
      if (!menu.contains(e.relatedTarget)) closeSubmenu(true);
    });
  }

  // Safety: reset state when resizing to desktop
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      document.body.style.overflow = '';
      closeMenu();
      closeSubmenu(true);
    }
  });
})();
