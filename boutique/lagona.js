// LAGONA — vitrine statique. Catalogue, panier et favoris vivent dans ce fichier et dans le navigateur.

const IMG = 'img/';
const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const money = (n) => eur.format(n);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const FREE_SHIP = 150;

const PRODUCTS = [
  { id: 'alba', name: 'Canapé Alba', price: 1490, img: 'p-alba', alt: 'room-salon', mat: 'Lin lavé, structure en hêtre', cats: ['salon', 'mobilier'], materials: ['Lin'], styles: ['Minimaliste', 'Méditerranéen'], tones: ['Sable', 'Ivoire'], tabs: ['new', 'best'], badge: 'Nouveau', rank: 1,
    colors: [['Avoine', '#D9CDB8'], ['Sable', '#C9B79C'], ['Ivoire', '#EEE7DB']],
    desc: 'Des assises profondes, des coussins généreux et un lin lavé qui prend le pli de la vie. Alba se pose bas, comme une invitation à rester.' },
  { id: 'selene', name: 'Fauteuil Sélène', price: 790, img: 'p-selene', alt: 'selene-situ', mat: 'Bouclette de laine, socle chêne', cats: ['salon', 'chambre', 'mobilier'], materials: ['Bouclé', 'Chêne'], styles: ['Organique', 'Sculptural'], tones: ['Ivoire', 'Sable', 'Olive'], tabs: ['love', 'best'], badge: 'Coup de cœur', rank: 2,
    colors: [['Ivoire', '#EFE8DC'], ['Sable', '#D8C7AE'], ['Olive', '#8A8766']],
    gallery: ['p-selene', 'selene-situ', 'selene-detail', 'col-oliva'], variantImg: { Olive: 3 },
    desc: 'Une silhouette enveloppante, des lignes organiques et une texture bouclette douce. Le fauteuil Sélène invite à ralentir et à retrouver le plaisir des choses simples.' },
  { id: 'arco', name: 'Table Arco', price: 890, img: 'p-arco', alt: 'tex-bois-pierre', mat: 'Chêne massif huilé', cats: ['salon', 'mobilier'], materials: ['Chêne'], styles: ['Sculptural', 'Japandi'], tones: ['Sable'], tabs: ['new'], rank: 5,
    colors: [['Chêne naturel', '#C29A6A'], ['Chêne fumé', '#6E5442']],
    desc: 'Un plateau rond posé sur une arche d’un seul tenant. Arco joue de la courbe et du plein, taillée dans un chêne qui se patine au fil des saisons.' },
  { id: 'luna', name: 'Lampe Luna', price: 249, img: 'p-luna', mat: 'Verre opalin, socle travertin', cats: ['luminaires', 'chambre'], materials: ['Verre', 'Travertin'], styles: ['Organique', 'Minimaliste'], tones: ['Ivoire'], tabs: ['best', 'love'], badge: 'Best-seller', rank: 3,
    colors: [['Opale', '#F3EEE6'], ['Travertin', '#D8CBB6']],
    desc: 'Un dôme de verre opalin posé sur un pied de travertin brut. Allumée, Luna diffuse une lumière de fin de journée, douce et sans éblouissement.' },
  { id: 'siena', name: 'Tapis Siena', price: 329, img: 'p-siena', alt: 'tex-laine', mat: 'Laine nouée main, 160 × 230 cm', cats: ['tapis', 'salon', 'chambre'], materials: ['Laine'], styles: ['Organique', 'Méditerranéen'], tones: ['Ivoire', 'Sable'], tabs: ['new', 'best'], rank: 6,
    colors: [['Écru', '#EDE6D8'], ['Sable', '#D9C9B0']],
    desc: 'Des reliefs sculptés à la main dans une laine écrue, comme des lignes de sable laissées par le vent. Siena apporte au sol la douceur d’une matière vivante.' },
  { id: 'eiko', name: 'Chaise Eiko', price: 549, img: 'p-eiko', alt: 'room-sam', mat: 'Noyer massif, assise en corde de papier', cats: ['salle-a-manger', 'bureau', 'mobilier'], materials: ['Noyer'], styles: ['Japandi', 'Minimaliste'], tones: ['Noyer'], tabs: ['best', 'love'], rank: 4,
    colors: [['Noyer', '#5A4334'], ['Chêne', '#B9915F']],
    desc: 'Un dossier courbe, une assise tressée à la main, des pieds fins en noyer. Eiko est de ces chaises que l’on garde toute une vie.' },
  { id: 'solis', name: 'Miroir Solis', price: 299, img: 'p-solis', alt: 'room-entree', mat: 'Cadre en laiton vieilli, 90 × 110 cm', cats: ['decoration', 'entree'], materials: ['Laiton'], styles: ['Organique', 'Sculptural'], tones: ['Sable'], tabs: ['love', 'new'], badge: 'Nouveau', rank: 8,
    colors: [['Laiton', '#A88B5C']],
    desc: 'Une forme libre cerclée d’un fin jonc de laiton vieilli. Solis capte la lumière et adoucit les murs qu’il habite.' },
  { id: 'lino', name: 'Coussin Lino', price: 49, img: 'p-lino', alt: 'cat-salon', mat: 'Lin lavé, 50 × 50 cm', cats: ['textiles', 'salon', 'chambre'], materials: ['Lin'], styles: ['Méditerranéen', 'Minimaliste'], tones: ['Terracotta', 'Olive', 'Sable', 'Ivoire'], tabs: ['best'], rank: 7,
    colors: [['Terracotta', '#A76E50'], ['Olive', '#77745A'], ['Sable', '#D4C2AA'], ['Ivoire', '#EEE7DB']],
    desc: 'Un lin lavé à la pierre, souple dès le premier jour. Lino se décline dans les couleurs de la terre et du maquis.' },
  { id: 'forma', name: 'Suspension Forma', price: 369, img: 'p-forma', alt: 'light-suspension', mat: 'Papier de riz plissé, Ø 60 cm', cats: ['luminaires', 'salle-a-manger'], materials: ['Papier'], styles: ['Japandi', 'Sculptural'], tones: ['Ivoire'], tabs: ['new', 'love'], badge: 'Édition limitée', badgeTone: 'terra', rank: 9,
    colors: [['Naturel', '#EFE6D6']],
    desc: 'Des plis réguliers dans un papier de riz translucide. Forma transforme une simple ampoule en un halo doux, presque lunaire.' },
  { id: 'terra', name: 'Console Terra', price: 690, img: 'p-terra', alt: 'col-sabbia', mat: 'Travertin adouci', cats: ['mobilier', 'entree', 'salon'], materials: ['Travertin'], styles: ['Minimaliste', 'Méditerranéen'], tones: ['Sable'], tabs: ['best'], rank: 10,
    colors: [['Travertin', '#D7C8B1']],
    desc: 'Un bloc de travertin aux angles adoucis, creusé d’une ligne fine. Terra ancre une entrée ou un salon avec la présence tranquille de la pierre.' },
  { id: 'noma', name: 'Vase Noma', price: 89, img: 'p-noma', alt: 'cat-deco', mat: 'Grès tourné main', cats: ['decoration'], materials: ['Céramique'], styles: ['Organique', 'Méditerranéen'], tones: ['Sable', 'Terracotta'], tabs: ['new', 'love'], rank: 11,
    colors: [['Sable', '#D6CBB8'], ['Terracotta', '#A76E50']],
    desc: 'Un grès moucheté tourné à la main, à la panse large et asymétrique. Chaque Noma est unique, une simple branche suffit.' },
  { id: 'olia', name: 'Table d’appoint Olia', price: 249, img: 'p-olia', mat: 'Noyer massif cannelé', cats: ['salon', 'chambre', 'mobilier'], materials: ['Noyer'], styles: ['Sculptural', 'Méditerranéen'], tones: ['Noyer'], tabs: ['new'], rank: 12,
    colors: [['Noyer', '#5A4334']],
    desc: 'Un fût cannelé en noyer massif, un plateau épais. Olia trouve sa place à côté d’un fauteuil, d’un lit ou d’un canapé.' },
];
const byId = (id) => PRODUCTS.find((p) => p.id === id);

