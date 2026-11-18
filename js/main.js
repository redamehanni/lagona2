// Nocta : orchestration de la page.
// Le moteur scrollcraft pilote les actes. Tout ce qui est propre à Nocta vit ici :
// emplacements d'images, profondeur du hero, la bascule horaire, le plafond, le panier.
import { Caustics, hexToRgb } from './caustics.js';
import { Cube } from './cube.js';
import { PRODUCT, cart, money, mountDrawer } from './shop.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ---- emplacements d'images --------------------------------------------------
// Chaque <figure class="slot" data-src="assets/img/xx-nom"> essaie .webp, .jpg, .png, .jpeg.
// Le premier fichier trouvé remplace le placeholder. Aucun fichier : le placeholder reste.
const EXT = ['webp', 'jpg', 'png', 'jpeg'];
function fillSlot(fig) {
  const img = fig.querySelector('img');
  const base = fig.dataset.src;
  if (!img || !base) return;
  let i = 0;
  const next = () => {
    if (i >= EXT.length) { fig.classList.add('is-empty'); img.removeAttribute('src'); return; }
    img.src = `${base}.${EXT[i++]}`;
  };
  img.addEventListener('load', () => { fig.classList.remove('is-empty'); fig.classList.add('is-filled'); });
  img.addEventListener('error', next);
  img.decoding = 'async';
  fig.classList.add('is-empty');
  next();
}
// Chargement différé maison : le loading="lazy" natif ne se déclenche pas de façon fiable
// sous les scènes épinglées, l'image restait demandée mais jamais téléchargée.
const lazy = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { lazy.unobserve(e.target); fillSlot(e.target); }
}, { rootMargin: '900px 0px' });
document.querySelectorAll('.slot').forEach((fig) => {
  if (fig.closest('.hero, .bascule')) fillSlot(fig);
  else { fig.classList.add('is-empty'); lazy.observe(fig); }
});

// ---- vidéo de la bascule (05), si elle existe -------------------------------
async function probeVideo(v) {
  let src = v?.dataset.pendingSrc;
  if (!src || location.protocol === 'file:') return false;
  // version allégée pour les petits écrans, si elle existe
  if (matchMedia('(max-width: 860px)').matches && v.dataset.pendingSrcMobile) src = v.dataset.pendingSrcMobile;
  try {
    const r = await fetch(src, { method: 'HEAD' });
    if (!r.ok || !(r.headers.get('content-type') || '').startsWith('video')) return false;
    // blob : on peut chercher n'importe quelle image sans dépendre des requêtes Range du serveur
    const blob = await (await fetch(src)).blob();
    v.src = URL.createObjectURL(blob);
    await new Promise((res) => { v.addEventListener('loadedmetadata', res, { once: true }); v.load(); });
    v.classList.add('is-live');
    v.closest('[data-bascule]')?.classList.add('has-video');
    return true;
  } catch (e) { return false; }
}

// ---- démarrage --------------------------------------------------------------
const basculeVideo = document.querySelector('.bascule__video');
const sc = window.ScrollCraft.mount(document.body);
const actOf = (el) => sc.acts.find((a) => a.el === el);
let videoReady = false;
if (!reduce) probeVideo(basculeVideo).then((ok) => { videoReady = ok; if (!ok) basculeVideo?.remove(); });
else basculeVideo?.remove();

// ---- hero : profondeur par couche --------------------------------------------
const heroLayers = [...document.querySelectorAll('[data-hero] [data-depth]')];
const hero = document.querySelector('.hero');

// ---- bascule ----------------------------------------------------------------
const bascule = document.getElementById('bascule');
const bStage = bascule.querySelector('[data-bascule]');
const clockEl = bascule.querySelector('[data-clock]');
const sunEl = bascule.querySelector('[data-sunpos]');
const waterCanvas = bascule.querySelector('.bascule__water');
const water = new Caustics(waterCanvas, { color: [0.38, 0.86, 1.0], scale: 1.25, intensity: 1 });

// La lueur animée se pose sur le cube de la photo 04 : position du cube dans l'image (fractions),
// convertie en pixels d'écran selon le recadrage object-fit: cover et le point focal --focus-x.
const LAMP_IN_IMAGE = [0.742, 0.74];
const glowEl = bascule.querySelector('.bascule__glow');
const nightImg = bascule.querySelector('.bascule__night img');
function placeGlow() {
  const iw = nightImg.naturalWidth, ih = nightImg.naturalHeight;
  const W = bStage.clientWidth, H = bStage.clientHeight;
  if (!iw || !W) return;
  const s = Math.max(W / iw, H / ih);
  const fx = parseFloat(getComputedStyle(nightImg).objectPosition) / 100 || 0.5;
  const ox = (W - iw * s) * fx, oy = (H - ih * s) / 2;
  glowEl.style.setProperty('--lamp-x', `${(ox + LAMP_IN_IMAGE[0] * iw * s).toFixed(0)}px`);
  glowEl.style.setProperty('--lamp-y', `${(oy + LAMP_IN_IMAGE[1] * ih * s).toFixed(0)}px`);
}
nightImg.addEventListener('load', placeGlow);
new ResizeObserver(placeGlow).observe(bStage);

