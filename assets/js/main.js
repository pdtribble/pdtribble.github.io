/**
 * Paul Tribble Portfolio — main.js
 * Dark Ops Terminal Aesthetic
 * Vanilla JS — no dependencies
 */

(function () {
  'use strict';

  /* =============================================
     UTILITIES
     ============================================= */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = () =>
    !window.matchMedia('(hover: hover)').matches;

  /* =============================================
     1. CUSTOM CURSOR
     ============================================= */
  (function initCursor() {
    const dot  = $('.cursor');
    const ring = $('.cursor-ring');
    if (!dot || !ring || isTouchDevice()) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let rafId;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    function tick() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      rafId = requestAnimationFrame(tick);
    }
    tick();

    // Hover state on interactive elements
    function addHoverListeners() {
      $$('a, button, .card, .tag, .contact-item, .btn, .nav-logo, [data-hover]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          dot.classList.add('is-hovering');
          ring.classList.add('is-hovering');
        });
        el.addEventListener('mouseleave', () => {
          dot.classList.remove('is-hovering');
          ring.classList.remove('is-hovering');
        });
      });
    }
    addHoverListeners();

    document.addEventListener('mousedown', () => dot.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => dot.classList.remove('is-clicking'));

    // Re-bind after DOM mutations (e.g., mobile menu opens)
    const obs = new MutationObserver(addHoverListeners);
    obs.observe(document.body, { childList: true, subtree: true });
  })();

  /* =============================================
     2. NAV SCROLL STATE + HAMBURGER
     ============================================= */
  (function initNav() {
    const nav     = $('.nav');
    const burger  = $('.nav-burger');
    const drawer  = $('.nav-drawer');
    if (!nav) return;

    // Scroll class
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger
    if (burger && drawer) {
      burger.addEventListener('click', () => {
        const open = burger.classList.toggle('open');
        drawer.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        burger.setAttribute('aria-expanded', open);
      });

      $$('a', drawer).forEach((a) => {
        a.addEventListener('click', () => {
          burger.classList.remove('open');
          drawer.classList.remove('open');
          document.body.style.overflow = '';
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  })();

  /* =============================================
     3. TYPEWRITER + GLITCH (Hero only)
     ============================================= */
  (function initTypewriter() {
    const nameEl = document.getElementById('typed-name');
    const subEl  = document.getElementById('typed-sub');
    const ctas   = document.getElementById('hero-ctas');
    if (!nameEl || !subEl) return;

    const NAME = 'Paul Tribble';
    const SUB  = 'Breaking things to understand how they work.';

    if (prefersReducedMotion()) {
      nameEl.textContent = NAME;
      subEl.textContent  = SUB;
      if (ctas) ctas.classList.add('visible');
      return;
    }

    // ── Type name ──
    let ni = 0;
    const nameCursor = document.createElement('span');
    nameCursor.className = 'tb-cursor';
    nameEl.appendChild(nameCursor);

    function typeName() {
      if (ni < NAME.length) {
        nameCursor.insertAdjacentText('beforebegin', NAME[ni]);
        ni++;
        setTimeout(typeName, 75 + Math.random() * 45);
      } else {
        // Trigger glitch after short pause
        setTimeout(() => {
          nameEl.classList.add('glitching');
          setTimeout(() => {
            nameEl.classList.remove('glitching');
            nameCursor.remove();
            setTimeout(typeSub, 180);
          }, 430);
        }, 220);
      }
    }

    // ── Type subtitle ──
    let si = 0;
    const subCursor = document.createElement('span');
    subCursor.className = 'tb-cursor';

    function typeSub() {
      subEl.appendChild(subCursor);
      function typeChar() {
        if (si < SUB.length) {
          subCursor.insertAdjacentText('beforebegin', SUB[si]);
          si++;
          setTimeout(typeChar, 30 + Math.random() * 18);
        } else {
          setTimeout(() => {
            subCursor.remove();
            if (ctas) ctas.classList.add('visible');
          }, 400);
        }
      }
      typeChar();
    }

    // Kick off with a slight delay (let page paint first)
    setTimeout(typeName, 380);
  })();

  /* =============================================
     4. SCROLL REVEAL — IntersectionObserver
     ============================================= */
  (function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );

    $$('.reveal').forEach((el) => observer.observe(el));
  })();

  /* =============================================
     5. CARD 3D TILT
     ============================================= */
  (function initCardTilt() {
    if (isTouchDevice() || prefersReducedMotion()) return;

    $$('.card').forEach((card) => {
      let raf;
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;

      card.addEventListener('mousemove', (e) => {
        const r  = card.getBoundingClientRect();
        const cx = r.width  / 2;
        const cy = r.height / 2;
        targetY =  ((e.clientX - r.left - cx) / cx) * 5.5;
        targetX = -((e.clientY - r.top  - cy) / cy) * 5.5;

        if (!raf) {
          function animate() {
            currentX += (targetX - currentX) * 0.15;
            currentY += (targetY - currentY) * 0.15;
            card.style.transform =
              `perspective(900px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(8px)`;
            if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
              raf = requestAnimationFrame(animate);
            } else {
              raf = null;
            }
          }
          raf = requestAnimationFrame(animate);
        }
      });

      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        raf = null;
        card.style.transition = 'transform 400ms ease';
        card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        setTimeout(() => { card.style.transition = ''; }, 420);
      });
    });
  })();

  /* =============================================
     6. SMOOTH ANCHOR SCROLL (account for fixed nav)
     ============================================= */
  (function initSmoothScroll() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navH = $('.nav')?.offsetHeight || 60;
        const y    = target.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  })();

  /* =============================================
     7. ACTIVE NAV LINK HIGHLIGHT (scroll spy)
     ============================================= */
  (function initScrollSpy() {
    const sections = $$('section[id]');
    const links    = $$('.nav-links a[href^="#"], .nav-drawer a[href^="#"]');
    if (!sections.length || !links.length) return;

    const navH = () => ($('.nav')?.offsetHeight || 60) + 20;

    function update() {
      let active = '';
      sections.forEach((sec) => {
        if (sec.getBoundingClientRect().top <= navH()) active = sec.id;
      });
      links.forEach((a) => {
        a.style.color = a.getAttribute('href') === `#${active}`
          ? 'var(--accent-cyan)'
          : '';
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

})();
