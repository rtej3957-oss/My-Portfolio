/**
 * RAVI TEJ P — PREMIUM PORTFOLIO
 * main.js — Full interactive experience
 * Three.js hero · GSAP ScrollTrigger · Lenis smooth scroll
 * Custom cursor · Typewriter · Tilt cards · Loader
 */

'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.innerWidth <= 768;

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

/* ============================================================
   1. LOADER
   ============================================================ */
function initLoader() {
  const loader    = document.getElementById('loader');
  const loaderBar = loader.querySelector('.loader-bar');
  const loaderPct = loader.querySelector('.loader-pct');
  const loaderLogo = loader.querySelector('.loader-logo');
  const loaderName = loader.querySelector('.loader-name');

  if (!loader) return;

  // Animate logo in
  gsap.to(loaderLogo, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
  gsap.to(loaderName, { opacity: 1, duration: 0.5, delay: 0.4 });
  gsap.to(loaderPct, { opacity: 1, duration: 0.4, delay: 0.5 });

  // Fake progress
  let progress = 0;
  const pctInterval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 18, 95);
    gsap.to(loaderBar, { width: progress + '%', duration: 0.4, ease: 'power2.out' });
    loaderPct.textContent = Math.floor(progress) + '%';
  }, 180);

  const onComplete = () => {
    clearInterval(pctInterval);
    gsap.to(loaderBar, { width: '100%', duration: 0.3, ease: 'power2.out',
      onUpdate() { loaderPct.textContent = Math.floor(gsap.getProperty(loaderBar, 'width') / loaderBar.parentElement.offsetWidth * 100) + '%'; },
      onComplete() {
        loaderPct.textContent = '100%';
        gsap.to(loader, {
          opacity: 0, scale: 1.04, duration: 0.75, delay: 0.25, ease: 'power3.inOut',
          onComplete() {
            loader.style.display = 'none';
            document.body.style.overflow = '';
            revealHeroContent();
          }
        });
      }
    });
  };

  // Minimum 1.6s loading feel
  const minDelay = prefersReducedMotion ? 0 : 1600;
  setTimeout(onComplete, minDelay);
  document.body.style.overflow = 'hidden';
}

/* ============================================================
   2. LENIS SMOOTH SCROLL
   ============================================================ */
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // GSAP ticker integration
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Sync with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Smooth anchor click navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target, { offset: -80, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    });
  });

  return lenis;
}

/* ============================================================
   3. CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  if (isMobile()) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(dot, { x: mouseX, y: mouseY });
  });

  function animateCursor() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    gsap.set(ring, { x: ringX, y: ringY });
    rafId = requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover states
  const interactives = document.querySelectorAll('a, button, .tilt-card, .magnetic, [data-cursor]');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  document.addEventListener('mouseleave', () => { dot.classList.add('hide'); ring.classList.add('hide'); });
  document.addEventListener('mouseenter', () => { dot.classList.remove('hide'); ring.classList.remove('hide'); });
}

/* ============================================================
   4. THREE.JS HERO BACKGROUND
   ============================================================ */
function initThreeHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene  = new THREE.Scene();
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Ambient + directional lights
  scene.add(new THREE.AmbientLight(0xf5f0e6, 0.4));
  const dirLight = new THREE.DirectionalLight(0xd96c3f, 0.8);
  dirLight.position.set(3, 3, 3);
  scene.add(dirLight);
  const goldLight = new THREE.PointLight(0xd8a85b, 0.6, 8);
  goldLight.position.set(-3, -1, 2);
  scene.add(goldLight);

  // Floating geometry particles
  const geometries = [
    new THREE.TetrahedronGeometry(0.18, 0),
    new THREE.OctahedronGeometry(0.14, 0),
    new THREE.IcosahedronGeometry(0.12, 0),
    new THREE.TorusGeometry(0.08, 0.04, 8, 6),
    new THREE.BoxGeometry(0.15, 0.15, 0.15),
  ];

  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xd96c3f, roughness: 0.3, metalness: 0.5, transparent: true, opacity: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xd8a85b, roughness: 0.4, metalness: 0.6, transparent: true, opacity: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0x263d32, roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.25 }),
  ];

  const meshes = [];
  for (let i = 0; i < 26; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mat = materials[Math.floor(Math.random() * materials.length)].clone();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const s = 0.5 + Math.random() * 1.5;
    mesh.scale.setScalar(s);
    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.006,
      rotSpeedY: (Math.random() - 0.5) * 0.008,
      floatSpeed: 0.4 + Math.random() * 0.6,
      floatAmp:   0.15 + Math.random() * 0.3,
      baseY: mesh.position.y,
      phase: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    meshes.push(mesh);
  }

  // Large background torus ring
  const torusGeo = new THREE.TorusGeometry(3.5, 0.02, 4, 80);
  const torusMat = new THREE.MeshStandardMaterial({ color: 0xd8a85b, transparent: true, opacity: 0.12 });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI / 3;
  scene.add(torus);

  const torus2 = new THREE.Mesh(
    new THREE.TorusGeometry(4.5, 0.015, 4, 80),
    new THREE.MeshStandardMaterial({ color: 0xd96c3f, transparent: true, opacity: 0.08 })
  );
  torus2.rotation.x = Math.PI / 4; torus2.rotation.y = Math.PI / 6;
  scene.add(torus2);

  // Mouse parallax
  let targetRotX = 0, targetRotY = 0;
  let curRotX = 0, curRotY = 0;

  document.addEventListener('mousemove', (e) => {
    targetRotY = ((e.clientX / window.innerWidth) - 0.5) * 0.3;
    targetRotX = -((e.clientY / window.innerHeight) - 0.5) * 0.2;
  });

  let clock = { elapsed: 0 };
  const startTime = performance.now();

  function animate() {
    if (!renderer) return;
    rafHero = requestAnimationFrame(animate);
    const t = (performance.now() - startTime) / 1000;

    curRotX = lerp(curRotX, targetRotX, 0.04);
    curRotY = lerp(curRotY, targetRotY, 0.04);
    scene.rotation.x = curRotX;
    scene.rotation.y = curRotY;

    meshes.forEach(m => {
      m.rotation.x += m.userData.rotSpeedX;
      m.rotation.y += m.userData.rotSpeedY;
      m.position.y = m.userData.baseY + Math.sin(t * m.userData.floatSpeed + m.userData.phase) * m.userData.floatAmp;
    });

    torus.rotation.z = t * 0.06;
    torus2.rotation.z = -t * 0.04;
    goldLight.position.x = Math.sin(t * 0.4) * 4;
    goldLight.position.y = Math.cos(t * 0.3) * 2;

    renderer.render(scene, camera);
  }

  let rafHero;
  animate();

  // Resize
  window.addEventListener('resize', () => {
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

/* ============================================================
   5. HERO PARTICLES (CSS particles)
   ============================================================ */
function initHeroParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const colors = ['rgba(217,108,63,0.35)', 'rgba(216,168,91,0.25)', 'rgba(245,240,230,0.15)'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    const size = 2 + Math.random() * 4;
    Object.assign(p.style, {
      position: 'absolute',
      width: size + 'px', height: size + 'px',
      borderRadius: '50%',
      background: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      pointerEvents: 'none',
    });
    container.appendChild(p);
    if (!prefersReducedMotion) {
      gsap.to(p, {
        y: '-=' + (30 + Math.random() * 80),
        x: '+=' + ((Math.random() - 0.5) * 40),
        opacity: 0,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 4,
        repeat: -1,
        yoyo: false,
        ease: 'none',
        onRepeat() {
          gsap.set(p, { y: 0, x: 0, opacity: 1, left: Math.random() * 100 + '%', top: '100%' });
        }
      });
    }
  }
}

/* ============================================================
   6. TYPEWRITER EFFECT
   ============================================================ */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = ['digital experiences.', 'elegant interfaces.', 'smart solutions.', 'the future.'];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = phrases[phraseIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; setTimeout(type, 500); return; }
      setTimeout(type, 50);
    } else {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) { setTimeout(() => { deleting = true; type(); }, 2200); return; }
      setTimeout(type, 85 + Math.random() * 40);
    }
  }
  setTimeout(type, 400);
}

/* ============================================================
   7. HERO REVEAL ANIMATION
   ============================================================ */
