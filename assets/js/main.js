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

  /* ---------- Services detail panel ---------- */
  const serviceContent = {
    'web-apps': {
      title: 'Web Apps',
      description: 'Responsive, accessible web apps that stay fast as you scale to thousands of users.',
      highlights: [
        'Workshop requirements into well-defined user stories',
        'Design systems and component libraries that match your brand',
        'CI/CD pipelines with linting, tests, and preview deploys'
      ],
      stack: 'Stack: React, Next.js, TypeScript, Python, FastAPI',
      outcome: 'Outcome: Launch-ready platform with analytics, auth, and payments built in.'
    },
    'mobile-apps': {
      title: 'Mobile Apps',
      description: 'Native-quality iOS & Android apps with smooth onboarding and offline support.',
      highlights: [
        'Product flows mapped from onboarding to retention',
        'Pixel-perfect UI built with Flutter or React Native',
        'App Store / Play Store launch support and telemetry setup'
      ],
      stack: 'Stack: Flutter, React Native, Swift, Kotlin, Firebase',
      outcome: 'Outcome: Shippable mobile builds with crash-free releases and strong reviews.'
    },
    'apis': {
      title: 'APIs & Integrations',
      description: 'High-availability APIs that plug into the tooling your business already relies on.',
      highlights: [
        'Domain-driven API design with clear versioning strategy',
        'Secure auth (OAuth2, JWT, SSO) and rate limiting baked in',
        'Automated tests plus observability dashboards from day one'
      ],
      stack: 'Stack: Node.js, Python, Go, GraphQL, REST, Postgres',
      outcome: 'Outcome: Reliable services partners can integrate without support tickets.'
    },
    'data-ai': {
      title: 'Data & AI',
      description: 'Practical analytics and AI features that help teams act on their data—not just collect it.',
      highlights: [
        'ETL pipelines with quality gates and schema observability',
        'Dashboards and alerts tailored to stakeholder KPIs',
        'LLM features scoped for safety, latency, and measurable ROI'
      ],
      stack: 'Stack: dbt, Snowflake, BigQuery, LangChain, OpenAI, Hugging Face',
      outcome: 'Outcome: Trusted metrics and AI copilots your users return to daily.'
    },
    'devops': {
      title: 'DevOps',
      description: 'Infrastructure as code with automated delivery, monitoring, and sensible cloud costs.',
      highlights: [
        'CI/CD pipelines with preview environments and quality gates',
        'Containerization, orchestration, and secrets management',
        'Production monitoring, on-call playbooks, and cost dashboards'
      ],
      stack: 'Stack: AWS, GCP, Azure, Terraform, Docker, Kubernetes',
      outcome: 'Outcome: Predictable releases with uptime SLAs you can share with customers.'
    },
    'consulting': {
      title: 'Consulting',
      description: 'Seasoned engineering leadership to align roadmap, architecture, and teams.',
      highlights: [
        'Architecture and codebase audits with prioritized fixes',
        'Hiring plans, mentoring, and org design for in-house teams',
        'Product roadmapping grounded in data and delivery constraints'
      ],
      stack: 'Scope: Fractional CTO, product strategy, technical due diligence',
      outcome: 'Outcome: Clear execution plan with measurable milestones and risk mitigation.'
    }
  };

  const serviceDetail = document.getElementById('service-detail');
  const serviceTitle = document.getElementById('service-detail-title');
  const serviceDescription = document.getElementById('service-detail-description');
  const serviceHighlights = document.getElementById('service-detail-highlights');
  const serviceStack = document.getElementById('service-detail-stack');
  const serviceOutcome = document.getElementById('service-detail-outcome');
  const serviceTabsWrap = document.querySelector('.services-tabs');
  const serviceTabs = Array.from(document.querySelectorAll('.service-tab'));
  const serviceMenuItems = Array.from(document.querySelectorAll('.submenu-item[data-service]'));
  const servicesSection = document.getElementById('services');

  let currentService = 'web-apps';

  function renderService(key) {
    const data = serviceContent[key] || serviceContent[currentService] || serviceContent['web-apps'];
    if (!data || !serviceDetail) return;

    currentService = key;
    if (serviceTitle) serviceTitle.textContent = data.title;
    if (serviceDescription) serviceDescription.textContent = data.description;

    if (serviceHighlights) {
      serviceHighlights.innerHTML = '';
      data.highlights.forEach((point) => {
        const li = document.createElement('li');
        li.textContent = point;
        serviceHighlights.appendChild(li);
      });
    }

    if (serviceStack) serviceStack.textContent = data.stack;
    if (serviceOutcome) serviceOutcome.textContent = data.outcome;

    let activeTabEl = null;
    serviceTabs.forEach((tab) => {
      const isActive = tab.dataset.service === key;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) activeTabEl = tab;
    });

    serviceMenuItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.service === key);
    });

    if (activeTabEl && serviceTabsWrap) {
      alignServiceTab(activeTabEl);
    }
  }

  function alignServiceTab(tab) {
    if (!tab || !serviceTabsWrap) return;
    if (window.innerWidth > 900) return;

    requestAnimationFrame(() => {
      const wrapWidth = serviceTabsWrap.clientWidth;
      const tabCenter = tab.offsetLeft + tab.offsetWidth / 2;
      const maxScroll = Math.max(0, serviceTabsWrap.scrollWidth - wrapWidth);
      const targetScroll = Math.min(maxScroll, Math.max(0, tabCenter - wrapWidth / 2));
      serviceTabsWrap.scrollTo({ left: targetScroll, behavior: 'smooth' });
    });
  }

  function focusService(key, options) {
    renderService(key);

    if (options?.scroll && servicesSection) {
      const scrollBehavior = options.behavior || 'smooth';
      const delay = options.delay || 0;
      const performScroll = () => {
        const rect = servicesSection.getBoundingClientRect();
        const navVar = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
        ) || 96;
        const additionalOffset = window.innerWidth <= 560 ? 24 : 12;
        const offset = rect.top + window.scrollY - navVar - additionalOffset;
        window.scrollTo({ top: Math.max(0, offset), behavior: scrollBehavior });
      };

      if (delay > 0) {
        setTimeout(performScroll, delay);
      } else {
        performScroll();
      }
    }
  }

  if (serviceDetail) {
    renderService(currentService);

    serviceTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const shouldScroll = window.innerWidth <= 900;
        focusService(tab.dataset.service, { scroll: shouldScroll });
      });
    });

    serviceMenuItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const key = item.dataset.service;
        closeMenu();
        focusService(key, { scroll: true, delay: 160 });
      });
    });
  }

  /* ---------- Sliders (work, testimonials) ---------- */
  function initSlider({
    root,
    trackSelector,
    slideSelector,
    prevSelector,
    nextSelector,
    dotsSelector,
    autoInterval = 0
  }) {
    if (!root) return;

    const track = root.querySelector(trackSelector);
    const slides = Array.from(root.querySelectorAll(slideSelector));
    const prevBtn = prevSelector ? root.querySelector(prevSelector) : null;
    const nextBtn = nextSelector ? root.querySelector(nextSelector) : null;
    const dotsWrap = dotsSelector ? root.querySelector(dotsSelector) : null;

    if (!track || slides.length === 0) return;

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
      const slideWidth = getSlideWidth();
      track.style.transform = `translateX(${-(slideWidth * index)}px)`;
    }

    function goTo(i, opts) {
      index = (i + slides.length) % slides.length;
      applyTrackTransform();
      if (dotsWrap) {
        dotsWrap.querySelectorAll('button').forEach((d, di) => {
          d.classList.toggle('active', di === index);
        });
      }
      if (autoInterval && (!opts || !opts.skipAuto)) restartAuto();
    }

    function prev(){ goTo(index - 1); }
    function next(){ goTo(index + 1); }

    function startAuto() {
      if (!autoInterval || autoTimer || slides.length <= 1) return;
      autoTimer = setInterval(next, autoInterval);
    }
    function stopAuto() {
      if (!autoTimer) return;
      clearInterval(autoTimer);
      autoTimer = null;
    }
    function restartAuto() { stopAuto(); startAuto(); }

    renderDots();
    goTo(0, { skipAuto: true });
    startAuto();

    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);

    if (autoInterval) {
      root.addEventListener('mouseenter', stopAuto);
      root.addEventListener('mouseleave', startAuto);
      root.addEventListener('focusin', stopAuto);
      root.addEventListener('focusout', (e) => {
        if (!root.contains(e.relatedTarget)) startAuto();
      });
    }

    window.addEventListener('resize', applyTrackTransform);

    // simple swipe
    let sx = 0, dx = 0;
    track.addEventListener('touchstart', (e) => {
      sx = e.touches[0].clientX; dx = 0;
      if (autoInterval) stopAuto();
    }, {passive:true});
    track.addEventListener('touchmove', (e) => { dx = e.touches[0].clientX - sx; }, {passive:true});
    track.addEventListener('touchend', () => {
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      dx = 0;
      if (autoInterval) startAuto();
    });
  }

  initSlider({
    root: document.querySelector('.work-slider'),
    trackSelector: '.work-track',
    slideSelector: '.work-slide',
    prevSelector: '.work-prev',
    nextSelector: '.work-next',
    dotsSelector: '.work-dots',
    autoInterval: 5000
  });

  initSlider({
    root: document.querySelector('.testimonials-slider'),
    trackSelector: '.testimonials-track',
    slideSelector: '.testimonial-slide',
    prevSelector: '.testimonials-prev',
    nextSelector: '.testimonials-next',
    dotsSelector: '.testimonials-dots',
    autoInterval: 7000
  });

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