const T0 = 17 * 60 + 40;   // 17:40
const T1 = 22 * 60;        // 22:00
const TM = 31 * 60 + 12;   // 07:12 le lendemain
const hhmm = (m) => {
  m = Math.round(m) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const phase = (m) => {
  const h = (m / 60) % 24;
  if (h >= 17 && h < 18.75) return 'fin d’après-midi';
  if (h >= 18.75 && h < 20.75) return 'crépuscule';
  if (h >= 20.75 || h < 5.5) return 'nuit';
  return 'matin';
};

// ---- barre : heure et thème --------------------------------------------------
const bar = document.querySelector('[data-bar]');
const navClock = bar.querySelector('[data-navclock]');
const navPhase = bar.querySelector('[data-navphase]');
const themed = [...document.querySelectorAll('main > section[data-theme]')];
const buy = document.getElementById('commander');

let lastClock = '';
function frame() {
  const y = scrollY, vh = innerHeight;

  // hero : chaque couche glisse à sa vitesse, l'avant-plan file plus vite que le fond
  if (!reduce && y < vh * 1.4) {
    for (const el of heroLayers) {
      const d = parseFloat(el.dataset.depth);
      el.style.transform = `translate3d(0, ${(-y * d).toFixed(1)}px, 0)` + (el.classList.contains('hero__fore') ? ` scale(${1 + y / vh * 0.08})` : '');
    }
    hero.style.setProperty('--hero-out', clamp01(y / vh).toFixed(3));
  }

  // bascule : progression de l'acte → heure, lumière, lampe, eau
  const a = actOf(bascule);
  const p = a ? a.p : 0;
  const dusk = smooth(0.04, 0.34, p);
  const night = smooth(0.2, 0.5, p);
  const lamp = smooth(0.4, 0.46, p) * (p < 0.47 && !reduce ? 0.85 + 0.15 * Math.sin(p * 900) : 1);
  const flood = smooth(0.46, 0.72, p);
  bStage.style.setProperty('--dusk', dusk.toFixed(3));
  bStage.style.setProperty('--night', night.toFixed(3));
  bStage.style.setProperty('--lamp', lamp.toFixed(3));
  bStage.style.setProperty('--flood', flood.toFixed(3));
  water.warp = [0, -p * 0.6];
  if (flood > 0.01) water.kick();
  const minutes = T0 + (T1 - T0) * smooth(0, 0.86, p);
  const t = hhmm(minutes);
  if (t !== clockEl.textContent) clockEl.textContent = t;
  sunEl.style.setProperty('--sun', smooth(0, 0.86, p).toFixed(3));
  if (videoReady && basculeVideo.duration) {
    // la vidéo suit la même progression que l'horloge : elle finit sur la nuit pile à 22:00
    const target = Math.min(1, p / 0.86) * (basculeVideo.duration - 0.05);
    // un seul seek à la fois : on vise directement la cible dès que le décodeur est libre,
    // le GOP dense de l'encodage rend chaque saut rapide et la molette ne prend plus de retard
    const cur = basculeVideo.currentTime;
    if (Math.abs(target - cur) > 0.03 && !basculeVideo.seeking) basculeVideo.currentTime = Math.abs(target - cur) > 0.4 ? target : cur + (target - cur) * 0.5;
  }

  // l'heure de la barre traverse toute la page : 17:40 → 22:00 dans la bascule, puis la nuit passe jusqu'au matin
  let navMin = T0;
  if (a) {
    const endB = a.top + a.height - vh;
    if (y >= a.top) navMin = minutes;
    if (y > endB) navMin = T1 + (TM - T1) * smooth(endB, Math.max(buy.offsetTop - vh * 0.4, endB + 1), y);
  }
  const navT = hhmm(navMin);
  if (navT !== lastClock) {
    lastClock = navT;
    navClock.textContent = navT;
    navPhase.textContent = phase(navMin);
  }

  // thème de la barre : la section sous elle, la bascule bascule avec sa propre nuit
  let theme = 'day';
  for (const s of themed) {
    const r = s.getBoundingClientRect();
    if (r.top <= 40 && r.bottom > 40) { theme = s === bascule ? (night > 0.45 ? 'night' : 'day') : s.dataset.theme; break; }
  }
  if (bar.dataset.theme !== theme) bar.dataset.theme = theme;

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---- ambiances : 16 couleurs, plafond WebGL, cube 3D -------------------------
const COLORS = [
  ['Corail', '#FF5466'], ['Menthe', '#2EE59D'], ['Saphir', '#3D5BFF'], ['Abricot', '#FF9A3D'],
  ['Lagon', '#5CD6FF'], ['Turquoise', '#22D3C5'], ['Orchidée', '#F45BD6'], ['Lavande', '#9B7BFF'],
  ['Soleil', '#FFD23F'], ['Tilleul', '#B6F04A'], ['Glacier', '#9FF7FF'], ['Pivoine', '#FF6FA8'],
  ['Lune', '#EEF1FF'], ['Améthyste', '#B04DFF'], ['Ambre', '#FFB347'], ['Ciel', '#6FA8FF'],
];
const amb = document.getElementById('ambiances');
const ceiling = new Caustics(amb.querySelector('[data-ceiling]'), { color: hexToRgb('#5CD6FF'), scale: 1.05, intensity: 1 });
const cube = new Cube(amb.querySelector('[data-cube]'), { color: '#5CD6FF' });
const swWrap = amb.querySelector('[data-swatches]');
const nameEl = amb.querySelector('[data-amb-name]');
const dotEl = amb.querySelector('[data-amb-dot]');
let current = 4;

COLORS.forEach(([name, hex], i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'swatch';
  b.setAttribute('role', 'radio');
  b.setAttribute('aria-label', name);
  b.style.setProperty('--c', hex);
  b.addEventListener('click', () => { setMode('fixe'); pick(i); });
  swWrap.appendChild(b);
});
const swatches = [...swWrap.children];

function pick(i, fromKeys) {
  current = (i + COLORS.length) % COLORS.length;
  const [name, hex] = COLORS[current];
  swatches.forEach((s, k) => {
    const on = k === current;
    s.setAttribute('aria-checked', on);
    s.tabIndex = on ? 0 : -1;
  });
  if (fromKeys) swatches[current].focus();
  nameEl.textContent = name;
  dotEl.style.background = hex;
  amb.style.setProperty('--amb', hex);
  ceiling.setColor(hexToRgb(hex));
  cube.setColor(hex);
  // l'aperçu de la section achat suit la couleur choisie ici, quand une photo proche existe
  const t = TINT_OF[name];
  if (t && tintReady) setTint(t);
}
const TINT_OF = {
  Lagon: 'lagon', Turquoise: 'lagon', Glacier: 'lagon', Ciel: 'lagon',
  Lavande: 'lavande', Améthyste: 'lavande', Orchidée: 'lavande',
  Ambre: 'ambre', Abricot: 'ambre', Soleil: 'ambre',
};
swWrap.addEventListener('keydown', (e) => {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (step) { e.preventDefault(); setMode('fixe'); pick(current + step, true); }
});
pick(current);

// modes : fixe, respiration (l'intensité monte et descend), fondu (les 16 couleurs défilent)
let mode = 'fixe', modeTimer = 0;
const modeBtns = [...amb.querySelectorAll('[data-mode]')];
function setMode(m) {
  mode = m;
  modeBtns.forEach((b) => { const on = b.dataset.mode === m; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
  clearInterval(modeTimer);
  ceiling.intensity = 1;
  cube.setOn(1);
  if (m === 'fondu') modeTimer = setInterval(() => pick(current + 1), reduce ? 4000 : 1800);
}
modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
(function breathe() {
  if (mode === 'respire') {
    const k = 0.55 + 0.45 * Math.sin(performance.now() / 1100);
    ceiling.intensity = 0.35 + 0.65 * k;
    cube.setOn(0.3 + 0.7 * k);
    ceiling.kick();
  }
  requestAnimationFrame(breathe);
})();

// ---- achat : aperçus de couleur ----------------------------------------------
const tintImgs = [...document.querySelectorAll('.buy__tint')];
const tintBtns = [...document.querySelectorAll('[data-tint-btn]')];
function setTint(t) {
  buy.dataset.tint = t;
  tintImgs.forEach((img) => img.classList.toggle('is-on', img.dataset.tint === t));
  tintBtns.forEach((b) => {
    const on = b.dataset.tintBtn === t;
    b.setAttribute('aria-checked', on);
    b.tabIndex = on ? 0 : -1;
  });
}
tintBtns.forEach((b) => b.addEventListener('click', () => setTint(b.dataset.tintBtn)));
document.querySelector('[data-tint-group]').addEventListener('keydown', (e) => {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (!step) return;
  e.preventDefault();
  const i = tintBtns.findIndex((b) => b.dataset.tintBtn === buy.dataset.tint);
  const next = tintBtns[(i + step + tintBtns.length) % tintBtns.length];
  setTint(next.dataset.tintBtn);
  next.focus();
});
setTint('lagon');
// var et non let : pick() s'exécute au démarrage, avant cette ligne, et doit lire undefined sans planter
var tintReady = true;

// ---- achat ------------------------------------------------------------------
document.querySelectorAll('[data-price]').forEach((el) => { el.textContent = money(PRODUCT.price); });
if (PRODUCT.compareAt) document.querySelectorAll('[data-compare]').forEach((el) => { el.textContent = money(PRODUCT.compareAt); el.hidden = false; });

const form = document.querySelector('[data-buy]');
const qtyOut = form.querySelector('[data-qty-out]');
const added = document.querySelector('[data-added]');
let qty = 1;
form.addEventListener('click', (e) => {
  const b = e.target.closest('[data-qty]');
  if (!b) return;
  qty = Math.max(1, Math.min(9, qty + parseInt(b.dataset.qty, 10)));
  qtyOut.textContent = qty;
});
const drawer = mountDrawer();
form.addEventListener('submit', (e) => {
  e.preventDefault();
  cart.add(qty);
  added.hidden = false;
  drawer?.open();
});
