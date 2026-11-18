# Emplacements d'images Nocta

Dépose chaque fichier ici avec le nom exact ci-dessous. L'extension est libre : `.webp`, `.jpg`, `.png` ou `.jpeg`.
Le site le détecte au chargement et remplace le placeholder, sans aucune modification de code.

| # | Fichier | Format | Où | Note |
|---|---|---|---|---|
| 01 | `img/01-chambre-jour` | 16:9 | Fond du hero, puis début de la bascule | Laisser le haut gauche calme : le titre et l'horloge s'y posent |
| 02 | `img/02-cube-detoure` | 3:4, PNG transparent | Hero, couche produit | Vrai canal alpha, pas de fond blanc |
| 03 | `img/03-avant-plan` | PNG transparent | Hero, avant-plan flou | Voilage ou plante, très flou |
| 04 | `img/04-chambre-nuit` | 16:9 | Fin de la bascule | **Même cadrage que 01**, cube allumé à droite, ondulations au plafond |
| 05 | `video/05-bascule.mp4` (+ `05-bascule-m.mp4` mobile) | 16:9, 5 s | Bascule, pilotée au scroll | De 01 à 04. S'active seule si le fichier existe (serveur local requis). Encoder avec `encode.sh` de scroll-craft (GOP dense, sans son) |
| 06 | `img/06-macro-verre` | 16:9 | Section matière | Verre martelé traversé de lumière turquoise |
| 07 | `img/07-salon-violet` | 3:4 | Usages | |
| 08 | `img/08-chambre-saphir` | 3:4 | Usages | Bleu saphir |
| 09 | `img/09-detente-ambre` | 3:4 | Usages | |
| 10 | `img/10-packshot` | 3:4 | Achat | Fond pastel uni |
| 11 | `img/11-contenu-boite` | 16:9 | Achat, « Dans la boîte » | Cube, câble USB, télécommande |

Position de la lueur du cube dans la bascule : variables `--lamp-x` / `--lamp-y` sur `.bascule__glow`
dans `css/site.css` (72 % / 78 % par défaut). Elles sont à ajuster quand l'image 04 sera là.