const CATS = [
  ['salon', 'Salon'], ['salle-a-manger', 'Salle à manger'], ['chambre', 'Chambre'], ['bureau', 'Bureau'],
  ['mobilier', 'Mobilier'], ['luminaires', 'Luminaires'], ['tapis', 'Tapis'], ['decoration', 'Décoration'],
  ['textiles', 'Textiles'], ['entree', 'Entrée'], ['exterieur', 'Extérieur'],
];
const catName = (k) => (CATS.find((c) => c[0] === k) || [k, k])[1];

const NAV = [
  ['Nouveautés', 'catalogue.html?tri=new', null, true],
  ['Salon', 'catalogue.html?c=salon', { cols: [['Assises', ['Canapés', 'Fauteuils', 'Poufs', 'Banquettes']], ['Tables', ['Tables basses', 'Tables d’appoint', 'Consoles']], ['Le salon de saison', ['Collection Casa', 'Collection Sabbia', 'Lumières du soir']]], img: 'cat-salon', t: 'Le salon, habité.', s: 'Lin, bouclette et bois massif.' }],
  ['Salle à manger', 'catalogue.html?c=salle-a-manger'],
  ['Chambre', 'catalogue.html?c=chambre'],
  ['Mobilier', 'catalogue.html?c=mobilier', { cols: [['Asseoir', ['Canapés', 'Fauteuils', 'Chaises', 'Tabourets']], ['Poser', ['Tables', 'Consoles', 'Tables d’appoint', 'Bancs']], ['Ranger', ['Buffets', 'Étagères', 'Commodes']]], img: 'p-terra', t: 'Console Terra', s: 'Travertin adouci, 690 €', href: 'produit.html?p=terra' }],
  ['Luminaires', 'catalogue.html?c=luminaires', { cols: [['Lumières', ['Suspensions', 'Lampes de table', 'Lampadaires', 'Appliques']], ['Autrement', ['Lampes portables', 'Bougies', 'Lumière d’ambiance']], ['Matières', ['Papier de riz', 'Verre opalin', 'Céramique']]], img: 'col-lumiere', t: 'Une lumière, une atmosphère.', s: 'La sélection du soir.' }],
  ['Tapis', 'catalogue.html?c=tapis'],
  ['Décoration', 'catalogue.html?c=decoration', { cols: [['Objets', ['Vases', 'Miroirs', 'Sculptures', 'Coupes']], ['Arts de la table', ['Céramiques', 'Verrerie', 'Linge de table']], ['Idées', ['À offrir', 'Moins de 100 €']]], img: 'cat-deco', t: 'Le beau, simplement.', s: 'Objets choisis, faits main.' }],
  ['Textiles', 'catalogue.html?c=textiles'],
  ['Inspirations', 'index.html#pieces'],
];

