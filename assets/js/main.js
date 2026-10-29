/**
 * LinguaLink360 Foundation Script
 * Plain vanilla JS, no dependencies.
 */

(function () {
  'use strict';

  // Progressive enhancement: mark document as JS-enabled
  document.documentElement.classList.add('ll-js');

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initHeroParallax();
    initSmoothScroll();
  }

  /**
   * 1. Header Scroll Shadow
   * Toggles .ll-header--scrolled when scrolled past threshold.
   */
  function initHeaderScroll() {
    const header = document.querySelector('.ll-header');
    if (!header) return;

    let ticking = false;
    const threshold = 12;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > threshold) {
            header.classList.add('ll-header--scrolled');
          } else {
            header.classList.remove('ll-header--scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /**
   * 2. Accessible Mobile Menu
   * Handles hamburger toggle, aria states, Escape key closing, and focus return.
   */
  function initMobileMenu() {
    const toggleBtn = document.querySelector('.ll-menu-toggle');
    const mobileMenu = document.querySelector('.ll-mobile-menu');
    if (!toggleBtn || !mobileMenu) return;

    let isOpen = false;

    function openMenu() {
      isOpen = true;
      toggleBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const firstFocusable = mobileMenu.querySelector('a, button');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      toggleBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    const drawerLinks = mobileMenu.querySelectorAll('a, button:not(.ll-menu-toggle)');
    drawerLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    function handleBreakpoint(e) {
      if (e.matches && isOpen) {
        closeMenu();
      }
    }
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleBreakpoint);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleBreakpoint);
    }
  }

  /**
   * 3. Scroll Reveal System, Stagger & Count-up
   * Respects prefers-reduced-motion media query.
   */
  function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = document.querySelectorAll('[data-ll-reveal], [data-ll-stagger], [data-ll-count]');
    if (!revealElements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((el) => {
        el.classList.add('ll-revealed');
        if (el.hasAttribute('data-ll-count')) {
          const raw = el.getAttribute('data-ll-count') || el.textContent;
          const parsed = parseCountValue(raw);
          el.textContent = `${parsed.prefix}${parsed.target}${parsed.suffix}`;
        }
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          target.classList.add('ll-revealed');

          // Trigger count-up if element or its children have data-ll-count
          if (target.hasAttribute('data-ll-count')) {
            animateCount(target);
          } else {
            const counters = target.querySelectorAll('[data-ll-count]');
            counters.forEach((cnt) => animateCount(cnt));
          }

          obs.unobserve(target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => {
      observer.observe(el);
    });
  }

  /**
   * Parse numerical targets with prefixes and suffixes (e.g. "500+", "25k+", "$10M")
   */
  function parseCountValue(str) {
    const raw = String(str).trim();
    const match = raw.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
    if (!match) return { prefix: '', target: 0, suffix: raw };
    return {
      prefix: match[1] || '',
      target: parseFloat(match[2].replace(/,/g, '')),
      suffix: match[3] || ''
    };
  }

  /**
   * Smooth number increment animation
   */
  function animateCount(el) {
    const raw = el.getAttribute('data-ll-count') || el.textContent;
    const { prefix, target, suffix } = parseCountValue(raw);
    if (isNaN(target)) return;

    const duration = 1200;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * ease);
      el.textContent = `${prefix}${current}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }
    requestAnimationFrame(update);
  }

  /**
   * 4. Hero Mockup Parallax Float
   * Subtle transform-only scroll float using requestAnimationFrame and passive listener.
   */
  function initHeroParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hero = document.querySelector('.ll-hero');
    const heroVisual = document.querySelector('.ll-hero__visual');
    if (!hero || !heroVisual) return;

    const noteCard = heroVisual.querySelector('.ll-mockup-note');
    const chartCard = heroVisual.querySelector('.ll-mockup-chart');

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          // Only calculate when hero is inside or close to viewport
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const scrollY = window.scrollY || window.pageYOffset;
            const noteOffset = scrollY * 0.04;
            const chartOffset = scrollY * -0.06;

            if (noteCard) {
              noteCard.style.transform = `translateY(${noteOffset.toFixed(2)}px)`;
            }
            if (chartCard) {
              chartCard.style.transform = `translateY(${chartOffset.toFixed(2)}px)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /**
   * 5. Smooth In-page Navigation
   * Intercepts links that point to this same page (hash links and the Home link),
   * animates the scroll with requestAnimationFrame and keeps URL + focus in sync.
   * Links to other pages (e.g. index.html#pricing from about.html) are left to the
   * browser; CSS scroll-margin-top handles the sticky header offset there.
   */
  function initSmoothScroll() {
    const root = document.documentElement;
    const DURATION = 800;
    const EXTRA_OFFSET = 16;
    const SCROLL_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'];
    const CANCEL_EVENTS = ['wheel', 'touchstart', 'touchmove', 'keydown'];

    let frameId = null;
    let activeCleanup = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Normalise "/", "/index.html" and "index.html" so they compare as the same page
    function normalisePath(pathname) {
      return pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
    }

    function isSamePage(url) {
      return url.origin === window.location.origin &&
        normalisePath(url.pathname) === normalisePath(window.location.pathname) &&
        url.search === window.location.search;
    }

    // Sticky header height (measured, so it is right on mobile too) + breathing room
    function getScrollOffset() {
      const header = document.querySelector('.ll-header');
      const measured = header ? header.offsetHeight : 0;
      const token = parseFloat(getComputedStyle(root).getPropertyValue('--ll-header-height')) || 73;
      return (measured || token) + EXTRA_OFFSET;
    }

    // offsetTop chain ignores CSS transforms, so the pre-reveal translateY does not skew the result
    function getAbsoluteTop(el) {
      let top = 0;
      let node = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent;
      }
      return top;
    }

    function getMaxScroll() {
      return Math.max(0, root.scrollHeight - window.innerHeight);
    }

    function jumpTo(y) {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    }

    function closeMobileMenuIfOpen() {
      const toggleBtn = document.querySelector('.ll-menu-toggle');
      if (toggleBtn && toggleBtn.getAttribute('aria-expanded') === 'true') {
        toggleBtn.click();
      }
      // Always release the body scroll lock before scrolling
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    }

    function focusTarget(el) {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '-1');
      }
      el.focus({ preventScroll: true });
    }

    function stopAnimation() {
      if (activeCleanup) {
        activeCleanup();
      }
    }

    function animateTo(destination, onDone) {
      const startY = window.scrollY || window.pageYOffset;
      const distance = destination - startY;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion || Math.abs(distance) < 1) {
        jumpTo(destination);
        onDone();
        return;
      }

      // Disable the CSS smooth-scroll fallback while we drive the scroll ourselves
      root.classList.add('ll-scrolling');
      const startTime = performance.now();

      function cleanup() {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
          frameId = null;
        }
        CANCEL_EVENTS.forEach((type) => window.removeEventListener(type, onUserScroll));
        root.classList.remove('ll-scrolling');
        activeCleanup = null;
      }

      // Any manual scroll intent cancels the animation immediately
      function onUserScroll(event) {
        if (event.type === 'keydown' && SCROLL_KEYS.indexOf(event.key) === -1) return;
        cleanup();
        onDone();
      }

      function step(now) {
        const progress = Math.min((now - startTime) / DURATION, 1);
        jumpTo(startY + distance * easeInOutCubic(progress));
        if (progress < 1) {
          frameId = window.requestAnimationFrame(step);
        } else {
          cleanup();
          onDone();
        }
      }

      activeCleanup = cleanup;
      CANCEL_EVENTS.forEach((type) => window.addEventListener(type, onUserScroll, { passive: true }));
      frameId = window.requestAnimationFrame(step);
    }

    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      // Placeholder links (href="#") keep default behavior
      if (link.getAttribute('href') === '#') return;

      const url = new URL(link.href, window.location.href);
      if (!isSamePage(url)) return;

      let target = null;
      let isTop = false;

      if (url.hash) {
        target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!target) return;
      } else {
        // Same page without a hash (Home link, logo): scroll to the top
        isTop = true;
        target = document.getElementById('main-content') || document.body;
      }

      event.preventDefault();
      stopAnimation();
      closeMobileMenuIfOpen();

      const destination = isTop
        ? 0
        : Math.min(Math.max(0, getAbsoluteTop(target) - getScrollOffset()), getMaxScroll());

      const nextUrl = url.pathname + url.search + (isTop ? '' : url.hash);
      if (nextUrl !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.pushState(null, '', nextUrl);
      }

      animateTo(destination, () => focusTarget(target));
    });
  }
})();
