// Page de commande de démonstration : récapitulatif depuis le panier, formulaire validé localement.
// Rien n'est envoyé nulle part. Le vrai paiement se branchera à la place de .co__pay.
import { PRODUCT, cart, money } from './shop.js';

const $ = (s) => document.querySelector(s);

function renderSummary() {
  const q = cart.qty;
  $('[data-p-name]').textContent = PRODUCT.name;
  $('[data-qty]').textContent = q;
  $('[data-sub]').textContent = money(cart.subtotal);
  $('[data-ship]').textContent = !q ? '·' : PRODUCT.shipping ? money(PRODUCT.shipping) : 'Offerte';
  $('[data-total]').textContent = money(cart.total);
  $('[data-empty]').hidden = q > 0;
  $('[data-checkout] button[type=submit]').disabled = q === 0;
}
renderSummary();
document.addEventListener('cart:change', renderSummary);

const form = $('[data-checkout]');
const err = $('[data-error]');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const bad = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  if (bad.length) {
    bad.forEach((el) => el.setAttribute('aria-invalid', 'true'));
    err.textContent = bad.length === 1 ? 'Un champ est à compléter.' : `${bad.length} champs sont à compléter.`;
    err.hidden = false;
    bad[0].focus();
    return;
  }
  err.hidden = true;
  $('[data-done-name]').textContent = form.elements.given.value.trim();
  // le récapitulatif reste celui de la commande validée, pas celui du panier vidé
  document.removeEventListener('cart:change', renderSummary);
  cart.clear();
  $('[data-step="form"]').hidden = true;
  const done = $('[data-done]');
  done.hidden = false;
  done.focus();
});
