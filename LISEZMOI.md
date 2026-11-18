# Lagona · code source du site

Site d'une lampe d'ambiance à ondulations d'eau, avec un défilement qui fait passer la chambre du jour à la nuit.

## Contenu

- `index.html`, `checkout.html` : la version autonome du site (maquette locale).
- `css/` et `js/` : styles et scripts. `scrollcraft.js` pilote les scènes au défilement, `caustics.js` dessine les ondulations, `cube.js` affiche le cube 3D (Three.js).
- `vendor/three.module.min.js` : la bibliothèque Three.js (licence MIT).
- `assets/` : images et vidéos utilisées par le site (visuels générés par IA).
- `wizishop/` : la version installée sur la boutique WiziShop.
  - `accueil/` : les 6 blocs HTML de la page d'accueil et `build.mjs`, qui les assemble dans `accueil/dist/`.
  - `cssperso-lagona.css` : la feuille de style personnalisée publiée sur la boutique.

## Lancer en local

Servir le dossier avec un petit serveur web (les modules JavaScript ne marchent pas en `file://`), par exemple :

```
npx serve .
```

puis ouvrir l'adresse indiquée. `npm install` n'est utile que pour reconstruire (`three`, `terser`).