const ICON = {
  search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c1.2-3.8 4.1-5.6 7.5-5.6s6.3 1.8 7.5 5.6"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M5.5 8.5h13l-1 12h-11l-1-12Z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M3.5 8h17M3.5 16h17"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  truck: '<svg viewBox="0 0 24 24"><path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>',
  leaf: '<svg viewBox="0 0 24 24"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Zm0 0 7-7"/></svg>',
  insta: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".6"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M11 8.5c3-.5 4.4 1.2 4 3.2-.4 2-2.4 2.6-3.6 1.6M11.6 10l-1.8 7.5"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24"><path d="M14 4v10.5a3.5 3.5 0 1 1-3-3.5M14 4c.5 2.4 2.2 4 4.6 4.2"/></svg>',
};

// ---- state ------------------------------------------------------------------
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('lagona.' + k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('lagona.' + k, JSON.stringify(v)); } catch (e) { /* stockage bloqué */ } },
};
let cart = store.get('cart', []);
let wish = new Set(store.get('wish', []));
const cartQty = () => cart.reduce((n, l) => n + l.qty, 0);
const cartSub = () => cart.reduce((n, l) => n + l.qty * byId(l.id).price, 0);

function addToCart(id, color, qty = 1) {
  const p = byId(id);
  color = color || p.colors[0][0];
  const line = cart.find((l) => l.id === id && l.color === color);
  if (line) line.qty = Math.min(9, line.qty + qty); else cart.push({ id, color, qty });
  store.set('cart', cart);
  renderCart();
  openLayer('cart');
}
function toggleWish(id, btn) {
  if (wish.has(id)) wish.delete(id); else { wish.add(id); toast('Ajouté à vos favoris'); }
  store.set('wish', [...wish]);
  $$(`[data-wish="${id}"]`).forEach((b) => b.classList.toggle('is-on', wish.has(id)));
  if (btn) { btn.classList.remove('is-pop'); void btn.offsetWidth; btn.classList.add('is-pop'); }
  updateBadges();
}
function updateBadges() {
  const q = cartQty();
  $$('[data-count="cart"]').forEach((b) => { b.textContent = q; b.hidden = !q; });
  $$('[data-count="wish"]').forEach((b) => { b.textContent = wish.size; b.hidden = !wish.size; });
}
let toastT;
function toast(msg) {
  const t = $('.toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('is-on'), 2200);
}

// ---- chrome -----------------------------------------------------------------
function header() {
  const here = location.pathname.split('/').pop() + location.search;
  const nav = NAV.map(([label, href, mega, accent]) => {
    const m = mega ? `<div class="mega"><div class="wrap mega__in">
      ${mega.cols.map(([h, items]) => `<div class="mega__col"><h4>${h}</h4><ul>${items.map((i) => `<li><a href="${href}">${i}</a></li>`).join('')}</ul></div>`).join('')}
      <a class="mega__feat zoom" href="${mega.href || href}"><div class="ph"><img src="${IMG + mega.img}.jpg" alt="" loading="lazy"></div><div><p>${mega.t}</p><small>${mega.s}</small><span class="link">Découvrir <span class="arrow">→</span></span></div></a>
    </div></div>` : '';
    return `<div class="nav__item"><a class="nav__a${accent ? ' nav__a--accent' : ''}${here === href ? ' is-current' : ''}" href="${href}">${label}</a>${m}</div>`;
  }).join('');
  return `
  <div class="announce"><div class="announce__row"><span class="is-on">Livraison offerte dès 150 €</span><i>·</i><span>Retours gratuits sous 30 jours</span><i>·</i><span>Paiement en 3 fois sans frais</span></div></div>
  <header class="hd">
    <div class="wrap hd__top">
      <div class="hd__left">
        <button class="ic hd__burger" data-open="menu" aria-label="Ouvrir le menu">${ICON.menu}</button>
        <button class="hd__search" data-open="search" aria-label="Rechercher"><span class="ic">${ICON.search}</span><span>Rechercher</span></button>
      </div>
      <a class="logo" href="index.html" aria-label="LAGONA, accueil"><span class="logo__name">LAGONA</span><span class="logo__sub">MOBILIER · DÉCORATION · ART DE VIVRE</span></a>
      <div class="hd__right">
        <button class="ic" aria-label="Favoris" data-open="wishlist">${ICON.heart}<span class="ic__n" data-count="wish" hidden></span></button>
        <a class="ic ic--acc" href="#" aria-label="Mon compte" data-soon>${ICON.user}</a>
        <button class="ic" data-open="cart" aria-label="Panier">${ICON.bag}<span class="ic__n" data-count="cart" hidden></span></button>
      </div>
    </div>
    <nav class="nav wrap" aria-label="Principale">${nav}</nav>
  </header>
  <div class="mm" data-layer="menu" aria-hidden="true">
    <div class="mm__veil" data-close></div>
    <div class="mm__panel">
      <div class="mm__head"><span class="logo__name" style="font-size:22px">LAGONA</span><button class="x" data-close aria-label="Fermer">${ICON.close}</button></div>
      <ul class="mm__list">${NAV.map(([l, h], i) => `<li style="--i:${i}"><a href="${h}">${l}<small>${String(i + 1).padStart(2, '0')}</small></a></li>`).join('')}</ul>
      <div class="mm__foot"><a href="#" data-soon>Mon compte</a><a href="#" data-open="search">Rechercher</a></div>
    </div>
  </div>
  <div class="layer" data-layer="search" aria-hidden="true">
    <div class="layer__veil" data-close></div>
    <div class="search__panel">
      <div class="wrap search__bar">${ICON.search.replace('<svg', '<svg class="s"')}<input type="search" placeholder="Que cherchez-vous ?" aria-label="Rechercher un produit" data-q><button class="x" data-close aria-label="Fermer">${ICON.close}</button></div>
      <div class="wrap search__body">
        <div><h6>Catégories</h6><ul>${['salon', 'chambre', 'luminaires', 'tapis', 'decoration', 'textiles'].map((c) => `<li><a href="catalogue.html?c=${c}">${catName(c)}</a></li>`).join('')}</ul></div>
        <div><h6>Recherches populaires</h6><ul>${['Bouclette', 'Travertin', 'Lin lavé', 'Suspension', 'Noyer', 'Céramique'].map((t) => `<li><button data-term="${t}">${t}</button></li>`).join('')}</ul></div>
        <div><h6 data-res-h>Pièces suggérées</h6><div class="search__res" data-res></div></div>
      </div>
    </div>
  </div>
  <div class="layer" data-layer="cart" aria-hidden="true">
    <div class="layer__veil" data-close></div>
    <aside class="cart__panel" role="dialog" aria-label="Panier">
      <div class="cart__head"><h3>Votre panier<sup data-cart-n></sup></h3><button class="x" data-close aria-label="Fermer">${ICON.close}</button></div>
      <div class="cart__ship" data-ship></div>
      <div class="cart__lines" data-lines></div>
      <div class="cart__foot" data-cart-foot>
        <div class="cart__sum"><span>Sous-total</span><strong data-sub></strong></div>
        <p class="cart__note">Taxes incluses. Livraison calculée à l’étape suivante. Paiement en 3 fois sans frais disponible.</p>
        <button class="btn btn--wide" data-checkout>Passer commande</button>
        <div class="cart__pay"><span>VISA</span><span>MASTERCARD</span><span>CB</span><span>APPLE PAY</span><span>3× SANS FRAIS</span></div>
      </div>
    </aside>
  </div>
  <div class="toast" role="status"></div>`;
}

function footer() {
  const col = (t, items) => `<div><h5>${t}</h5><ul>${items.map((i) => `<li><a href="#" data-soon>${i}</a></li>`).join('')}</ul></div>`;
  return `
  <section class="news">
    <div class="wrap rv">
      <span class="label">La lettre LAGONA</span>
      <h2 class="display display--md">Quelques inspirations, <em>de temps en temps.</em></h2>
      <p class="lede">Nos nouvelles collections, nos coups de cœur et des idées pour habiter autrement.</p>
      <form class="news__form" data-news><input type="email" placeholder="Votre adresse e-mail" aria-label="Adresse e-mail" required><button type="submit">S’inscrire</button></form>
      <p class="news__ok" data-news-ok aria-live="polite"></p>
      <p class="news__legal">Une lettre par mois, jamais plus. Désinscription en un clic.</p>
    </div>
  </section>
  <footer class="ft">
    <div class="wrap">
      <div class="ft__top">
        <div class="ft__brand"><span class="logo__name">LAGONA</span><p>Le calme prend forme.</p></div>
        ${col('La maison', ['Notre histoire', 'Notre vision', 'Nos inspirations', 'Nos artisans'])}
        ${col('Service client', ['Contact', 'Livraison', 'Retours', 'FAQ'])}
        ${col('Informations', ['Mentions légales', 'Politique de confidentialité', 'Conditions générales', 'Cookies'])}
        <div class="ft__news"><h5>Restons en lien</h5><p>Les nouvelles pièces, avant tout le monde.</p>
          <form data-news><input type="email" placeholder="Adresse e-mail" aria-label="Adresse e-mail" required><button type="submit">OK</button></form>
          <div class="ft__social"><a href="#" aria-label="Instagram">${ICON.insta}</a><a href="#" aria-label="Pinterest">${ICON.pin}</a><a href="#" aria-label="TikTok">${ICON.tiktok}</a></div>
        </div>
      </div>
      <p class="ft__word" aria-hidden="true">LAGONA</p>
      <div class="ft__bot"><span>© 2026 LAGONA — L’art d’habiter.</span><div class="pay"><span>VISA</span><span>MC</span><span>CB</span><span>AMEX</span><span>PAYPAL</span><span>APPLE PAY</span></div></div>
    </div>
  </footer>`;
}

// ---- layers -----------------------------------------------------------------
let lastFocus = null;
function openLayer(name) {
  if (name === 'wishlist') { location.href = 'catalogue.html?favoris=1'; return; }
  $$('[data-layer].is-open').forEach((l) => l.classList.remove('is-open'));
  const l = $(`[data-layer="${name}"]`);
  if (!l) return;
  lastFocus = document.activeElement;
  l.classList.add('is-open');
  l.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  if (name === 'search') { renderSearch(''); setTimeout(() => $('[data-q]').focus(), 300); }
}
function closeLayers() {
  $$('[data-layer].is-open').forEach((l) => { l.classList.remove('is-open'); l.setAttribute('aria-hidden', 'true'); });
  document.body.classList.remove('is-locked');
  lastFocus?.focus?.();
}

// ---- cart -------------------------------------------------------------------
function renderCart() {
  const lines = $('[data-lines]');
  const sub = cartSub();
  const left = Math.max(0, FREE_SHIP - sub);
  $('[data-cart-n]').textContent = cartQty() ? `(${cartQty()})` : '';
  $('[data-ship]').innerHTML = (left ? `Plus que <b>${money(left)}</b> pour profiter de la livraison offerte.` : `<b>La livraison vous est offerte.</b> Elle arrive en 3 à 5 jours.`)
    + `<div class="cart__track"><i style="width:${Math.min(100, (sub / FREE_SHIP) * 100)}%"></i></div>`;
  $('[data-cart-foot]').hidden = !cart.length;
  if (!cart.length) {
    lines.innerHTML = `<div class="cart__empty"><p>Votre panier attend sa première pièce.</p><a class="btn" href="catalogue.html">Découvrir la collection</a></div>`;
  } else {
    lines.innerHTML = cart.map((l, i) => {
      const p = byId(l.id);
      return `<div class="cline">
        <a class="ph" href="produit.html?p=${p.id}"><img src="${IMG + p.img}.jpg" alt="${p.name}"></a>
        <div><h4>${p.name}</h4><p>${l.color}</p>
          <div class="cline__ctl"><div class="qty"><button data-q-step="-1" data-i="${i}" aria-label="Retirer un">−</button><output>${l.qty}</output><button data-q-step="1" data-i="${i}" aria-label="Ajouter un">+</button></div><button class="rm" data-rm="${i}">Retirer</button></div>
        </div>
        <span class="cline__price">${money(p.price * l.qty)}</span>
      </div>`;
    }).join('');
  }
  $('[data-sub]').textContent = money(sub);
  updateBadges();
}

// ---- search -----------------------------------------------------------------
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function renderSearch(q) {
  const res = $('[data-res]');
  const n = norm(q.trim());
  const list = n
    ? PRODUCTS.filter((p) => norm([p.name, p.mat, ...p.materials, ...p.styles, ...p.cats.map(catName)].join(' ')).includes(n))
    : ['selene', 'luna', 'alba', 'noma'].map(byId);
  $('[data-res-h]').textContent = n ? `${list.length} résultat${list.length > 1 ? 's' : ''}` : 'Pièces suggérées';
  res.innerHTML = list.length
    ? list.slice(0, 8).map((p, i) => `<a class="sres zoom" href="produit.html?p=${p.id}" style="animation-delay:${i * 50}ms"><div class="ph"><img src="${IMG + p.img}.jpg" alt=""></div><b>${p.name}</b><small>${money(p.price)}</small></a>`).join('')
    : `<p class="search__none">Rien pour « ${q} ». Essayez « lin », « travertin » ou « lampe ».</p>`;
}

// ---- product card -----------------------------------------------------------
function card(p, i = 0) {
  const badge = p.badge ? `<span class="card__badge${p.badgeTone ? ' card__badge--' + p.badgeTone : ''}">${p.badge}</span>` : '';
  const alt = p.alt ? `<img class="alt" src="${IMG + p.alt}.jpg" alt="" loading="lazy">` : '';
  return `<article class="card rv" style="transition-delay:${(i % 4) * 70}ms">
    <a class="card__media" href="produit.html?p=${p.id}">${badge}<img src="${IMG + p.img}.jpg" alt="${p.name}" loading="lazy">${alt}</a>
    <button class="wish${wish.has(p.id) ? ' is-on' : ''}" data-wish="${p.id}" aria-label="Ajouter ${p.name} aux favoris">${ICON.heart}</button>
    <button class="card__quick" data-add="${p.id}">Ajouter au panier</button>
    <div class="card__body">
      <h3 class="card__name"><a href="produit.html?p=${p.id}">${p.name}</a></h3>
      <span class="card__price">${money(p.price)}</span>
      <p class="card__mat">${p.mat}</p>
    </div>
    <div class="dots">${p.colors.map(([n, c], k) => `<span class="dot${k ? '' : ' is-on'}" style="--c:${c}" title="${n}"></span>`).join('')}</div>
  </article>`;
}

// ---- reveal -----------------------------------------------------------------
const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: .08 }) : null;
function reveal(root = document) {
  $$('.rv:not(.is-in)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));
}

// ---- home -------------------------------------------------------------------
function initHome() {
  const grid = $('[data-showcase]');
  if (!grid) return;
  const tabs = $$('[data-tab]');
  const paint = (t) => {
    grid.innerHTML = PRODUCTS.filter((p) => p.tabs.includes(t)).slice(0, 8).map(card).join('');
    reveal(grid);
  };
  tabs.forEach((b) => b.addEventListener('click', () => {
    if (b.classList.contains('is-on')) return;
    tabs.forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    grid.classList.add('is-swapping');
    setTimeout(() => { paint(b.dataset.tab); grid.classList.remove('is-swapping'); }, 380);
  }));
  paint('new');

  const lights = $('[data-light-picks]');
  if (lights) { lights.insertAdjacentHTML('beforeend', ['luna', 'forma'].map(byId).map(card).join('')); }

  const rail = $('[data-rail]');
  const bar = $('[data-rail-bar]');
  if (rail && bar) {
    const sync = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const vis = rail.clientWidth / rail.scrollWidth;
      bar.style.width = `${vis * 100}%`;
      bar.style.transform = `translateX(${max ? (rail.scrollLeft / max) * ((1 - vis) / vis) * 100 : 0}%)`;
    };
    rail.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
    $$('[data-rail-go]').forEach((b) => b.addEventListener('click', () => rail.scrollBy({ left: rail.clientWidth * .72 * +b.dataset.railGo, behavior: 'smooth' })));
  }

  const frame = $('[data-room-frame]');
  if (frame) {
    const btns = $$('[data-room]');
    const imgs = $$('img', frame);
    const cap = $('[data-room-cap]');
    const pick = (b) => {
      btns.forEach((x) => x.classList.toggle('is-on', x === b));
      imgs.forEach((im) => im.classList.toggle('is-on', im.dataset.r === b.dataset.room));
      cap.textContent = b.dataset.cap;
    };
    btns.forEach((b) => { b.addEventListener('click', () => pick(b)); b.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && pick(b)); });
  }
}

