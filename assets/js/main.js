/* ==========================================================================
   MAIN.JS — ByteX website behaviour
   ----------------------------------------------------------------------------
   Page content lives in index.html. Colors and styles live in
   assets/css/bytex.css. This file only controls how things BEHAVE.

   Libraries used (loaded before this file in index.html):
   - GSAP + ScrollTrigger + ScrollSmoother + ScrollToPlugin
     (assets/vendor/gsap/): smooth scrolling and scroll animations.
   - Swiper (assets/vendor/swiper/): the two sliders.

   Each feature has its own init...() function. They are all started at the
   bottom of this file, in the "STARTUP" block.

   IMPORTANT — this is a FRONTEND-ONLY website. Nothing here sends emails,
   saves subscriptions or stores personal information. See initNewsletter().
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     EDITABLE SETTINGS
     Timings are in seconds.
     ------------------------------------------------------------------------ */
  const SETTINGS = {
    defaultTheme: 'dark',            // 'dark' or 'light' for first-time visitors
    themeStorageKey: 'bytex-theme',  // remembers ONLY the theme choice
    smoothScrollStrength: 2,         // desktop smooth-scroll amount
    sectionScrollSeconds: 0.4,       // duration for links such as #about
    backToTopSeconds: 0.55,          // duration for the back-to-top button

    // Newsletter: ByteX has no mailing-list service yet. The form offers an
    // email draft to this address instead (see initNewsletter()).
    contactEmail: 'bytex.my@gmail.com',
    newsletterDraftSubject: 'Please keep me updated about ByteX'
  };


  /* ------------------------------------------------------------------------
     SMALL HELPERS
     select()    finds ONE element (or null).
     selectAll() finds ALL matching elements as a normal array.
     ------------------------------------------------------------------------ */
  const select = (selector, parent = document) => parent.querySelector(selector);
  const selectAll = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  // Shared page references. The class names must match index.html.
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const menu = select('.hamenu');                 // full-screen / mobile menu
  const menuButton = select('.navbar-menu-btn');  // "three lines" button
  const themeButton = select('.theme-icon');      // moon / sun button
  let smoother = null;                            // set by initScrollEffects()


  /* ------------------------------------------------------------------------
     THEME (dark / light)
     Trigger: clicking the moon/sun button in the header.
     Adds or removes the "light" class on <body>; the CSS does the rest.
     Only the word "dark" or "light" is saved in the browser — no personal data.
     ------------------------------------------------------------------------ */
  const themePreference = {
    get() {
      try {
        return localStorage.getItem(SETTINGS.themeStorageKey);
      } catch {
        return null; // Some private/restricted browsers block storage.
      }
    },
    set(value) {
      try {
        localStorage.setItem(SETTINGS.themeStorageKey, value);
      } catch {
        // The theme still changes; it just will not be remembered.
      }
    }
  };

  function applyTheme(theme) {
    const isLight = theme === 'light';
    body.classList.toggle('light', isLight);

    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(isLight));
      themeButton.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    }

    // Some sections change height between themes; re-measure animations.
    if (ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  function initTheme() {
    applyTheme(themePreference.get() || SETTINGS.defaultTheme);

    themeButton?.addEventListener('click', () => {
      const nextTheme = body.classList.contains('light') ? 'dark' : 'light';
      applyTheme(nextTheme);
      themePreference.set(nextTheme);
    });
  }


  /* ------------------------------------------------------------------------
     SCROLL EFFECTS
     - Smooth scrolling on desktop (ScrollSmoother).
     - Solutions row (.hr-container): on wide screens, scrolling down moves
       the cards sideways. Works with any number of .item-panel cards.
     Both are skipped when the visitor prefers reduced motion.
     ------------------------------------------------------------------------ */
  function initScrollEffects() {
    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin);

    if (!reducedMotion && window.ScrollSmoother) {
      gsap.registerPlugin(window.ScrollSmoother);
      smoother = window.ScrollSmoother.create({
        smooth: SETTINGS.smoothScrollStrength,
        effects: true
      });
    }

    // matchMedia removes the pin automatically when the screen gets narrow.
    gsap.matchMedia().add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => {
      const container = select('.hr-container');
      if (!container) return;

      const panels = selectAll('.item-panel', container);
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 2),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'center center',
          pin: true,
          scrub: 1,
          end: () => `+=${container.offsetWidth}`
        }
      });
    });
  }


  /* ------------------------------------------------------------------------
     NEWSLETTER FORM (footer) — FRONTEND ONLY
     Trigger: pressing the arrow button or Enter in the email field.

     What it does:
       1. Checks the email address with the browser's built-in validation.
       2. Shows an honest message: there is no newsletter service yet, so the
          address is NOT saved or sent anywhere.
       3. Offers a clearly labelled link that opens an email draft to ByteX in
          the visitor's own email app. Nothing is sent unless the visitor
          presses Send in that app.

     To collect real subscriptions later, replace showNewsletterMessage()
     with a call to a real service (for example a backend or a form provider).
     ------------------------------------------------------------------------ */
  function buildNewsletterDraftLink(visitorEmail) {
    const subject = encodeURIComponent(SETTINGS.newsletterDraftSubject);
    const bodyText = encodeURIComponent(
      `Hello ByteX,\n\nPlease let me know about ByteX updates and services.\n` +
      `My email address: ${visitorEmail}\n`
    );
    return `mailto:${SETTINGS.contactEmail}?subject=${subject}&body=${bodyText}`;
  }

  function showNewsletterMessage(status, visitorEmail) {
    const link = document.createElement('a');
    link.href = buildNewsletterDraftLink(visitorEmail);
    link.textContent = 'Open an email draft to ByteX';

    status.replaceChildren(
      'ByteX does not have a newsletter service yet, so your address has not been saved or sent. ',
      link,
      ' (opens your own email app; nothing is sent until you press Send there).'
    );
    status.hidden = false;
  }

  function initNewsletter() {
    const form = select('#newsletter-form');
    const emailField = select('#newsletter-email');
    const status = select('#newsletter-status');
    if (!form || !emailField || !status) return;

    // Clear the error outline as soon as the visitor edits the field.
    emailField.addEventListener('input', () => emailField.removeAttribute('aria-invalid'));

    form.addEventListener('submit', event => {
      event.preventDefault(); // There is no server to submit to.

      if (!form.checkValidity()) {
        emailField.setAttribute('aria-invalid', 'true');
        status.textContent = 'Please enter a valid email address, for example name@example.com.';
        status.hidden = false;
        form.reportValidity();
        return;
      }

      emailField.removeAttribute('aria-invalid');
      showNewsletterMessage(status, emailField.value.trim());
    });
  }


  /* ------------------------------------------------------------------------
     FULL-SCREEN / MOBILE MENU
     setMenuOpen(true) shows the menu; setMenuOpen(false) hides it and puts
     keyboard focus back on the menu button.
     ------------------------------------------------------------------------ */
  function closeAllSubmenus() {
    selectAll('.sub-menu', menu).forEach(submenu => {
      submenu.style.display = 'none';
      submenu.classList.remove('sub-open');
    });
    selectAll('.dmenu', menu).forEach(link => {
      link.classList.remove('dopen');
      link.setAttribute('aria-expanded', 'false');
    });
  }

  function setMenuOpen(open) {
    if (!menu || !menuButton) return;

    menu.inert = !open;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', String(open));
    menuButton.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
    smoother?.paused(open); // stop the page scrolling behind the menu

    if (open) {
      select('.close-menu', menu)?.focus({ preventScroll: true });
    } else {
      closeAllSubmenus();
      menuButton.focus({ preventScroll: true });
    }
  }

  // Trigger: clicking a menu item that has a submenu (class "dmenu-children").
  function toggleSubmenu(link, event) {
    const submenu = select(':scope > .sub-menu', link.parentElement);
    if (!submenu) return;

    event.preventDefault();
    const open = !submenu.classList.contains('sub-open');
    submenu.classList.toggle('sub-open', open);
    submenu.style.display = open ? 'block' : 'none';
    link.classList.toggle('dopen', open);
    link.setAttribute('aria-expanded', String(open));
  }

  // Keeps the Tab key inside the open menu (keyboard accessibility).
  function keepFocusInsideMenu(event) {
    const controls = selectAll('a[href], button, [tabindex="0"]', menu)
      .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
    const first = controls[0];
    const last = controls[controls.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function initMenu() {
    menuButton?.addEventListener('click', () => setMenuOpen(!menu.classList.contains('open')));
    select('.close-menu')?.addEventListener('click', () => setMenuOpen(false));

    selectAll('.dmenu-children', menu || document).forEach(link => {
      link.setAttribute('aria-expanded', 'false');
      link.addEventListener('click', event => toggleSubmenu(link, event));
    });

    // Escape closes the menu; Tab stays inside it while it is open.
    document.addEventListener('keydown', event => {
      if (!menu?.classList.contains('open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
      }
      if (event.key === 'Tab') keepFocusInsideMenu(event);
    });
  }


  /* ------------------------------------------------------------------------
     DESKTOP DROPDOWNS (header navigation)
     Trigger: mouse hover or keyboard focus on a top menu item that has a
     submenu (class "menu-item-has-children").
     ------------------------------------------------------------------------ */
  function initDesktopDropdowns() {
    selectAll('.navbar .menu-item-has-children').forEach(item => {
      const submenu = select(':scope > .dropdown-menu', item);
      if (!submenu) return;

      const toggle = select(':scope > a', item);
      toggle?.setAttribute('aria-haspopup', 'true');

      const show = open => {
        submenu.classList.toggle('show', open);
        toggle?.setAttribute('aria-expanded', String(open));
      };

      item.addEventListener('mouseenter', () => show(true));
      item.addEventListener('mouseleave', () => show(false));
      item.addEventListener('focusin', () => show(true));
      item.addEventListener('focusout', event => {
        if (!item.contains(event.relatedTarget)) show(false);
      });
    });
  }


  /* ------------------------------------------------------------------------
     KEYBOARD SUPPORT for elements with role="button" that are not real
     <button> elements (menu open/close, slider arrows, back-to-top).
     Trigger: pressing Enter or Space while the element is focused.
     ------------------------------------------------------------------------ */
  function initKeyboardButtons() {
    selectAll('[role="button"]').forEach(control => {
      if (control.tagName === 'BUTTON') return;
      control.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          control.click();
        }
      });
    });
  }


  /* ------------------------------------------------------------------------
     ROLLING TEXT (desktop header links)
     Splits each ".rolling-text" label into letters for the hover animation.
     The link keeps one readable name for screen readers (aria-label).
     ------------------------------------------------------------------------ */
  function initRollingText() {
    selectAll('.rolling-text').forEach(element => {
      const text = element.textContent.trim();
      const link = element.closest('a');
      if (link && !link.getAttribute('aria-label')) link.setAttribute('aria-label', text);

      element.textContent = '';
      const block = document.createElement('div');
      block.className = 'block';
      block.setAttribute('aria-hidden', 'true');

      [...text].forEach(letter => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letter.trim() ? letter : '\u00a0';
        block.appendChild(span);
      });

      element.append(block, block.cloneNode(true));
    });
  }


  /* ------------------------------------------------------------------------
     SAME-PAGE LINKS such as href="#services"
     Trigger: clicking any link whose href starts with "#".
     scrollToSection() returns true only when a matching id exists.
     ------------------------------------------------------------------------ */
  function scrollToSection(hash) {
    if (!hash || hash === '#') return false;

    const target = document.getElementById(hash.slice(1));
    if (!target) return false;

    if (menu?.classList.contains('open')) setMenuOpen(false);

    if (reducedMotion || !gsap) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      gsap.to(window, {
        duration: SETTINGS.sectionScrollSeconds,
        scrollTo: { y: target, offsetY: window.innerWidth < 1200 ? 90 : 0 },
        overwrite: 'auto'
      });
    }

    if (location.hash !== hash) history.pushState(null, '', hash);
    return true;
  }

  function initSectionLinks() {
    document.addEventListener('click', event => {
      const anchor = event.target.closest('a[href^="#"]');
      // Menu items with submenus open their submenu instead (see initMenu).
      if (!anchor || anchor.classList.contains('dmenu-children')) return;
      if (scrollToSection(anchor.getAttribute('href'))) event.preventDefault();
    });
  }


  /* ------------------------------------------------------------------------
     SLIDERS (Swiper)
     1. Vision & purpose slider (.testim-style1): a large slide plus a small
        preview slider, both moved by the same arrow buttons.
     2. Roadmap slider (.blog-style2): 1, 2 or 3 cards depending on width.
     Edit speed, slidesPerView and breakpoints below.
     ------------------------------------------------------------------------ */
  function initVisionSlider() {
    const section = select('.testim-style1');
    if (!section) return;

    const next = select('.swiper-button-next', section);
    const previous = select('.swiper-button-prev', section);

    // Small preview on the right. initialSlide: 1 shows the NEXT statement.
    new window.Swiper(select('.thumb-slider', section), {
      slidesPerView: 1,
      spaceBetween: 30,
      initialSlide: 1,
      speed: reducedMotion ? 0 : 2000,
      loop: true,
      allowTouchMove: false,
      a11y: { enabled: false }, // the large slider names the shared arrows
      navigation: { nextEl: next, prevEl: previous }
    });

    // Large slide on the left, with the "1 / 3" counter.
    new window.Swiper(select('.main-slider', section), {
      slidesPerView: 1,
      spaceBetween: 30,
      centeredSlides: true,
      speed: reducedMotion ? 0 : 2000,
      loop: true,
      allowTouchMove: false,
      keyboard: true,
      navigation: { nextEl: next, prevEl: previous },
      pagination: { el: select('.swiper-pagination', section), type: 'fraction' },
      // Screen-reader names for the arrow buttons.
      a11y: { prevSlideMessage: 'Previous statement', nextSlideMessage: 'Next statement' }
    });
  }

  function initRoadmapSlider() {
    const section = select('.blog-style2');
    if (!section) return;

    new window.Swiper(select('.swiper-container', section), {
      slidesPerView: 3,
      spaceBetween: 30,
      speed: reducedMotion ? 0 : 1500,
      loop: false,
      keyboard: true,
      navigation: {
        nextEl: select('.swiper-button-next', section),
        prevEl: select('.swiper-button-prev', section)
      },
      // Screen-reader names for the arrow buttons.
      a11y: { prevSlideMessage: 'Previous priority', nextSlideMessage: 'Next priority' },
      breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
  }

  function initSliders() {
    if (!window.Swiper) return;
    initVisionSlider();
    initRoadmapSlider();
  }


  /* ------------------------------------------------------------------------
     BACK-TO-TOP BUTTON AND STICKY HEADER
     Trigger: scrolling the page, and clicking the round button (bottom-right).
     The ring fills up as you scroll; the header hides when scrolling down
     and reappears when scrolling up.
     ------------------------------------------------------------------------ */
  function initBackToTopAndHeader() {
    const progress = select('.progress-wrap');
    const progressPath = progress ? select('path', progress) : null;
    const pathLength = progressPath?.getTotalLength();
    const navbar = select('.navbar.navbar-expand-lg');

    if (progressPath && pathLength) {
      progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
      progressPath.style.strokeDashoffset = pathLength;
    }

    let lastScroll = 0;
    let scrollQueued = false;

    function updateHeader(position) {
      if (!navbar) return;
      navbar.classList.toggle('mil-scroll', position > 0);
      navbar.classList.toggle('mil-sticky', position > (window.innerWidth <= 600 ? 32 : 150));
      navbar.classList.toggle('mil-nosticky', position < 1);
      navbar.classList.toggle('mil-slideUp', position > lastScroll && position > 150);
      navbar.classList.toggle('mil-slideDown', position < lastScroll && position > 0);
      selectAll('.navbar-collapse', navbar).forEach(collapse => {
        collapse.classList.toggle('mil-scroll', position > 0);
        collapse.style.top = `${navbar.offsetHeight}px`;
      });
    }

    function updateOnScroll() {
      const position = window.scrollY;
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

      if (progressPath) progressPath.style.strokeDashoffset = pathLength * (1 - position / maximum);
      progress?.classList.toggle('active-progress', position > 150);
      updateHeader(position);

      lastScroll = position;
      scrollQueued = false;
    }

    window.addEventListener('scroll', () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(updateOnScroll);
      }
    }, { passive: true });
    updateOnScroll();

    progress?.addEventListener('click', () => {
      if (!reducedMotion && gsap) {
        gsap.to(window, { duration: SETTINGS.backToTopSeconds, scrollTo: 0, overwrite: 'auto' });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  }


  /* ------------------------------------------------------------------------
     DESKTOP HOVER EFFECTS (mouse + screens 1025px and wider only)
     - The round cursor that grows over links.
     - "Magnetic" links in the full-screen menu (class "hover-this").
     - Leadership list: the role image follows the mouse, and the other rows
       fade while one row is hovered.
     ------------------------------------------------------------------------ */
  function initCustomCursor() {
    const cursor = select('.cursor');
    if (!cursor) return;

    window.addEventListener('mousemove', event => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    }, { passive: true });

    selectAll('a, .cursor-pointer').forEach(link => {
      link.addEventListener('mouseenter', () => cursor.classList.add('cursor-active'));
      link.addEventListener('mouseleave', () => cursor.classList.remove('cursor-active'));
    });
  }

  function initMagneticLinks() {
    selectAll('.hover-this').forEach(link => {
      const animated = select('.hover-anim', link);
      if (!animated) return;

      link.addEventListener('mousemove', event => {
        const box = link.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width * 50 - 25;
        const y = (event.clientY - box.top) / box.height * 50 - 25;
        animated.style.transform = `translate(${x}px, ${y}px)`;
      });
      link.addEventListener('mouseleave', () => { animated.style.transform = ''; });
    });
  }

  function initLeadershipHover() {
    // The preview image is the element with class "award-reveal-img".
    selectAll('.hover-reveal-item').forEach(item => {
      const preview = select('.award-reveal-img', item);
      if (!preview) return;
      item.addEventListener('mousemove', event => {
        const box = item.getBoundingClientRect();
        preview.style.transform = `translate(${event.clientX - box.left}px, ${event.clientY - box.top}px)`;
      });
    });

    const rows = selectAll('.awards-reval .item-row');
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        rows.forEach(other => { other.style.opacity = other === row ? '1' : '.2'; });
      });
      row.addEventListener('mouseleave', () => {
        rows.forEach(other => { other.style.opacity = '1'; });
      });
    });
  }

  function initHoverEffects() {
    if (!window.matchMedia('(hover: hover) and (min-width: 1025px)').matches) return;
    initCustomCursor();
    initMagneticLinks();
    initLeadershipHover();
  }


  /* ------------------------------------------------------------------------
     SCROLL REVEAL ANIMATIONS
     Any element in index.html with data-ui-animate fades/slides in when it
     scrolls into view. Optional attributes on that element:
       data-delay="0.3"      wait before animating (seconds)
       data-direction="up"   "up", "down", "left" or "right"
     Also pins the big "Approach" title while its cards scroll past (desktop).
     ------------------------------------------------------------------------ */
  function animateOnScroll(element) {
    const offset = parseFloat(element.dataset.offset || '60');
    const direction = element.dataset.direction || 'down';
    const properties = {
      opacity: 0,
      filter: 'blur(16px)',
      duration: parseFloat(element.dataset.duration || '0.6'),
      delay: parseFloat(element.dataset.delay || '0.2'),
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: element.dataset.start || 'top 90%',
        end: element.dataset.end || 'top 50%',
        scrub: false
      }
    };

    if (direction === 'left' || direction === 'right') {
      properties.x = direction === 'left' ? -offset : offset;
    } else {
      properties.y = direction === 'down' ? offset : -offset;
    }

    gsap.from(element, properties);
  }

  function initRevealAnimations() {
    selectAll('[data-ui-animate], .data-ui-animate').forEach(element => {
      element.style.opacity = '1';
      element.style.filter = 'blur(0)';
      if (!reducedMotion && gsap) animateOnScroll(element);
    });

    if (gsap && ScrollTrigger) {
      gsap.matchMedia().add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => {
        selectAll('.features').forEach(section => {
          const title = select('.stack-title', section);
          if (!title) return;
          ScrollTrigger.create({
            trigger: title,
            start: 'center center',
            endTrigger: section,
            end: 'bottom bottom',
            pin: true,
            pinSpacing: false
          });
        });
      });
    }

    ScrollTrigger?.refresh();
  }


  /* ------------------------------------------------------------------------
     LOADING SCREEN
     Shows the word inside .load-text (index.html), then slides the screen
     away and animates the hero in. A safety timer always removes it.
     ------------------------------------------------------------------------ */
  function splitLoaderLetters(loader) {
    const text = select('.load-text', loader);
    if (!text) return;
    const word = text.textContent.trim();
    text.textContent = '';
    [...word].forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter;
      text.appendChild(span);
    });
  }

  function finishLoading() {
    initRevealAnimations();

    const loader = select('.loader-wrap');
    if (reducedMotion || !gsap || !loader) {
      if (loader) loader.style.display = 'none';
      return;
    }

    body.classList.add('js-ready');
    splitLoaderLetters(loader);

    const timeline = gsap.timeline({ onComplete: () => { loader.style.display = 'none'; } });
    timeline.to('.loader-wrap-heading .load-text', { delay: 1.5, y: -100, opacity: 0 });
    timeline.to('#svg', { duration: 0.5, attr: { d: 'M0 502S175 272 500 272s500 230 500 230V0H0Z' }, ease: 'power2.in' });
    timeline.to('#svg', { duration: 0.5, attr: { d: 'M0 2S175 1 500 1s500 1 500 1V0H0Z' }, ease: 'power2.out' });
    timeline.to(loader, { y: -1500 }).set(loader, { display: 'none', zIndex: -1 });
    timeline.from('.hero-bg-animate', { y: 200 }, '-=1.5');
    timeline.from('.hero-animate', { y: 80, opacity: 0, delay: 0.3 }, '-=1.5');

    // Never leave the website hidden if an animation is interrupted.
    window.setTimeout(() => { loader.style.display = 'none'; }, 6000);
  }

  function initPageLoading() {
    if (document.readyState === 'complete') finishLoading();
    else window.addEventListener('load', finishLoading, { once: true });

    // Fonts and resizing change sizes, so re-measure scroll animations.
    document.fonts?.ready.then(() => ScrollTrigger?.refresh());
    window.addEventListener('resize', () => ScrollTrigger?.refresh(), { passive: true });

    // If the address already contains #section, scroll there after loading.
    window.addEventListener('load', () => {
      if (location.hash) {
        window.setTimeout(() => scrollToSection(location.hash), reducedMotion ? 0 : 1600);
      }
    }, { once: true });
  }


  /* ------------------------------------------------------------------------
     STARTUP — one line per feature. Remove a line only to switch that
     feature off on purpose.
     ------------------------------------------------------------------------ */
  initTheme();
  initScrollEffects();
  initNewsletter();
  initMenu();
  initDesktopDropdowns();
  initKeyboardButtons();
  initRollingText();
  initSectionLinks();
  initSliders();
  initBackToTopAndHeader();
  initHoverEffects();
  initPageLoading();
})();
