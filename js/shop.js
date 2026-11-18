// Panier Nocta : un seul produit, état en localStorage, tiroir partagé par index et checkout.

// Tout ce qui est commercial vit ici. Les valeurs marquées PROVISOIRE sont à remplacer.
export const PRODUCT = {
  id: 'nocta-cube',
  name: 'Nocta, le cube',
  tagline: 'Lampe à ondulations d’eau, 16 couleurs',
  price: 49.0,          // PROVISOIRE
  compareAt: null,      // prix barré éventuel, ex. 69.0
  shipping: 0,          // PROVISOIRE : 0 = offerte
  image: 'assets/img/10-packshot',
};

const KEY = 'nocta.cart.v1';
const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
export const money = (n) => fmt.format(n);

function read() {
  try { return Math.max(0, parseInt(localStorage.getItem(KEY) || '0', 10) || 0); } catch (e) { return memory; }
}
let memory = 0;
function write(q) {
  memory = q;
  try { localStorage.setItem(KEY, String(q)); } catch (e) { /* stockage bloqué : le panier vit en mémoire */ }
  document.dispatchEvent(new CustomEvent('cart:change', { detail: { qty: q } }));
}

export const cart = {
  get qty() { return read() || memory; },
  add(n = 1) { write(Math.min(9, this.qty + n)); },
  set(n) { write(Math.max(0, Math.min(9, n))); },
  clear() { write(0); },
  get subtotal() { return this.qty * PRODUCT.price; },
  get total() { return this.subtotal + (this.qty ? PRODUCT.shipping : 0); },
};

// ---- tiroir -----------------------------------------------------------------
export function mountDrawer() {
  const drawer = document.querySelector('[data-cart-drawer]');
  if (!drawer) return;
  const list = drawer.querySelector('[data-cart-lines]');
  const totalEl = drawer.querySelector('[data-cart-total]');
  const go = drawer.querySelector('[data-cart-checkout]');
  const badges = document.querySelectorAll('[data-cart-count]');
  let lastFocus = null;

  const render = () => {
    const q = cart.qty;
    badges.forEach((b) => { b.textContent = q; b.hidden = q === 0; });
    if (!q) {
      list.innerHTML = '<p class="drawer__empty">Ton panier est vide. Le plafond attend.</p>';
      go.setAttribute('aria-disabled', 'true');
      go.tabIndex = -1;
    } else {
      list.innerHTML = `
        <div class="line">
          <div class="line__thumb" aria-hidden="true"></div>
          <div class="line__info">
            <p class="line__name">${PRODUCT.name}</p>
            <p class="line__meta">${PRODUCT.tagline}</p>
            <div class="stepper" role="group" aria-label="Quantité">
              <button type="button" data-step="-1" aria-label="Retirer une lampe">−</button>
              <output aria-live="polite">${q}</output>
              <button type="button" data-step="1" aria-label="Ajouter une lampe">+</button>
            </div>
          </div>
          <p class="line__price">${money(q * PRODUCT.price)}</p>
        </div>`;
      go.removeAttribute('aria-disabled');
      go.tabIndex = 0;
    }
    totalEl.textContent = money(cart.subtotal);
  };

  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (b) cart.set(cart.qty + parseInt(b.dataset.step, 10));
  });

  const open = () => {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    document.documentElement.classList.add('has-drawer');
    drawer.querySelector('[data-cart-close]').focus();
  };
  const close = () => {
    drawer.classList.remove('is-open');
    document.documentElement.classList.remove('has-drawer');
    setTimeout(() => { drawer.hidden = true; }, 380);
    lastFocus?.focus?.();
  };
  document.querySelectorAll('[data-cart-open]').forEach((b) => b.addEventListener('click', open));
  drawer.querySelectorAll('[data-cart-close]').forEach((b) => b.addEventListener('click', close));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) close(); });

  document.addEventListener('cart:change', render);
  addEventListener('storage', render);
  render();
  return { open, close };
}
