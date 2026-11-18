// Assemble les blocs de l'accueil Nocta pour WiziShop : CSS et JS minifiés, contrôle des caractères interdits,
// tailles et empreintes, plus une maquette locale qui imite la page du thème 30000.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { minify } from 'terser';

const dir = new URL('.', import.meta.url);
const read = (f) => readFileSync(new URL(f, dir), 'utf8');
const out = new URL('dist/', dir);
mkdirSync(out, { recursive: true });

const css = read('style.css')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\n\s*/g, '')
  .replace(/\s*([{};,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();
const js = (await minify(read('moteur.js'), { compress: true, mangle: true, format: { quote_style: 1 } })).code;
const html = ['1-hero', '2-bascule', '3-matiere', '4-ambiances', '5-usages', '6-achat']
  .map((n) => [n, read(`${n}.html`).replace(/\n/g, '').trim()]);

const blocks = [['0-style.css', css], ...html.map(([n, c]) => [`${n}.html`, c]), ['7-moteur.js', js]];
for (const [name, content] of blocks) {
  const bad = [...content.matchAll(/["\\]/g)].length;
  const sha = createHash('sha1').update(content, 'utf8').digest('hex');
  writeFileSync(new URL(name, out), content);
  console.log(`${name.padEnd(18)} ${String(Buffer.byteLength(content)).padStart(6)} o  sha1 ${sha}${bad ? `  !! ${bad} caractère(s) interdit(s)` : ''}`);
}

// maquette : en-tête collant et .body__wrapper en overflow hidden, comme le thème
writeFileSync(new URL('maquette.html', out), `<!doctype html><html lang='fr'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Maquette accueil Nocta</title>
<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'>
<style>body{margin:0;font-family:system-ui,sans-serif}.body__wrapper{overflow:hidden}.wiziblocks__item{transform:translateZ(0)}footer{padding:40px;background:#0b1030;color:#fff}</style>
<style>${readFileSync(new URL('../cssperso-nocta.css', dir), 'utf8')}</style>
<style>${css}</style></head><body class='body page-homepage margin-top-wiziblocks'>
<header id='header' class='header__content'><div class='header__relative'>
<div class='header__logo'><div class='header__h1'><a class='header__logo__a' href='/'><span class='header__logo__a__img__name'><span class='header__logo__a__name__title show'>Horizon Rando</span></span></a></div></div>
<div class='header__nav'><label class='header__nav__icon'>Menu</label></div>
<div class='header__search search'><label class='search--label header__tab'>Chercher</label></div>
<div class='header__area'><div class='header__cart header__cart--top cart'><a class='header__cart__a header__tab' href='#'><span class='header__cart__text'>Panier</span><span class='header__cart__a__nb'>2</span></a></div><div class='header__account'><label class='header__account__a header__tab'>Mon compte</label></div></div>
</div></header><nav class='nav'>Équipement rando</nav><div class='body__wrapper'>
${html.map(([, c]) => c).join('\n')}
</div><footer>pied de page du thème</footer><script>${js}</script></body></html>`);
console.log('maquette : dist/maquette.html');