// ---- catalogue --------------------------------------------------------------
function initCatalogue() {
  const grid = $('[data-cat-grid]');
  if (!grid) return;
  const qs = new URLSearchParams(location.search);
  const st = { cat: qs.get('c') || 'all', max: 1500, materials: new Set(), styles: new Set(), tones: new Set(), sort: qs.get('tri') === 'new' ? 'new' : 'rel', fav: qs.get('favoris') === '1' };
  const TONES = [['Ivoire', '#EEE7DB'], ['Sable', '#D4C2AA'], ['Terracotta', '#A76E50'], ['Olive', '#77745A'], ['Noyer', '#5A4334']];
  const MATS = ['Lin', 'Bouclé', 'Laine', 'Chêne', 'Noyer', 'Travertin', 'Céramique', 'Verre', 'Papier', 'Laiton'];
  const STYLES = ['Organique', 'Minimaliste', 'Méditerranéen', 'Japandi', 'Sculptural'];
  const count = (key, v) => PRODUCTS.filter((p) => p[key].includes(v)).length;

  const BANNERS = {
    all: ['cat-salon', 'Toute la collection', 'Des pièces choisies pour leur forme, leur matière et leur façon d’habiter l’espace.'],
    salon: ['room-salon', 'Le salon', 'Des assises profondes, du lin, de la bouclette et du bois. Le cœur calme de la maison.'],
    'salle-a-manger': ['room-sam', 'Salle à manger', 'Une grande table, des chaises que l’on garde, et la lumière qui tombe juste au-dessus.'],
    chambre: ['room-chambre', 'La chambre', 'Le lin froissé, la lumière du matin, et rien de trop.'],
    bureau: ['room-bureau', 'Le bureau', 'Un coin de travail qui ressemble à un coin de lecture.'],
    mobilier: ['col-forma', 'Mobilier', 'Des volumes francs, des courbes douces, des bois massifs et de la pierre.'],
    luminaires: ['col-lumiere', 'Luminaires', 'Chaque lumière transforme la perception d’un lieu.'],
    tapis: ['cat-tapis', 'Tapis', 'Laine nouée, reliefs sculptés : la douceur commence au sol.'],
    decoration: ['cat-deco', 'Décoration', 'Des objets faits main, posés avec intention.'],
    textiles: ['cat-textiles', 'Textiles', 'Lin lavé, laine, coton brut. Des matières qui se ressentent.'],
    entree: ['room-entree', 'L’entrée', 'Le premier geste de la maison.'],
    exterieur: ['room-exterieur', 'Extérieur', 'Prolonger la maison sous l’ombre des oliviers.'],
  };

  $('[data-chips]').innerHTML = [['all', 'Tout'], ...CATS.filter(([k]) => k !== 'exterieur')].map(([k, n]) => `<button class="chip" data-chip="${k}">${n}</button>`).join('');
  $('[data-f-tones]').innerHTML = TONES.map(([n, c]) => `<button class="fsw" style="--c:${c}" data-tone="${n}" title="${n}" aria-label="${n}"></button>`).join('');
  $('[data-f-mats]').innerHTML = MATS.map((m) => `<label class="fcheck"><input type="checkbox" data-mat="${m}"><span>${m}</span><em>${count('materials', m)}</em></label>`).join('');
  $('[data-f-styles]').innerHTML = STYLES.map((s) => `<label class="fcheck"><input type="checkbox" data-style="${s}"><span>${s}</span><em>${count('styles', s)}</em></label>`).join('');
  $('[data-sort]').value = st.sort;

  const range = $('[data-range]');
  const fill = $('[data-range-fill]');
  const out = $('[data-range-out]');

  function paint() {
    const [img, title, txt] = BANNERS[st.fav ? 'all' : st.cat] || BANNERS.all;
    $('[data-banner-img]').src = IMG + img + '.jpg';
    $('[data-banner-t]').textContent = st.fav ? 'Vos favoris' : title;
    $('[data-banner-p]').textContent = st.fav ? 'Les pièces que vous avez gardées de côté.' : txt;
    $('[data-crumb]').textContent = st.fav ? 'Favoris' : title;
    $$('[data-chip]').forEach((c) => c.classList.toggle('is-on', c.dataset.chip === st.cat && !st.fav));
    $$('[data-tone]').forEach((c) => c.classList.toggle('is-on', st.tones.has(c.dataset.tone)));
    fill.style.left = '0'; fill.style.width = `${(st.max / 1500) * 100}%`;
    out.innerHTML = `<span>0 €</span><span>jusqu’à ${money(st.max)}</span>`;

    let list = PRODUCTS.filter((p) =>
      (st.fav ? wish.has(p.id) : st.cat === 'all' || p.cats.includes(st.cat)) &&
      p.price <= st.max &&
      (!st.materials.size || p.materials.some((m) => st.materials.has(m))) &&
      (!st.styles.size || p.styles.some((s) => st.styles.has(s))) &&
      (!st.tones.size || p.tones.some((t) => st.tones.has(t))));
    if (st.sort === 'asc') list.sort((a, b) => a.price - b.price);
    else if (st.sort === 'desc') list.sort((a, b) => b.price - a.price);
    else if (st.sort === 'new') list.sort((a, b) => (b.tabs.includes('new') - a.tabs.includes('new')) || a.rank - b.rank);
    else list.sort((a, b) => a.rank - b.rank);

    $('[data-count-out]').textContent = `${list.length} pièce${list.length > 1 ? 's' : ''}`;
    if (!list.length) { grid.innerHTML = `<p class="cat-empty" style="grid-column:1/-1">${st.fav ? 'Aucun favori pour l’instant. Touchez le cœur d’une pièce pour la garder ici.' : 'Aucune pièce ne correspond. Allégez un filtre.'}</p>`; return; }
    const html = list.map(card);
    if (list.length > 8 && !st.fav) html.splice(8, 0, `<aside class="cat-quote rv"><div class="ph"><img src="${IMG}edito-lumiere.jpg" alt="" loading="lazy"></div><div><span class="label">LAGONA — Habiter autrement</span><p>« Des matières, des lumières, des lieux. Chaque pièce choisie pour durer. »</p></div></aside>`);
    grid.classList.add('is-swapping');
    requestAnimationFrame(() => { grid.innerHTML = html.join(''); reveal(grid); requestAnimationFrame(() => grid.classList.remove('is-swapping')); });
  }

  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-chip]');
    if (c) { st.cat = c.dataset.chip; st.fav = false; history.replaceState(null, '', c.dataset.chip === 'all' ? 'catalogue.html' : `catalogue.html?c=${c.dataset.chip}`); paint(); }
    const t = e.target.closest('[data-tone]');
    if (t) { st.tones.has(t.dataset.tone) ? st.tones.delete(t.dataset.tone) : st.tones.add(t.dataset.tone); paint(); }
    if (e.target.closest('[data-reset]')) {
      st.max = 1500; range.value = 1500; st.materials.clear(); st.styles.clear(); st.tones.clear();
      $$('.filters input[type=checkbox]').forEach((i) => { i.checked = false; });
      paint();
    }
    if (e.target.closest('[data-filters-open]')) { $('.filters').classList.add('is-open'); $('.fveil').classList.add('is-on'); }
    if (e.target.closest('[data-filters-close]')) { $('.filters').classList.remove('is-open'); $('.fveil').classList.remove('is-on'); }
  });
  document.addEventListener('change', (e) => {
    const m = e.target.dataset.mat, s = e.target.dataset.style;
    if (m) { e.target.checked ? st.materials.add(m) : st.materials.delete(m); paint(); }
    if (s) { e.target.checked ? st.styles.add(s) : st.styles.delete(s); paint(); }
    if (e.target.matches('[data-sort]')) { st.sort = e.target.value; paint(); }
  });
  range.addEventListener('input', () => { st.max = +range.value; paint(); });
  document.addEventListener('wish:change', () => st.fav && paint());
  paint();
}

