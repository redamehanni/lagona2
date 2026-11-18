/* wz-nocta : moteur de l'accueil. Bascule horaire, eau animée en WebGL, sélecteur de couleurs.
   Règles WiziShop : aucun guillemet double ni antislash, identifiants ASCII, garde contre la double exécution. */
(function () {
  var root = document.getElementById('nx-bascule');
  if (!root || root.dataset.pret) return;
  root.dataset.pret = '1';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var smooth = function (a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  // ---- eau : caustiques en WebGL, un contexte par canvas, rendu seulement à l'écran
  var FRAG = 'precision highp float;uniform vec2 R;uniform float T;uniform vec3 C;uniform float I;uniform float S;uniform vec2 W;' +
    'float k(vec2 u,float t){vec2 p=mod(u*6.28318,6.28318)-250.0;vec2 i=p;float c=1.0;' +
    'for(int n=0;n<5;n++){float s=t*(1.0-(3.5/float(n+1)));i=p+vec2(cos(s-i.x)+sin(s+i.y),sin(s-i.y)+cos(s+i.x));' +
    'c+=1.0/length(vec2(p.x/(sin(i.x+s)/0.005),p.y/(cos(i.y+s)/0.005)));}c/=5.0;c=1.17-pow(c,1.4);return pow(abs(c),8.0);}' +
    'void main(){vec2 u=gl_FragCoord.xy/R.y*S+W;float t=T*0.32+23.0;float v=clamp(k(u,t)*0.75+k(u*1.35+0.37,t*0.8+3.1)*0.45,0.0,1.6);' +
    'gl_FragColor=vec4((C*(0.1+v*0.95)+vec3(v*v*0.22))*I,1.0);}';

  function Water(cv, rgb, scale) {
    var o = { col: rgb.slice(), tgt: rgb.slice(), inten: 1, warp: [0, 0], on: false, ok: false, raf: 0 };
    var gl = cv.getContext('webgl', { antialias: false });
    if (!gl) return o;
    var pr = gl.createProgram();
    [[gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}'], [gl.FRAGMENT_SHADER, FRAG]].forEach(function (d) {
      var s = gl.createShader(d[0]); gl.shaderSource(s, d[1]); gl.compileShader(s); gl.attachShader(pr, s);
    });
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['R', 'T', 'C', 'I', 'S', 'W'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    var t0 = performance.now();
    o.ok = true;
    o.draw = function () {
      var r = Math.min(devicePixelRatio || 1, 1.5) * 0.6;
      var w = Math.max(2, Math.round(cv.clientWidth * r)), h = Math.max(2, Math.round(cv.clientHeight * r));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      for (var i = 0; i < 3; i++) o.col[i] += (o.tgt[i] - o.col[i]) * 0.06;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.R, w, h); gl.uniform1f(U.T, reduce ? 4 : (performance.now() - t0) / 1000);
      gl.uniform3fv(U.C, o.col); gl.uniform1f(U.I, o.inten); gl.uniform1f(U.S, scale); gl.uniform2fv(U.W, o.warp);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    o.kick = function () {
      if (o.raf) return;
      var loop = function () { o.raf = 0; o.draw(); if (o.on && !reduce) o.raf = requestAnimationFrame(loop); };
      o.raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(function (e) { o.on = e[0].isIntersecting; if (o.on) o.kick(); }, { rootMargin: '120px' }).observe(cv);
    return o;
  }
  var hex = function (h) { var n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

  // ---- en-tête collant : la scène épinglée commence sous lui
  function headerTop() {
    var hd = document.querySelector('#header, .header');
    var top = 0;
    if (hd) { var p = getComputedStyle(hd).position; if (p === 'fixed' || p === 'sticky') top = hd.getBoundingClientRect().height; }
    root.style.setProperty('--nx-top', top + 'px');
  }
  headerTop(); addEventListener('resize', headerTop);

  // ---- bascule : la progression du scroll fait l'heure, la nuit, la lampe et l'eau
  var stage = root.querySelector('.nx-bascule__stage');
  var clock = root.querySelector('.nx-clock__t');
  var sun = root.querySelector('.nx-clock__arc');
  var glow = root.querySelector('.nx-bascule__glow');
  var night = root.querySelector('.nx-bascule__night');
  var lines = [].slice.call(root.querySelectorAll('.nx-line'));
  var water = Water(root.querySelector('.nx-bascule__water'), [0.38, 0.86, 1], 1.25);
  var hero = document.getElementById('nx-hero');
  var layers = hero ? [].slice.call(hero.querySelectorAll('[data-depth]')) : [];
  var T0 = 17 * 60 + 40, T1 = 22 * 60;
  var hhmm = function (m) { m = Math.round(m); var h = Math.floor(m / 60), n = m % 60; return (h < 10 ? '0' : '') + h + ':' + (n < 10 ? '0' : '') + n; };

  // la lueur se pose sur le cube de la photo de nuit, quel que soit le recadrage
  function placeGlow() {
    var iw = night.naturalWidth, ih = night.naturalHeight, W = stage.clientWidth, H = stage.clientHeight;
    if (!iw || !W) return;
    var s = Math.max(W / iw, H / ih), fx = parseFloat(getComputedStyle(night).objectPosition) / 100 || 0.5;
    glow.style.setProperty('--lx', Math.round((W - iw * s) * fx + 0.742 * iw * s) + 'px');
    glow.style.setProperty('--ly', Math.round((H - ih * s) / 2 + 0.74 * ih * s) + 'px');
  }
  night.addEventListener('load', placeGlow); addEventListener('resize', placeGlow); placeGlow();

  // ---- haut de page : horloge au centre, qui traverse toute la page (17:40, 22:00, puis 07:12 le lendemain)
  var bar = document.querySelector('#header .header__relative');
  var hclock = null, hphase = null, buy = document.getElementById('nx-commander');
  var darks = [].slice.call(document.querySelectorAll('.nx-mat,.nx-amb,.nx-use'));
  if (bar && !bar.querySelector('.nx-hclock')) {
    hclock = document.createElement('p'); hclock.className = 'nx-hclock'; hclock.setAttribute('aria-hidden', 'true');
    hclock.innerHTML = '<span>17:40</span><small>fin d’après-midi</small>';
    bar.appendChild(hclock); hphase = hclock.querySelector('small'); hclock = hclock.querySelector('span');
  }
  var phase = function (m) {
    var h = (m / 60) % 24;
    return h >= 17 && h < 18.75 ? 'fin d’après-midi' : h >= 18.75 && h < 20.75 ? 'crépuscule' : h >= 20.75 || h < 5.5 ? 'nuit' : 'matin';
  };
  var header = document.getElementById('header');
  function headerState(p, nt) {
    if (!header) return;
    var y = scrollY, vh = innerHeight, rt = root.getBoundingClientRect(), mins = T0;
    var endB = y + rt.bottom - vh;
    if (rt.top <= 0) mins = T0 + (T1 - T0) * smooth(0, 0.86, p);
    if (y > endB && buy) mins = T1 + (31 * 60 + 12 - T1) * smooth(endB, Math.max(endB + 1, y + buy.getBoundingClientRect().top - vh * 0.4), y);
    if (hclock) { var t = hhmm(mins % 1440); if (hclock.textContent !== t) { hclock.textContent = t; hphase.textContent = phase(mins); } }
    var dark = rt.top <= 40 && rt.bottom > 40 ? nt > 0.45 : darks.some(function (s) { var r = s.getBoundingClientRect(); return r.top <= 40 && r.bottom > 40; });
    header.classList.toggle('nx-night', dark);
  }

  var last = -1;
  function frame() {
    var y = scrollY, vh = innerHeight;
    if (!reduce && y < vh * 1.4) layers.forEach(function (el) { el.style.transform = 'translate3d(0,' + (-y * parseFloat(el.dataset.depth)).toFixed(1) + 'px,0)'; });
    var r = root.getBoundingClientRect();
    var travel = Math.max(1, root.offsetHeight - stage.offsetHeight);
    var p = clamp01(-r.top / travel);
    if (r.bottom > 0 && r.top < vh && Math.abs(p - last) > 0.0005) {
      last = p;
      var nt = smooth(0.2, 0.5, p), fl = smooth(0.46, 0.72, p);
      var lamp = smooth(0.4, 0.46, p) * (p < 0.47 && !reduce ? 0.85 + 0.15 * Math.sin(p * 900) : 1);
      stage.style.setProperty('--dusk', smooth(0.04, 0.34, p).toFixed(3));
      root.style.setProperty('--night', nt.toFixed(3));
      stage.style.setProperty('--lamp', lamp.toFixed(3));
      stage.style.setProperty('--flood', fl.toFixed(3));
      var q = smooth(0, 0.86, p);
      sun.style.setProperty('--sun', q.toFixed(3));
      var t = hhmm(T0 + (T1 - T0) * q);
      if (clock.textContent !== t) clock.textContent = t;
      lines.forEach(function (l) { var a = l.dataset.at.split(' '); l.classList.toggle('is-on', p >= +a[0] && p < +a[1]); });
      water.warp = [0, -p * 0.6];
      if (fl > 0.01 && water.ok) water.kick();
    }
    headerState(p, smooth(0.2, 0.5, p));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---- ambiances : 16 couleurs, plafond, aperçu de la lampe le plus proche, trois modes
  var amb = document.getElementById('nx-amb');
  if (!amb) return;
  var COLORS = [['Corail', '#FF5466'], ['Menthe', '#2EE59D'], ['Saphir', '#3D5BFF'], ['Abricot', '#FF9A3D'], ['Lagon', '#5CD6FF'], ['Turquoise', '#22D3C5'], ['Orchidée', '#F45BD6'], ['Lavande', '#9B7BFF'], ['Soleil', '#FFD23F'], ['Tilleul', '#B6F04A'], ['Glacier', '#9FF7FF'], ['Pivoine', '#FF6FA8'], ['Lune', '#EEF1FF'], ['Améthyste', '#B04DFF'], ['Ambre', '#FFB347'], ['Ciel', '#6FA8FF']];
  var TINT = { Lagon: 'lagon', Turquoise: 'lagon', Glacier: 'lagon', Ciel: 'lagon', Menthe: 'lagon', Lavande: 'lavande', 'Améthyste': 'lavande', 'Orchidée': 'lavande', Saphir: 'lavande', Ambre: 'ambre', Abricot: 'ambre', Soleil: 'ambre', Corail: 'ambre' };
  var ceil = Water(amb.querySelector('.nx-amb__ceil'), hex('#5CD6FF'), 1.05);
  var sw = amb.querySelector('.nx-sw'), nameEl = amb.querySelector('.nx-amb__name');
  var shots = [].slice.call(amb.querySelectorAll('.nx-amb__shot img'));
  var cur = 4, mode = 'fixe', timer = 0;
  COLORS.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', c[0]); b.style.setProperty('--c', c[1]);
    b.addEventListener('click', function () { setMode('fixe'); pick(i); });
    sw.appendChild(b);
  });
  var btns = [].slice.call(sw.children);
  function pick(i, focus) {
    cur = (i + COLORS.length) % COLORS.length;
    var c = COLORS[cur];
    btns.forEach(function (b, k) { b.setAttribute('aria-checked', k === cur); b.tabIndex = k === cur ? 0 : -1; });
    if (focus) btns[cur].focus();
    nameEl.textContent = c[0];
    amb.style.setProperty('--amb', c[1]);
    ceil.tgt = hex(c[1]); if (ceil.ok) ceil.kick();
    var t = TINT[c[0]];
    if (t) shots.forEach(function (im) { im.classList.toggle('is-on', im.dataset.tint === t); });
  }
  sw.addEventListener('keydown', function (e) {
    var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (d) { e.preventDefault(); setMode('fixe'); pick(cur + d, true); }
  });
  var chips = [].slice.call(amb.querySelectorAll('.nx-chip'));
  function setMode(m) {
    mode = m; clearInterval(timer); ceil.inten = 1;
    chips.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mode === m); });
    if (m === 'fondu') timer = setInterval(function () { pick(cur + 1); }, reduce ? 4000 : 1800);
  }
  chips.forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });
  (function breathe() {
    if (mode === 'respire') { ceil.inten = 0.35 + 0.65 * (0.55 + 0.45 * Math.sin(performance.now() / 1100)); if (ceil.ok) ceil.kick(); }
    requestAnimationFrame(breathe);
  })();
  pick(cur);
})();
