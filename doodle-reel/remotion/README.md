# Reel « L'IA ne lit pas dans ta tête » — version Remotion

Vidéo verticale 1080×1920, 30 i/s, 30 s, 8 scènes, faite avec ta banque de personnage
(`public/bank/`). Rendu : `../outputs/remotion/reel.mp4`.

## Ouvrir l'éditeur (Remotion Studio) sur ton ordinateur

```bash
git clone <ton dépôt> && cd ClaudeRepo/doodle-reel/remotion
npm install
npm run dev        # ouvre Remotion Studio dans le navigateur
```

Il faut Node.js 20.19+ ou 22.13+.

## Modifier dans Studio, sans code

Choisis la composition **Reel** à gauche. Studio réécrit lui-même le code quand tu modifies :

| Tu veux… | Où |
|---|---|
| Déplacer, raccourcir ou allonger une scène | Piste **Scènes** de la timeline : glisse ou étire le bloc |
| Changer la pose d'une scène | Clique sur le personnage (« Elle… ») → champ **Pose (image)** → choisis une image de `bank/` |
| Déplacer ou agrandir le personnage | Sélectionne-le → **Offset**, **Scale**, **Rotation** (ou à la souris dans l'aperçu) |
| Faire plus ou moins trembler | Champ **Hand-held shake** |
| Changer quand une marque apparaît (« ?! », veines rouges, bulle, post-it) | Glisse son bloc dans la timeline de la scène (double-clic sur une scène pour l'ouvrir) |
| Changer une marque | Champs **Mark**, **Colour**, **Pop overshoot**, **Mirror** |
| Afficher les sous-titres | Panneau **Props** → `showCaptions` → coche |
| Modifier un sous-titre | Clique dessus → **Text**, couleur, taille ; glisse-le dans la piste **Sous-titres** |
| Volume d'un son | Clique le son dans **Musique** ou **Bruitages** → volume |
| Exporter | Bouton **Render** en haut à droite |

Chaque scène est aussi une composition à part (dossier **Scenes**) pour la retoucher seule.

## Modifier les temps synchronisés (un seul fichier)

`src/cues.ts` contient les temps partagés par l'image **et** le son : chaque touche du clavier,
les « Entrée », le coup de poing (16,2 s), le pop des post-it (22 s), les tics du curseur.
Change un nombre : la main et le son bougent ensemble.

Si tu déplaces une scène dans Studio, pense à décaler aussi ses temps dans `cues.ts` et
`SCENES` (même fichier), sinon les sons de clavier resteront à l'ancien endroit.

## Où est quoi

- `src/Reel.tsx` : la vidéo complète (pistes Scènes, Sous-titres, Musique, Clavier, Bruitages).
- `src/scenes/Scene1.tsx` … `Scene8.tsx` : une scène par fichier, avec son mouvement.
- `src/components/` : le personnage, la fenêtre du chatbot (lignes grises, jamais de texte), les marques dessinées.
- `src/lib/rig.ts` : le trait « dessiné à la main » (10 dessins par seconde, lignes qui tremblent).
- `public/bank/` : poses et accessoires ; `public/audio/` : musique et bruitages.

## Rendu en ligne de commande

```bash
npx remotion render Reel out/reel.mp4
```

Licence : Remotion est gratuit pour un particulier ou une équipe de 3 personnes au plus.