// ---- product page -----------------------------------------------------------
function initProduct() {
  const root = $('[data-pdp]');
  if (!root) return;
  const p = byId(new URLSearchParams(location.search).get('p')) || byId('selene');
  const gallery = p.gallery || [p.img, p.alt].filter(Boolean);
  let idx = 0, color = p.colors[0][0], qty = 1;
  document.title = `${p.name} · LAGONA`;
  $('[data-p-crumb]').textContent = p.name;
  $('[data-p-cat]').textContent = catName(p.cats[0]);
  $('[data-p-cat]').href = `catalogue.html?c=${p.cats[0]}`;
  $$('[data-p-name]').forEach((el) => { el.textContent = p.name; });
  $$('[data-p-price]').forEach((el) => { el.textContent = money(p.price); });
  $('[data-p-desc]').textContent = p.desc;
  $('[data-p-mat]').textContent = p.mat;
  $('[data-p-3x]').textContent = `ou 3 × ${money(Math.ceil(p.price / 3))} sans frais`;
  if (p.badge) $('[data-p-badge]').textContent = p.badge;

  const main = $('[data-gal-main]');
  const thumbs = $('[data-gal-thumbs]');
  main.insertAdjacentHTML('afterbegin', gallery.map((g, i) => `<img src="${IMG + g}.jpg" alt="${p.name}, vue ${i + 1}" class="${i ? '' : 'is-on'}">`).join(''));
  thumbs.innerHTML = gallery.map((g, i) => `<button class="${i ? '' : 'is-on'}" data-g="${i}" aria-label="Vue ${i + 1}"><img src="${IMG + g}.jpg" alt=""></button>`).join('');
  const show = (i) => {
    idx = (i + gallery.length) % gallery.length;
    $$('img', main).forEach((im, k) => im.classList.toggle('is-on', k === idx));
    $$('button', thumbs).forEach((b, k) => b.classList.toggle('is-on', k === idx));
    $('[data-gal-count]').textContent = `${String(idx + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
    main.classList.remove('is-zoom');
  };
  thumbs.addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (b) show(+b.dataset.g); });
  $('[data-gal-prev]').addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
  $('[data-gal-next]').addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });
  main.addEventListener('click', () => main.classList.toggle('is-zoom'));
  main.addEventListener('mousemove', (e) => {
    const r = main.getBoundingClientRect();
    $$('img', main)[idx].style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  });
  show(0);

  const vars = $('[data-vars]');
  vars.innerHTML = p.colors.map(([n, c], k) => `<button class="var${k ? '' : ' is-on'}" data-var="${n}"><i style="--c:${c}"></i>${n}</button>`).join('');
  $('[data-var-name]').textContent = color;
  vars.addEventListener('click', (e) => {
    const b = e.target.closest('[data-var]');
    if (!b) return;
    color = b.dataset.var;
    $$('.var', vars).forEach((x) => x.classList.toggle('is-on', x === b));
    $('[data-var-name]').textContent = color;
    show(p.variantImg?.[color] ?? 0);
  });

  $('[data-pq]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    qty = Math.max(1, Math.min(9, qty + +b.dataset.step));
    $('[data-pq-out]').textContent = qty;
  });
  $$('[data-buy]').forEach((b) => b.addEventListener('click', () => addToCart(p.id, color, qty)));
  const wb = $('[data-p-wish]');
  wb.dataset.wish = p.id;
  wb.classList.toggle('is-on', wish.has(p.id));

  if (p.id !== 'selene') $$('[data-selene-only]').forEach((el) => el.remove());
  const rel = PRODUCTS.filter((x) => x.id !== p.id && x.cats.some((c) => p.cats.includes(c))).slice(0, 4);
  $('[data-related]').innerHTML = rel.map(card).join('');

  const sticky = $('.sticky-buy');
  const anchor = $('[data-buy-main]');
  new IntersectionObserver(([e]) => sticky.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(anchor);
}

// ---- boot -------------------------------------------------------------------
$('#lg-header').outerHTML = header();
$('#lg-footer').outerHTML = footer();
renderCart();
initHome();
initCatalogue();
initProduct();
reveal();

const hd = $('.hd');
addEventListener('scroll', () => hd.classList.toggle('is-scrolled', scrollY > 40), { passive: true });

const notes = $$('.announce__row span');
let ni = 0;
setInterval(() => { notes[ni].classList.remove('is-on'); ni = (ni + 1) % notes.length; notes[ni].classList.add('is-on'); }, 3800);

document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  if (open) { e.preventDefault(); openLayer(open.dataset.open); return; }
  if (e.target.closest('[data-close]')) { closeLayers(); return; }
  const w = e.target.closest('[data-wish]');
  if (w) { e.preventDefault(); toggleWish(w.dataset.wish, w); document.dispatchEvent(new Event('wish:change')); return; }
  const a = e.target.closest('[data-add]');
  if (a) { e.preventDefault(); addToCart(a.dataset.add); return; }
  const step = e.target.closest('[data-q-step]');
  if (step) {
    const l = cart[+step.dataset.i];
    l.qty += +step.dataset.qStep;
    if (l.qty < 1) cart.splice(+step.dataset.i, 1);
    store.set('cart', cart);
    renderCart();
    return;
  }
  const rm = e.target.closest('[data-rm]');
  if (rm) { cart.splice(+rm.dataset.rm, 1); store.set('cart', cart); renderCart(); return; }
  const term = e.target.closest('[data-term]');
  if (term) { $('[data-q]').value = term.dataset.term; renderSearch(term.dataset.term); return; }
  if (e.target.closest('[data-checkout]')) { toast('Démonstration : le paiement sera branché ici.'); return; }
  if (e.target.closest('[data-soon]')) { e.preventDefault(); toast('Cette page arrive bientôt.'); }
});
document.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) renderSearch(e.target.value); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLayers(); });
$$('[data-news]').forEach((f) => f.addEventListener('submit', (e) => {
  e.preventDefault();
  f.reset();
  const ok = $('[data-news-ok]');
  if (ok) ok.textContent = 'Merci. La prochaine lettre vous attend déjà.';
  toast('Inscription confirmée');
}));