function revealHeroContent() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.word, .eyebrow, .hero-sub, .hero-desc, .hero-buttons, .hero-socials, .hero-visual, .hero-scroll-hint')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.eyebrow', { opacity: 1, y: 0, duration: 0.7 })
    .to('.word', { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, '-=0.3')
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero-desc', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero-buttons', { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
    .to('.hero-socials', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
    .to('.hero-visual', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.6')
    .to('.hero-scroll-hint', { opacity: 1, duration: 0.5 }, '-=0.2');

  initTypewriter();
}

/* ============================================================
   8. NAVBAR BEHAVIOR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!navbar) return;

  // Scroll state
  let lastScroll = 0;
  lenis?.on('scroll', ({ scroll }) => {
    if (scroll > 60) { navbar.classList.add('scrolled'); }
    else { navbar.classList.remove('scrolled'); }
    lastScroll = scroll;
  });

  // Mobile hamburger
  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open.toString());
    if (open) lenis?.stop(); else lenis?.start();
  });

  // Close on nav click
  navLinks?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      lenis?.start();
    });
  });

  // Active section highlight
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link[data-section]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  sections.forEach(s => io.observe(s));
}

/* ============================================================
   9. GSAP SCROLL ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
  if (prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  ScrollTrigger.defaults({ toggleActions: 'play none none none' });

  // --- Section labels ---
  gsap.utils.toArray('.reveal-label').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  // --- Section titles ---
  gsap.utils.toArray('.reveal-title').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // --- About section ---
  gsap.utils.toArray('.reveal-stagger').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      delay: i * 0.12,
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top 80%' }
    });
  });

  // About right content stagger
  const aboutRight = document.querySelector('.about-right');
  if (aboutRight) {
    gsap.from(aboutRight.children, {
      opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: aboutRight, start: 'top 80%' }
    });
  }

  // --- Skill cards ---
  gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
      delay: (i % 3) * 0.12,
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
  });

  // --- Project cards ---
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      delay: (i % 3) * 0.1,
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
  });

  // --- Timeline items ---
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.to(item, {
      opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
      delay: i * 0.18,
      scrollTrigger: { trigger: item, start: 'top 85%' }
    });
  });

  // Timeline progress bar
  ScrollTrigger.create({
    trigger: '.timeline',
    start: 'top 75%',
    end: 'bottom 60%',
    onEnter: () => {
      gsap.to('#timeline-progress', { height: '100%', duration: 1.4, ease: 'power2.out' });
    }
  });

  // --- Cert cards ---
  gsap.utils.toArray('.cert-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      delay: (i % 2) * 0.12,
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
  });

  // --- Interest tags ---
  gsap.from('.interest-tags span', {
    opacity: 0, scale: 0.85, y: 15, stagger: 0.04, duration: 0.5, ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.interest-tags', start: 'top 85%' }
  });

  // --- Contact ---
  gsap.to('.contact-heading', {
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-section', start: 'top 80%' }
  });
  gsap.to('.contact-sub', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.15,
    scrollTrigger: { trigger: '.contact-section', start: 'top 80%' }
  });
  gsap.utils.toArray('.contact-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
      delay: i * 0.1,
      scrollTrigger: { trigger: '.contact-cards', start: 'top 85%' }
    });
  });

  // --- Parallax on about geo visual ---
  gsap.to('.about-geo-visual', {
    y: -50,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    }
  });

  // --- Parallax decorative elements ---
  gsap.utils.toArray('.section-bg-deco, .contact-bg-deco').forEach(el => {
    gsap.to(el, {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section'),
        start: 'top bottom', end: 'bottom top',
        scrub: 2,
      }
    });
  });
}

/* ============================================================
   10. 3D TILT EFFECT
   ============================================================ */
function initTiltCards() {
  if (isMobile()) return;

  document.querySelectorAll('.tilt-card').forEach(card => {
    let bounds, rafTilt;

    function onMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top  + bounds.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxTilt = 10;
      const rotX = clamp((-dy / (bounds.height / 2)) * maxTilt, -maxTilt, maxTilt);
      const rotY = clamp((dx / (bounds.width  / 2)) * maxTilt, -maxTilt, maxTilt);

      cancelAnimationFrame(rafTilt);
      rafTilt = requestAnimationFrame(() => {
        gsap.to(card, {
          rotateX: rotX,
          rotateY: rotY,
          scale: 1.025,
          duration: 0.2,
          ease: 'power2.out',
          transformPerspective: 900,
        });
        // Move shine on project cards
        const shine = card.querySelector('.proj-shine, .sk-glow');
        if (shine && card.querySelector('.proj-shine')) {
          const px = ((e.clientX - bounds.left) / bounds.width) * 100;
          const py = ((e.clientY - bounds.top)  / bounds.height) * 100;
          shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(245,240,230,0.12), transparent 60%)`;
          shine.style.opacity = '1';
        }
      });
    }

    function onLeave() {
      bounds = null;
      cancelAnimationFrame(rafTilt);
      gsap.to(card, {
        rotateX: 0, rotateY: 0, scale: 1,
        duration: 0.5, ease: 'power3.out',
      });
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('mouseenter', () => { bounds = card.getBoundingClientRect(); });
  });
}

/* ============================================================
   11. HERO PARALLAX (mouse-driven 3D visual)
   ============================================================ */
function initHeroParallax() {
  if (isMobile()) return;
  const scene3D = document.getElementById('hero-3d-scene');
  if (!scene3D) return;

  let tx = 0, ty = 0;
  let cx = 0, cy = 0;
  let raf;

  document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 28;
    ty = -((e.clientY - rect.top)  / rect.height - 0.5) * 18;
  });

  function step() {
    cx = lerp(cx, tx, 0.06);
    cy = lerp(cy, ty, 0.06);
    gsap.set(scene3D, {
      rotateY: cx,
      rotateX: cy,
      transformPerspective: 1200,
    });
    raf = requestAnimationFrame(step);
  }
  step();
}

/* ============================================================
   12. MAGNETIC BUTTON EFFECT
   ============================================================ */
function initMagnetic() {
  if (isMobile()) return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width  / 2);
      const dy = e.clientY - (rect.top  + rect.height / 2);
      gsap.to(btn, { x: dx * 0.3, y: dy * 0.3, duration: 0.35, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ============================================================
   13. SECTION HEADING GRID FIX
   ============================================================ */
function patchSectionHeadings() {
  // For small screens, already handled in CSS
}

/* ============================================================
   14. MOBILE CURSOR DISABLE
   ============================================================ */
function handleMobileCursor() {
  if (isMobile()) {
    document.body.style.cursor = 'auto';
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (dot)  { dot.style.display  = 'none'; }
    if (ring) { ring.style.display = 'none'; }
    // Re-enable native cursor on all elements
    document.querySelectorAll('*').forEach(el => {
      if (el.style.cursor === 'none') el.style.cursor = '';
    });
  }
}

/* ============================================================
   15. BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    lenis?.scrollTo(0, { duration: 1.6 });
  });
}

/* ============================================================
   16. INTEREST TAGS ANIMATION (hover ripple)
   ============================================================ */
function initInterestTags() {
  document.querySelectorAll('.interest-tags span').forEach(tag => {
    tag.addEventListener('click', () => {
      gsap.to(tag, { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1 });
    });
  });
}

/* ============================================================
   INIT — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Init Three.js hero background
  initThreeHero();

  // Init hero particles
  initHeroParticles();

  // Init Lenis smooth scroll
  if (!prefersReducedMotion) {
    initLenis();
  } else {
    // Fallback anchor scroll for reduced motion
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Init navbar
  initNavbar();

  // Init GSAP scroll animations
  initScrollAnimations();

  // Init 3D tilt
  initTiltCards();

  // Init hero parallax
  initHeroParallax();

  // Init magnetic buttons
  initMagnetic();

  // Init cursor
  initCursor();

  // Back to top
  initBackToTop();

  // Interest tags
  initInterestTags();

  // Mobile cursor
  handleMobileCursor();

  // Start loader (last, so page is ready)
  initLoader();

  // Console greeting
  console.log('%c RAVI TEJ P — PORTFOLIO ', 'background:#263D32;color:#D8A85B;font-size:18px;font-weight:bold;padding:8px 16px;border-radius:6px;');
  console.log('%c Built with Three.js · GSAP · Lenis ', 'color:#D96C3F;font-size:12px;');
});

/* ============================================================
   WINDOW RESIZE
   ============================================================ */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    handleMobileCursor();
    ScrollTrigger.refresh();
  }, 200);
});
