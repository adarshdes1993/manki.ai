// Enhanced, dependency-free JS (menus + year + form + slider + lightbox + dynamic nav height)
(function () {
  /* ---------- Dynamic nav height -> --nav-h ---------- */
  function setNavHeightVar() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const h = nav.offsetHeight;
    document.documentElement.style.setProperty('--nav-h', h + 'px');
  }
  window.addEventListener('load', setNavHeightVar);
  window.addEventListener('resize', setNavHeightVar);
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', setNavHeightVar);
  }

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

  // Close on Esc (mobile) + lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isMobile()) closeMenu();
      closeLightbox();
    }
  });

  // Close mobile menu when clicking any link inside (except the top Services toggle link)
  menu && menu.addEventListener('click', (e) => {
    if (!isMobile()) return;
    const a = e.target.closest('a,button');
    if (!a) return;
    const isTopServicesLink = submenuParent && a === submenuLink;
    if (!isTopServicesLink) closeMenu();
  });

  // Submenu controls
  function openSubmenu() {
    if (!submenuParent || !submenu) return;
    submenuParent.classList.add('open');
    submenuLink && submenuLink.setAttribute('aria-expanded', 'true');
    if (!isMobile()) submenu.style.display = 'block'; // reinforce desktop hover
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
    if (!isMobile()) return; // desktop: allow normal nav
    e.preventDefault();
    e.stopPropagation();
    submenuParent.classList.contains('open') ? closeSubmenu(true) : openSubmenu();
  });

  // Desktop: anti-flicker hover
  let hideTimer;
  if (submenuParent && submenu) {
    const enter = () => { if (!isMobile()) { clearTimeout(hideTimer); openSubmenu(); } };
    const leave = () => { if (!isMobile()) { hideTimer = setTimeout(() => closeSubmenu(false), 120); } };
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

  // Safety: reset state when resizing to desktop and recalc nav height
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      document.body.style.overflow = '';
      closeMenu();
      closeSubmenu(true);
    }
    setNavHeightVar();
  });

  /* ---------- Work slider ---------- */
  const track = document.querySelector('.work-track');
  const slides = Array.from(document.querySelectorAll('.work-slide'));
  const prevBtn = document.querySelector('.work-prev');
  const nextBtn = document.querySelector('.work-next');
  const dotsWrap = document.querySelector('.work-dots');

  let index = 0;
  let autoTimer = null;

  function renderDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === index) b.classList.add('active');
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });
  }

  function getSlideWidth() {
    const first = slides[0];
    return first ? first.getBoundingClientRect().width : 0;
  }

  function applyTrackTransform() {
    if (!track) return;
    const slideWidth = getSlideWidth();
    track.style.transform = `translateX(${-(slideWidth * index)}px)`;
  }

  function goTo(i, opts) {
    if (!track || slides.length === 0) return;
    index = (i + slides.length) % slides.length;
    applyTrackTransform();
    if (dotsWrap) {
      dotsWrap.querySelectorAll('button').forEach((d, di) => {
        d.classList.toggle('active', di === index);
      });
    }
    if (!opts || !opts.skipAuto) restartAuto();
  }

  function prev(){ goTo(index - 1); }
  function next(){ goTo(index + 1); }

  function startAuto() {
    if (autoTimer || slides.length <= 1) return;
    autoTimer = setInterval(next, 5000);
  }
  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  function restartAuto() { stopAuto(); startAuto(); }

  if (track && slides.length > 0) {
    renderDots();
    goTo(0, { skipAuto: true });
    startAuto();

    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    window.addEventListener('resize', () => {
      applyTrackTransform();
    });

    // simple swipe
    let sx = 0, dx = 0;
    track.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; dx = 0; }, {passive:true});
    track.addEventListener('touchmove', (e) => { dx = e.touches[0].clientX - sx; }, {passive:true});
    track.addEventListener('touchend', () => {
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      dx = 0;
    });
  }

  /* ---------- Lightbox (click avatars) ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose = document.querySelector('.lightbox-close');
  const lbBackdrop = document.querySelector('.lightbox-backdrop');
  let currentPerson = null;
  let tapTimer = null; // for double-tap on mobile

  function openLightbox(src, alt, caption, person) {
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    if (lbCaption) lbCaption.textContent = caption || '';
    currentPerson = person || null;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    currentPerson = null;
    const bubble = lightbox.querySelector('.speech');
    if (bubble) bubble.remove();
  }

  function showSpeech(text) {
    const host = document.querySelector('.lightbox-content');
    if (!host) return;
    let bubble = host.querySelector('.speech');
    if (bubble) bubble.remove();
    bubble = document.createElement('div');
    bubble.className = 'speech';
    bubble.textContent = text;
    host.appendChild(bubble);
    setTimeout(() => { bubble && bubble.remove(); }, 2500);
  }

  function handleAvatarOpen(btn) {
    const img = btn.querySelector('img');
    const person = btn.dataset.person || null;
    const says = btn.dataset.says || null;
    if (!img) return;
    const card = btn.closest('.team-inner');
    const nameEl = card ? card.querySelector('.person-name') : null;
    const roleEl = card ? card.querySelector('.role') : null;
    const caption = [nameEl?.textContent || '', roleEl ? ` – ${roleEl.textContent}` : ''].join('');
    openLightbox(img.src, img.alt, caption, person);

    lbImg.ondblclick = () => {
      if (currentPerson === 'adarsh') showSpeech(says || 'Hey, welcome to manki.ai!');
    };

    lbImg.ontouchstart = () => {
      if (tapTimer) {
        clearTimeout(tapTimer);
        tapTimer = null;
        if (currentPerson === 'adarsh') showSpeech(says || 'Hey, welcome to manki.ai!');
      } else {
        tapTimer = setTimeout(() => { tapTimer = null; }, 300);
      }
    };
  }

  document.querySelectorAll('.open-lightbox').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleAvatarOpen(btn);
    });
  });

  lbClose && lbClose.addEventListener('click', closeLightbox);
  lbBackdrop && lbBackdrop.addEventListener('click', closeLightbox);
})();
