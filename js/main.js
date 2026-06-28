/* ─── SCROLL RESTORE FIX ─────────────────────────────────────────── */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ─── PARTICLES ──────────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  let W, H, pts = [];
  const mouse = { x: null, y: null };

  const CONN_DIST  = 150;   // connection distance
  const MOUSE_DIST = 100;   // mouse attraction radius
  /* Adapt particle colors to system color scheme */
  const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const C_CYAN  = isLight ? '102,68,221'  : '136,102,255';
  const C_PUR   = isLight ? '30,136,204'  : '68,170,255';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Pt() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - .5) * .45;
    this.vy = (Math.random() - .5) * .45;
    /* mix of small and slightly larger nodes */
    this.r  = Math.random() < .12
      ? Math.random() * 2 + 2       /* larger hub node */
      : Math.random() * 1.5 + 0.5;  /* regular node */
    this.o  = this.r > 2
      ? Math.random() * .5 + .35    /* hub nodes brighter */
      : Math.random() * .45 + .15;
  }

  Pt.prototype.update = function () {
    this.vx *= .982; this.vy *= .982;
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  };

  Pt.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${C_CYAN},${this.o})`;
    ctx.fill();
  };

  function connect() {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = dx * dx + dy * dy;
        if (d < CONN_DIST * CONN_DIST) {
          const dist = Math.sqrt(d);
          const a = (1 - dist / CONN_DIST) * .22;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(${C_CYAN},${a})`;
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    }
  }

  function connectMouse() {
    if (mouse.x == null) return;
    pts.forEach(p => {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 200) {
        const a = (1 - d / 200) * .3;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(${C_PUR},${a})`;
        ctx.lineWidth = .9;
        ctx.stroke();
      }
    });
  }

  function init() {
    const n = Math.min(Math.floor((W * H) / 22000), 55);
    pts = Array.from({ length: n }, () => new Pt());
  }

  let particleVisible = true;
  let particleRaf = null;

  let lastP = 0;
  function loop(now) {
    if (!particleVisible) { particleRaf = null; return; }
    particleRaf = requestAnimationFrame(loop);
    if (now - lastP < 33) return;   /* cap ~30fps */
    lastP = now;
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => { p.update(); p.draw(); });
    connect();
  }

  const heroEl = document.getElementById('home');
  if (heroEl) {
    new IntersectionObserver(([e]) => {
      particleVisible = e.isIntersecting;
      if (particleVisible && !particleRaf) loop();
      if (!particleVisible) ctx.clearRect(0, 0, W, H);
    }, { threshold: 0.05 }).observe(heroEl);
  }

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });

  resize(); init(); loop();
})();


/* ─── NAV ────────────────────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();


/* ─── MOBILE NAV ─────────────────────────────────────────────────── */
(function () {
  const burger = document.getElementById('burger');
  const links  = document.getElementById('nav-links');
  if (!burger || !links) return;
  burger.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('.nav__link').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
})();


/* ─── LANGUAGE SWITCH ────────────────────────────────────────────── */
(function () {
  const sw = document.getElementById('lang-sw');
  if (!sw) return;
  sw.querySelectorAll('.ls-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sw.querySelectorAll('.ls-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.body.classList.remove('l-en', 'l-zh');
      document.body.classList.add('l-' + btn.dataset.l);
      /* <option> can't be toggled via CSS — swap its text on language change */
      document.querySelectorAll('select option[data-en]').forEach(o => {
        o.textContent = btn.dataset.l === 'zh' ? o.dataset.zh : o.dataset.en;
      });
    });
  });
})();


/* ─── SCROLL REVEAL ──────────────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = +(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('on'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => io.observe(el));
})();


/* ─── COUNTER ANIMATION ──────────────────────────────────────────── */
(function () {
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +(el.dataset.target || 0);
      const start  = performance.now();
      const dur    = 1300;

      (function tick(now) {
        const t   = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(easeOut(t) * target);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      })(start);

      io.unobserve(el);
    });
  }, { threshold: .6 });

  document.querySelectorAll('.counter').forEach(el => io.observe(el));
})();


/* ─── 3D TILT ON SERVICE CARDS ───────────────────────────────────── */
(function () {
  document.querySelectorAll('.tilt').forEach(card => {
    let tilting = false;
    card.addEventListener('mousemove', e => {
      if (tilting) return;
      tilting = true;
      const cx = e.clientX, cy = e.clientY;
      requestAnimationFrame(() => {
        const r  = card.getBoundingClientRect();
        const rx = ((cy - r.top)  / r.height - .5) * -14;
        const ry = ((cx - r.left) / r.width  - .5) *  14;
        card.style.transition = 'transform .08s ease';
        card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
        tilting = false;
      });
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
})();


/* ─── ACTIVE NAV LINK ────────────────────────────────────────────── */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__link');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + entry.target.id
          ? '#fff' : '';
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));
})();


/* ─── CONTACT FORM ───────────────────────────────────────────────── */
(function () {
  const form = document.getElementById('cform');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent  = 'Sending…';
    btn.style.cssText = 'opacity:.7;pointer-events:none';

    const data = new FormData(form);
    try {
      const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        btn.textContent  = 'Sent ✓';
        btn.style.cssText = 'background:#00c87a;color:#fff;pointer-events:none';
        form.reset();
      } else {
        throw new Error('failed');
      }
    } catch {
      btn.textContent  = 'Failed — try WhatsApp instead';
      btn.style.cssText = 'background:#ff4444;color:#fff;pointer-events:none';
    }
    setTimeout(() => { btn.textContent = orig; btn.style.cssText = ''; }, 3500);
  });
})();


/* ─── CARD SPOTLIGHT ─────────────────────────────────────────────── */
(function () {
  document.querySelectorAll('.stat-card, .svc-card, .val-item').forEach(card => {
    const spl = document.createElement('span');
    spl.className = 'spl';
    card.appendChild(spl);

    let splPending = false;
    card.addEventListener('mousemove', e => {
      if (splPending) return;
      splPending = true;
      const cx = e.clientX, cy = e.clientY;
      requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = cx - r.left;
        const y = cy - r.top;
        spl.style.background =
          `radial-gradient(circle 220px at ${x}px ${y}px, rgba(136,102,255,.18), rgba(68,170,255,.06) 55%, transparent 75%)`;
        spl.style.opacity = '1';
        splPending = false;
      });
    });
    card.addEventListener('mouseleave', () => { spl.style.opacity = '0'; });
  });
})();


/* ─── CUSTOM CURSOR + MAGNETIC BUTTONS ──────────────────────────── */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.id = 'cur-dot'; ring.id = 'cur-ring';
  document.body.append(dot, ring);

  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  window.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

  (function tick() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    /* transform/translate3d → GPU compositing, no per-frame layout */
    dot.style.transform  = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  })();

  /* Cursor expand on interactives */
  document.querySelectorAll('a, button, .btn, input, select, textarea, .svc-card, .val-item, .stat-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('expand'));
    el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
  });

  /* Magnetic pull on buttons */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * .28;
      const dy = (e.clientY - (r.top  + r.height / 2)) * .28;
      btn.style.transform  = `translate(${dx}px, ${dy}px)`;
      btn.style.transition = 'transform .1s ease';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = '';
      btn.style.transition = 'all .55s cubic-bezier(.4,0,.2,1)';
    });
  });
})();


/* ─── THREE.JS HERO ──────────────────────────────────────────────── */
(function () {
  if (!window.THREE) return;
  const container = document.getElementById('hero3d');
  if (!container) return;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  container.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0.4, 5.2);
  camera.lookAt(0, 0, 0);

  /* ── lights ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const lP = new THREE.PointLight(0x8866ff, 6, 12);
  lP.position.set(-3, 3, 3); scene.add(lP);
  const lB = new THREE.PointLight(0x44aaff, 6, 12);
  lB.position.set(3, -2, 3); scene.add(lB);
  const lT = new THREE.PointLight(0xffffff, 1.5, 8);
  lT.position.set(0, 5, 2); scene.add(lT);

  /* ── glass material ── */
  const glassMat = (color, emissive) => new THREE.MeshPhongMaterial({
    color, emissive, specular: 0xbbccff, shininess: 220,
    transparent: true, opacity: 0.52
  });

  /* ── 3D X (two extruded bars) ── */
  const xGroup    = new THREE.Group();
  const xWireGrp  = new THREE.Group();
  const barGeo    = new THREE.BoxGeometry(0.42, 2.4, 0.42);
  const wireMat   = new THREE.MeshBasicMaterial({ color: 0x9977ff, wireframe: true, transparent: true, opacity: 0.18 });

  [Math.PI * 0.25, -Math.PI * 0.25].forEach(rz => {
    const m = new THREE.Mesh(barGeo, glassMat(0x5522cc, 0x220055));
    m.rotation.z = rz; xGroup.add(m);
    const w = new THREE.Mesh(barGeo, wireMat);
    w.rotation.z = rz; xWireGrp.add(w);
  });
  xGroup.position.y   = 0.3;
  xWireGrp.position.y = 0.3;
  scene.add(xGroup, xWireGrp);

  /* ── floating platform ── */
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.06, 1.4),
    new THREE.MeshPhongMaterial({ color: 0x3311aa, emissive: 0x110033, specular: 0xbbccff, shininess: 220, transparent: true, opacity: 0.2 })
  );
  platform.position.set(0, -1.3, 0);
  scene.add(platform);

  /* ── bar chart ── */
  const barChart = new THREE.Group();
  [{ h: 0.55, x: -0.3, c: 0x8866ff, e: 0x330088 },
   { h: 1.0,  x:  0,   c: 0x44aaff, e: 0x114488 },
   { h: 0.7,  x:  0.3, c: 0x8866ff, e: 0x330088 }].forEach(({ h, x, c, e }) => {
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, h, 8),
      glassMat(c, e)
    );
    cyl.position.set(x, h / 2 - 1.26, 0.55);
    barChart.add(cyl);
  });
  scene.add(barChart);


  /* ── small floating cubes ── */
  const floaters = [
    { pos: [ 1.6,  0.7, -0.2], size: 0.18, c: 0x44aaff },
    { pos: [ 1.3, -0.6,  0.5], size: 0.13, c: 0x8866ff },
    { pos: [-1.4, -0.5,  0.3], size: 0.15, c: 0x6644dd },
  ].map(({ pos, size, c }) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      glassMat(c, 0x110033)
    );
    m.position.set(...pos);
    scene.add(m);
    return { mesh: m, baseY: pos[1] };
  });

  /* ── orbital ring ── */
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.018, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.28 })
  );
  ring.rotation.x = Math.PI * 0.28;
  scene.add(ring);

  /* ── mouse ── */
  let tx = 0, ty = 0, lx = 0, ly = 0;
  document.addEventListener('mousemove', e => {
    tx = (e.clientX / window.innerWidth  - 0.5) * 1.8;
    ty = (e.clientY / window.innerHeight - 0.5) * 1.2;
  });

  function resize() { const s = container.clientWidth; renderer.setSize(s, s); }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let visible = true;
  let rafId   = null;
  const heroSection = document.getElementById('home');
  if (heroSection) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !rafId) loop();
    }, { threshold: 0.05 }).observe(heroSection);
  }

  let last3d = 0;
  function loop(now) {
    if (!visible) { rafId = null; return; }
    rafId = requestAnimationFrame(loop);
    if (now - last3d < 33) return;   /* cap ~30fps */
    last3d = now;
    const t = Date.now() * 0.001;
    lx += (tx - lx) * 0.04;
    ly += (ty - ly) * 0.04;

    const bob = Math.sin(t * 0.9) * 0.07;
    xGroup.rotation.y    = t * 0.18 + lx * 0.5;
    xGroup.position.y    = 0.3 + bob;
    xWireGrp.rotation.y  = xGroup.rotation.y;
    xWireGrp.position.y  = xGroup.position.y;

    platform.position.y  = -1.3 + Math.sin(t * 0.5)      * 0.03;

    floaters.forEach(({ mesh, baseY }, i) => {
      mesh.position.y = baseY + Math.sin(t * 0.7 + i * 1.8) * 0.12;
      mesh.rotation.x = t * 0.4 + i;
      mesh.rotation.y = t * 0.3 + i;
    });

    ring.rotation.z = t * 0.18;

    scene.rotation.y = lx * 0.35;
    scene.rotation.x = -ly * 0.22;

    renderer.render(scene, camera);
  }
  loop();
})();

/* ─── HERO SCROLL FADE ───────────────────────────────────────────── */
(function () {
  const hero = document.getElementById('home');
  const body = hero ? hero.querySelector('.hero__body') : null;
  const d3   = hero ? hero.querySelector('.hero__3d')   : null;
  if (!hero || !body) return;

  body.style.transition = 'none';
  if (d3) d3.style.transition = 'none';

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const progress = Math.min(window.scrollY / (hero.offsetHeight * 0.65), 1);
      const opacity  = 1 - progress;
      const scale    = 1 - progress * 0.1;
      const moveY    = progress * -40;
      body.style.opacity   = opacity;
      body.style.transform = `scale(${scale}) translateY(${moveY}px)`;
      if (d3) {
        d3.style.opacity   = opacity;
        d3.style.transform = `scale(${scale}) translateY(${moveY}px)`;
      }
      ticking = false;
    });
  }, { passive: true });
})();

/* ─── GLITCH ON HERO TITLE ───────────────────────────────────────── */
(function () {
  const h1 = document.querySelector('.hero__h1');
  if (!h1) return;

  function fire() {
    h1.classList.add('glitch-on');
    setTimeout(() => h1.classList.remove('glitch-on'), 580);
    setTimeout(fire, 3800 + Math.random() * 4200);
  }
  setTimeout(fire, 2500);
})();
