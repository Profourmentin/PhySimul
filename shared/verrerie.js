/* ==========================================================================
   Simulabo PhCh : gamme « Verrerie » (pièces de laboratoire dessinées en SVG)
   --------------------------------------------------------------------------
   Rôle : une seule façon de dessiner la verrerie et le matériel de laboratoire du lycée dans toutes
   les simulations de chimie. Les pièces sont paramétrables (niveau de liquide, solution, volume lu)
   et s'assemblent en montages (titrage, reflux, filtration sous vide).
   Référence visuelle : docs/verrerie.md (règles, liste des pièces, options) et docs/verrerie.html (galerie).

   Règles de dessin (voir docs/verrerie.md)
   - Origine de chaque pièce : centre de sa base. Les y sont négatifs vers le haut.
   - Un seul trait (2,5), extrémités arrondies, aucun dégradé, aucune ombre portée.
   - Verre : aplat bleuté translucide et un reflet blanc. Liquide : aplat avec ménisque concave.
   - Graduations : petits traits, grands traits tous les 5 ou 10. Trait de jauge rouge. Chiffres sur la burette seulement.
   - Aucune couleur dans les formes : tout passe par les variables --v-* (clair et sombre), définies plus bas.
     tools/check.py vérifie que chaque variable existe dans les deux thèmes et qu'aucune forme ne code une couleur.
   - Proportions schématiques : burette et pipettes raccourcies, rapports conservés dans une même famille.

   Utilisation
     Verrerie.svg("becher", { niveau: .5, solution: "cuivre" })      ->  chaîne <svg> autonome (une pièce)
     Verrerie.g("burette", { volume: 3.2 }, x, y)                    ->  groupe <g> à placer dans une scène (x, y : base de la pièce)
     Verrerie.montage("titrage", { volume: 8.4, legendes: true })    ->  <svg> du montage complet
     Verrerie.familles(), .pieces(), .montages(), .solutions(), .nom(id), .options(id)
   Une scène de simulation assemble des pièces avec g() dans son propre <svg>, avec class="verrerie".
   ========================================================================== */
(function (global) {
  "use strict";
  var VERSION = "1.0.0";

  var n = 0;
  function uid() { return "vr" + (++n); }
  function r(x) { return Math.round(x * 10) / 10; }
  function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function fr(x, d) { return x.toFixed(d).replace(".", ","); }

  /* ---------- Jetons de couleur : mêmes noms en clair et en sombre ---------- */
  var CLAIR = [
    "--v-trait:#3A5A70", "--v-verre:rgba(120,170,205,.16)", "--v-reflet:rgba(255,255,255,.95)",
    "--v-metal:#C3CDD5", "--v-metal-trait:#5E7381", "--v-plast:#D9A253", "--v-plast-trait:#8A5E1E",
    "--v-jauge:#C0392B", "--v-led:#D8452E", "--v-papier:#F3EFE6", "--v-papier-trait:#8C8574", "--v-solide:#F1F4F6",
    "--v-ecran:#16313F", "--v-ecran-txt:#9CE0C2", "--v-sol:#C8D2D9", "--v-tuyau:#4C86B5", "--v-tuyau-trait:#2D5878",
    "--v-txt:#4A5F6E", "--v-alcool:#D64545",
    "--v-eau:rgba(70,150,210,.30)", "--v-eau-t:#3E86BD",
    "--v-cuivre:rgba(40,120,220,.55)", "--v-cuivre-t:#1F66B8",
    "--v-permanganate:rgba(150,40,160,.60)", "--v-permanganate-t:#7A2686",
    "--v-fer:rgba(235,135,40,.55)", "--v-fer-t:#B8620F",
    "--v-jaune:rgba(235,200,40,.60)", "--v-jaune-t:#A98900",
    "--v-vert:rgba(60,170,110,.55)", "--v-vert-t:#2B8553",
    "--v-organique:rgba(250,220,120,.55)", "--v-organique-t:#B58E1B"
  ];
  var SOMBRE = [
    "--v-trait:#9CC2D8", "--v-verre:rgba(150,200,235,.12)", "--v-reflet:rgba(255,255,255,.45)",
    "--v-metal:#4A5A66", "--v-metal-trait:#A5B6C2", "--v-plast:#C58A3C", "--v-plast-trait:#F0C987",
    "--v-jauge:#FF8A7A", "--v-led:#FF7A66", "--v-papier:#59584F", "--v-papier-trait:#A8A290", "--v-solide:#D8DEE2",
    "--v-ecran:#0A1A22", "--v-ecran-txt:#7FE3B4", "--v-sol:#2A3944", "--v-tuyau:#5A94C4", "--v-tuyau-trait:#A9CBE6",
    "--v-txt:#A9BAC5", "--v-alcool:#FF7A7A",
    "--v-eau:rgba(110,190,240,.32)", "--v-eau-t:#7FC3F0",
    "--v-cuivre:rgba(70,150,255,.55)", "--v-cuivre-t:#7DB4FF",
    "--v-permanganate:rgba(200,90,215,.58)", "--v-permanganate-t:#E08BEE",
    "--v-fer:rgba(245,160,70,.55)", "--v-fer-t:#F6B26B",
    "--v-jaune:rgba(240,215,70,.55)", "--v-jaune-t:#EBD04D",
    "--v-vert:rgba(80,200,135,.52)", "--v-vert-t:#6FD9A2",
    "--v-organique:rgba(250,225,130,.5)", "--v-organique-t:#E6C766"
  ];
  /* Classes de dessin, toutes limitées à svg.verrerie pour ne jamais entrer en collision avec une simulation. */
  var FORMES =
    "svg.verrerie .gf{fill:var(--v-verre);stroke:none}" +
    "svg.verrerie .go{fill:none;stroke:var(--v-trait);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}" +
    "svg.verrerie .gk{stroke-width:3.6}" +
    "svg.verrerie .gr{fill:none;stroke:var(--v-reflet);stroke-width:2.4;stroke-linecap:round}" +
    "svg.verrerie .gt{stroke:var(--v-trait);stroke-width:1.5;stroke-linecap:round;fill:none}" +
    "svg.verrerie .gj{stroke:var(--v-jauge);stroke-width:2;stroke-linecap:round;fill:none}" +
    "svg.verrerie .gm{fill:var(--v-metal);stroke:var(--v-metal-trait);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}" +
    "svg.verrerie .gmt{stroke:var(--v-metal-trait);fill:none;stroke-linecap:round}" +
    "svg.verrerie .gp{fill:var(--v-plast);stroke:var(--v-plast-trait);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}" +
    "svg.verrerie .gs{fill:var(--v-solide);stroke:var(--v-trait);stroke-width:2;stroke-linejoin:round}" +
    "svg.verrerie .gpap{fill:var(--v-papier);stroke:var(--v-papier-trait);stroke-width:1.8;stroke-linejoin:round}" +
    "svg.verrerie .gsol{fill:var(--v-sol)}" +
    "svg.verrerie .gtxt{font:600 10px/1 var(--font-data,ui-monospace,Menlo,monospace);fill:var(--v-txt)}" +
    "svg.verrerie .gleg{font:500 15px/1.2 var(--font-body,system-ui,sans-serif);fill:var(--v-trait)}" +
    "svg.verrerie .gld{stroke:var(--v-txt);stroke-width:1.3;fill:none;stroke-linecap:round}" +
    "svg.verrerie .gld-pt{fill:var(--v-txt);stroke:none}" +
    "svg.verrerie .ghh{fill:var(--v-ecran);stroke:var(--v-metal-trait);stroke-width:1.8}" +
    "svg.verrerie .ghh-t{font:700 11px var(--font-data,ui-monospace,Menlo,monospace);fill:var(--v-ecran-txt)}" +
    "svg.verrerie .gled-on{fill:var(--v-led)}" +
    "svg.verrerie .gled-off{fill:var(--v-metal-trait);opacity:.5}";
  var CSS = "svg.verrerie{" + CLAIR.join(";") + "}" +
    "@media (prefers-color-scheme:dark){svg.verrerie{" + SOMBRE.join(";") + "}}" + FORMES;
  var cssOk = false;
  function css() {
    if (cssOk || !global.document) return;
    cssOk = true;
    var st = document.createElement("style");
    st.id = "verrerie-css";
    st.appendChild(document.createTextNode(CSS));
    document.head.appendChild(st);
  }

  /* ---------- Solutions : un aplat translucide et un trait plus soutenu ---------- */
  var SOLUTIONS = {
    eau: ["Eau, solution incolore", "--v-eau", "--v-eau-t"],
    cuivre: ["Solution de sulfate de cuivre (bleue)", "--v-cuivre", "--v-cuivre-t"],
    permanganate: ["Solution de permanganate (violette)", "--v-permanganate", "--v-permanganate-t"],
    fer: ["Solution orangée (ions fer III, dichromate)", "--v-fer", "--v-fer-t"],
    jaune: ["Solution jaune (indicateur coloré acide)", "--v-jaune", "--v-jaune-t"],
    vert: ["Solution verte (indicateur coloré neutre)", "--v-vert", "--v-vert-t"],
    organique: ["Phase organique", "--v-organique", "--v-organique-t"]
  };
  function sol(name) {
    var s = SOLUTIONS[name || "eau"] || SOLUTIONS.eau;
    return { fill: "var(" + s[1] + ")", line: "var(" + s[2] + ")" };
  }

  /* ---------- Briques de dessin ---------- */
  /* Liquide dans un récipient. contour : tracé fermé de l'intérieur ; xL, xR : largeur utile ;
     yBas, yHaut : y du niveau 0 et du niveau 1 ; niveau : 0..1 ; menisque : creux du ménisque ;
     sansLigne : pas de trait de surface (liquide dans une double paroi). */
  function liquide(contour, xL, xR, yBas, yHaut, niveau, solution, menisque, sansLigne) {
    niveau = clamp01(niveau == null ? 0.5 : niveau);
    if (niveau <= 0) return "";
    var y = yBas + (yHaut - yBas) * niveau, id = uid(), c = sol(solution);
    var m = menisque == null ? 3 : menisque;
    var haut = "M" + (xL - 4) + "," + r(y) + " Q" + r((xL + xR) / 2) + "," + r(y + 2 * m) + " " + (xR + 4) + "," + r(y);
    var surf = haut + " V" + (yBas + 6) + " H" + (xL - 4) + " Z";
    return '<clipPath id="' + id + '"><path d="' + contour + '"/></clipPath>' +
      '<g clip-path="url(#' + id + ')"><path d="' + surf + '" fill="' + c.fill + '"/>' +
      (sansLigne ? "" : '<path d="' + haut + '" fill="none" stroke="' + c.line + '" stroke-width="1.8" stroke-linecap="round"/>') + "</g>";
  }
  function verre(d) { return '<path class="gf" d="' + d + '"/>'; }
  function trait(d, cls) { return '<path class="' + (cls || "go") + '" d="' + d + '"/>'; }
  function reflet(d) { return '<path class="gr" d="' + d + '"/>'; }
  function graduations(xBord, yHaut, yBas, nb, majeur, cote, court, long) {
    var s = "", i, y, sgn = cote === "gauche" ? -1 : 1;
    court = court || 5; long = long || 9;
    for (i = 0; i <= nb; i++) {
      y = yHaut + (yBas - yHaut) * i / nb;
      s += '<path class="gt" d="M' + xBord + "," + r(y) + " h" + sgn * (i % majeur === 0 ? long : court) + '"/>';
    }
    return s;
  }
  function g(contenu) { return '<g class="vp">' + contenu + "</g>"; }
  /* Tuyau souple : deux traits superposés (bord foncé, cœur clair). */
  function tuyau(d, largeur) {
    return '<path d="' + d + '" fill="none" stroke="var(--v-tuyau-trait)" stroke-width="' + (largeur + 3) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
           '<path d="' + d + '" fill="none" stroke="var(--v-tuyau)" stroke-width="' + largeur + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  /* ========== LES PIÈCES ==========
     Chaque pièce renvoie { g: dessin, w: largeur, h: hauteur au-dessus de l'origine, x0: abscisse gauche,
     bas: partie sous l'origine (facultatif) }. */
  var P = {};

  /* --- Mesurer --- */
  P.eprouvette = function (o) {
    var tubeD = "M-13,-190 V-8 H13 V-190 Z", pied = "M-28,0 H28 L24,-8 H-24 Z";
    var s = verre(pied) + verre(tubeD) + liquide(tubeD, -13, 13, -8, -182, o.niveau, o.solution, 2.4) +
      trait(pied) + trait("M-13,-190 V-8 M13,-190 V-8 M-13,-190 L-17,-193") +
      reflet("M-8,-176 V-30") + graduations(13, -178, -16, 20, 2, "gauche", 5, 9);
    return { g: g(s), w: 60, h: 196, x0: -30 };
  };
  P.fiole = function (o) {
    var d = "M-6,-125 V-67.5 A34,34 0 1,0 6,-67.5 V-125 Z", jauge = -100;
    var s = verre(d) + liquide(d, -34, 34, -2, jauge, o.niveau == null ? 0.6 : o.niveau, o.solution, 2.2) +
      trait("M-6,-125 V-67.5 A34,34 0 1,0 6,-67.5 V-125") +
      '<path class="gj" d="M-6,' + jauge + " Q0," + (jauge + 3) + " 6," + jauge + '"/>' +
      '<path class="gj" d="M-6,' + jauge + " Q0," + (jauge - 3) + " 6," + jauge + '" stroke-dasharray="2 3" opacity=".6"/>' +
      reflet("M-24,-48 Q-24,-30 -14,-18");
    if (o.bouchon) s += '<path class="gp" d="M-6.5,-125 L-9,-142 H9 L6.5,-125 Z"/>';
    return { g: g(s), w: 76, h: o.bouchon ? 142 : 128, x0: -38 };
  };
  P.pipetteJaugee = function (o) {
    var d = "M-1.5,0 L-3.5,-26 V-78 C-3.5,-84 -15,-86 -15,-110 C-15,-134 -3.5,-136 -3.5,-142 V-228 H3.5 V-142 C3.5,-136 15,-134 15,-110 C15,-86 3.5,-84 3.5,-78 V-26 L1.5,0 Z";
    var haut = -214, bas = -52, traits = o.traits || 2;
    var s = verre(d) + liquide(d, -15, 15, 0, haut, o.niveau == null ? 0.5 : o.niveau, o.solution, 1.6) + trait(d.replace(" Z", "")) +
      '<path class="gj" d="M-3.5,' + haut + " Q0," + (haut + 2) + " 3.5," + haut + '"/>' +
      (traits === 2 ? '<path class="gj" d="M-3.5,' + bas + " Q0," + (bas + 2) + " 3.5," + bas + '"/>' : "") +
      reflet("M-10,-120 Q-10,-104 -8,-96");
    return { g: g(s), w: 34, h: 230, x0: -17 };
  };
  P.pipetteGraduee = function (o) {
    var d = "M-1.5,0 L-6,-30 V-228 H6 V-30 L1.5,0 Z";
    var s = verre(d) + liquide(d, -6, 6, 0, -222, o.niveau == null ? 0.5 : o.niveau, o.solution, 1.2) +
      trait("M-1.5,0 L-6,-30 V-228 M6,-228 V-30 L1.5,0 M-1.5,0 H1.5") +
      graduations(6, -216, -40, 44, 5, "gauche", 4, 8) + reflet("M-1.8,-218 V-60");
    return { g: g(s), w: 24, h: 230, x0: -12 };
  };
  P.propipette = function () {
    var s = '<path class="gp" d="M-4,0 L-5,-24 H5 L4,0 Z"/>' +
      '<path class="gp" d="M-14,-24 H14 V-62 H-14 Z"/>' +
      '<path class="gp" d="M-10,-62 C-22,-66 -26,-82 -22,-98 C-18,-116 -8,-122 0,-122 C8,-122 18,-116 22,-98 C26,-82 22,-66 10,-62 Z"/>' +
      '<path class="gp" d="M-5,-122 V-130 H5 V-122"/>' +
      '<circle class="gp" cx="-19" cy="-50" r="7"/><circle class="gp" cx="19" cy="-36" r="7"/>' +
      '<text class="gtxt" x="0" y="-135" text-anchor="middle">A</text>' +
      '<text class="gtxt" x="-19" y="-47" text-anchor="middle">S</text><text class="gtxt" x="19" y="-33" text-anchor="middle">E</text>' +
      reflet("M-15,-100 Q-15,-110 -9,-114");
    return { g: g(s), w: 60, h: 138, x0: -30 };
  };
  P.burette = function (o) {
    var y0 = -282, y25 = -50, vol = o.volume == null ? 0 : o.volume;
    var d = "M-7,-296 V-26 H7 V-296 Z", yv = y0 + (y25 - y0) * vol / 25, k, nums = "";
    var s = verre(d) + liquide(d, -7, 7, -26, yv, 1, o.solution, 2) +
      '<path class="go" d="M-7,-296 V-26 M7,-296 V-26"/>' +
      graduations(7, y0, y25, 25, 5, "gauche", 5, 9) + reflet("M-3.2,-290 V-60");
    for (k = 0; k <= 25; k += 5) nums += '<text class="gtxt" x="-20" y="' + r(y0 + (y25 - y0) * k / 25 + 3.5) + '" text-anchor="end">' + k + "</text>";
    s += nums +
      '<path class="gm" d="M-9,-26 H9 V-14 H-9 Z"/>' +
      '<path class="gm" d="M9,-23 H34 V-17 H9 Z"/>' +
      '<path class="go" d="M-3.5,-14 L-1.5,0 H1.5 L3.5,-14"/>';
    return { g: g(s), w: 80, h: 300, x0: -26 };
  };
  P.balance = function (o) {
    var t = o.lecture == null ? "0,00 g" : o.lecture;
    var s = '<path class="gm" d="M-62,0 H62 V-22 Q62,-26 58,-26 H-58 Q-62,-26 -62,-22 Z"/>' +
      '<rect class="ghh" x="-50" y="-19" width="62" height="12" rx="2.5"/><text class="ghh-t" x="9" y="-10" text-anchor="end">' + t + "</text>" +
      '<circle class="gm" cx="40" cy="-12.5" r="4.5"/>' +
      '<path class="gm" d="M-4,-26 H4 V-34 H-4 Z"/><path class="gm" d="M-34,-34 H34 Q36,-34 36,-37 Q36,-40 34,-40 H-34 Q-36,-40 -36,-37 Q-36,-34 -34,-34 Z"/>';
    return { g: g(s), w: 128, h: 42, x0: -64, dessus: -40 };
  };
  P.thermometre = function (o) {
    var T = o.temperature == null ? 20 : o.temperature, y = -30 - (T / 110) * 130, k, s, id = uid();
    var d = "M-3.2,-168 V-13 A7,7 0 1,0 3.2,-13 V-168 Z";
    s = verre(d) + '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>' +
      '<g clip-path="url(#' + id + ')"><rect x="-4" y="' + r(y) + '" width="8" height="' + r(-y + 2) + '" fill="var(--v-alcool)"/></g>' +
      '<path class="go" d="M-3.2,-168 V-13 A7,7 0 1,0 3.2,-13 V-168"/>';
    for (k = 0; k <= 110; k += 10) s += '<path class="gt" d="M3.2,' + r(-30 - (k / 110) * 130) + " h" + (k % 50 === 0 ? 8 : 5) + '"/>';
    return { g: g(s), w: 30, h: 172, x0: -15 };
  };
  P.electrode = function () {
    var d = "M-6,-148 V-26 Q-6,-18 -9,-10 A9,9 0 1,0 9,-10 Q6,-18 6,-26 V-148 Z";
    var s = verre(d) + liquide(d, -9, 9, 0, -120, 1, "eau", 0) + trait(d.replace(" Z", "")) +
      '<path class="gp" d="M-9,-148 H9 V-170 H-9 Z"/>' +
      '<path d="M0,-170 C0,-190 30,-186 30,-210" fill="none" stroke="var(--v-trait)" stroke-width="3" stroke-linecap="round"/>' + reflet("M-2.5,-140 V-40");
    return { g: g(s), w: 60, h: 212, x0: -20 };
  };

  /* --- Contenir, transvaser --- */
  P.becher = function (o) {
    var d = "M-48,-110 V-6 Q-48,0 -42,0 H42 Q48,0 48,-6 V-110 Z";
    var s = verre(d) + liquide(d, -48, 48, 0, -100, o.niveau, o.solution, 3.4) +
      trait("M-48,-110 V-6 Q-48,0 -42,0 H42 Q48,0 48,-6 V-110 M-48,-110 L-54,-114") +
      graduations(48, -88, -14, 3, 1, "gauche", 7, 7) + reflet("M-38,-96 V-24");
    return { g: g(s), w: 112, h: 118, x0: -56 };
  };
  P.erlenmeyer = function (o) {
    var d = "M-14,-122 V-82 L-48,-6 Q-50,0 -42,0 H42 Q50,0 48,-6 L14,-82 V-122 Z";
    var s = verre(d) + liquide(d, -50, 50, 0, -90, o.niveau, o.solution, 3) +
      trait("M-14,-122 V-82 L-48,-6 Q-50,0 -42,0 H42 Q50,0 48,-6 L14,-82 V-122 M-17,-122 H17") +
      reflet("M-9,-114 V-92") + reflet("M-38,-22 L-26,-48");
    return { g: g(s), w: 104, h: 124, x0: -52 };
  };
  P.tubeEssai = function (o) {
    var d = "M-11,-100 V-12 A11,11 0 0,0 11,-12 V-100 Z";
    var s = verre(d) + liquide(d, -11, 11, 0, -92, o.niveau, o.solution, 2) +
      trait("M-11,-100 V-12 A11,11 0 0,0 11,-12 V-100 M-13.5,-100 H13.5") + reflet("M-6,-90 V-24");
    return { g: g(s), w: 32, h: 104, x0: -16 };
  };
  P.verreMontre = function (o) {
    var d = "M-46,-16 Q0,16 46,-16 Q0,3 -46,-16 Z", s = "";
    if (o.solide) s += '<path class="gs" d="M-18,-4.5 Q-12,-20 0,-20 Q12,-20 18,-4.5 Q0,0 -18,-4.5 Z"/>';
    s += verre(d) + trait(d) + reflet("M-30,-9 Q-20,-3 -10,-1");
    return { g: g(s), w: 96, h: 24, x0: -48 };
  };
  P.entonnoir = function (o) {
    var d = "M-40,-72 L-4,-26 V-8 L-1,0 H1 L4,-8 V-26 L40,-72 Z", s = verre(d);
    if (o.filtre) s += '<path class="gpap" d="M-31,-71 L0,-30 L31,-71 Z"/><path class="gt" d="M0,-30 L-10,-70" opacity=".6"/>';
    s += liquide(d, -40, 40, -4, -52, o.niveau == null ? 0 : o.niveau, o.solution, 2) +
      trait(d.replace(" Z", "")) + reflet("M-31,-66 L-12,-42");
    return { g: g(s), w: 84, h: 76, x0: -42 };
  };
  P.pissette = function () {
    var s = '<path class="gp" d="M-20,-8 V-60 Q-20,-72 -9,-78 V-90 H9 V-78 Q20,-72 20,-60 V-8 Q20,0 12,0 H-12 Q-20,0 -20,-8 Z"/>' +
      '<path class="gp" d="M-6,-90 H6 V-98 H-6 Z"/>' +
      '<path d="M0,-98 V-108 Q0,-118 10,-118 H27" fill="none" stroke="var(--v-plast-trait)" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M0,-98 V-108 Q0,-118 10,-118 H27" fill="none" stroke="var(--v-plast)" stroke-width="4.5" stroke-linecap="round"/>' +
      reflet("M-13,-60 V-18");
    return { g: g(s), w: 80, h: 124, x0: -22 };
  };
  P.spatule = function () {
    var s = '<path class="gm" d="M-34,-8 Q-50,-12 -64,-6 Q-50,-1 -34,-1 Z"/>' +
      '<path class="gm" d="M-34,-6.5 H40 V-2.5 H-34 Z"/>' +
      '<path class="gm" d="M40,-8.5 H62 Q66,-8.5 66,-5 Q66,-1.5 62,-1.5 H40 Z"/>';
    return { g: g(s), w: 136, h: 14, x0: -68 };
  };

  /* --- Chauffer, synthétiser, séparer --- */
  P.ballon = function (o) {
    var d = "M-13,-150 V-102.3 A52,52 0 1,0 13,-102.3 V-150 Z";
    var s = verre(d) + liquide(d, -52, 52, 0, -104, o.niveau == null ? 0.4 : o.niveau, o.solution, 3) +
      '<path class="gm" d="M-14,-148 H14 V-132 H-14 Z" opacity=".55"/>' +
      trait("M-13,-150 V-102.3 A52,52 0 1,0 13,-102.3 V-150") + reflet("M-38,-62 Q-38,-84 -22,-96");
    return { g: g(s), w: 108, h: 154, x0: -54 };
  };
  /* Réfrigérant à boules : eau froide entrée en bas (gauche), sortie en haut (droite). */
  P.refrigerant = function () {
    var i, h = 32, y0 = -34, ya, yb, gauche = "", droite = "", bas = "";
    for (i = 0; i < 5; i++) {
      ya = y0 - i * h; yb = ya - h;
      gauche += " C-17," + (ya - 4) + " -17," + (yb + 4) + " -5," + yb;
      droite += " C17," + (ya - 4) + " 17," + (yb + 4) + " 5," + yb;
      bas = " C17," + (yb + 4) + " 17," + (ya - 4) + " 5," + ya + bas;        // profil droit parcouru vers le bas
    }
    var profilG = "M-5,0 V" + y0 + gauche + " V-224", profilD = "M5,0 V" + y0 + droite + " V-224";
    var tube = profilG + " H5 V" + (y0 - 5 * h) + bas + " V0 Z";
    var manchon = "M-5,-204 Q-28,-200 -28,-188 V-56 Q-28,-44 -5,-38 H5 Q28,-44 28,-56 V-188 Q28,-200 5,-204 Z";
    var s = verre(manchon) + liquide(manchon, -28, 28, -38, -204, 1, "eau", 0, true) + trait(manchon.replace(" Z", "")) +
      verre(tube) + trait(profilG) + trait(profilD) + trait("M-5,-224 H5") +
      '<path class="gm" d="M-8,-14 H8 V-4 H-8 Z" opacity=".5"/>' +
      '<path class="gf" d="M-28,-66 L-44,-78 L-40,-84 L-28,-74 Z"/><path class="go" d="M-28,-66 L-44,-78 M-28,-74 L-40,-84 M-44,-78 L-40,-84"/>' +
      '<path class="gf" d="M28,-186 L44,-198 L40,-204 L28,-194 Z"/><path class="go" d="M28,-186 L44,-198 M28,-194 L40,-204 M44,-198 L40,-204"/>' +
      reflet("M-22,-176 V-70");
    return { g: g(s), w: 100, h: 228, x0: -50 };
  };
  P.ampoule = function (o) {
    var d = "M-4,-34 C-10,-50 -42,-70 -42,-108 C-42,-140 -14,-150 -7,-160 V-186 H7 V-160 C14,-150 42,-140 42,-108 C42,-70 10,-50 4,-34 Z";
    var hb = -36, ht = -150, a = o.haut == null ? 0.35 : o.haut, b = o.bas == null ? 0.35 : o.bas;
    var yBas = hb + (ht - hb) * b, yHaut = hb + (ht - hb) * (a + b), cl = uid();
    var cb = sol(o.solutionBas || "eau"), ch = sol(o.solutionHaut || "organique");
    var s = verre(d) + '<clipPath id="' + cl + '"><path d="' + d + '"/></clipPath><g clip-path="url(#' + cl + ')">' +
      '<path d="M-46,' + r(yBas) + " V-30 H46 V" + r(yBas) + ' Z" fill="' + cb.fill + '"/>' +
      '<path d="M-46,' + r(yHaut) + " H46 V" + r(yBas) + ' H-46 Z" fill="' + ch.fill + '"/>' +
      '<path d="M-46,' + r(yBas) + ' H46" stroke="' + cb.line + '" stroke-width="1.8"/>' +
      '<path d="M-46,' + r(yHaut) + ' H46" stroke="' + ch.line + '" stroke-width="1.8"/></g>' +
      trait(d.replace(" Z", "")) + '<path class="go" d="M-4,-34 V-26 M4,-34 V-26"/>' +
      '<path class="gp" d="M-9,-186 L-6,-206 H6 L9,-186 Z"/>' +
      '<path class="gm" d="M-9,-26 H9 V-16 H-9 Z"/><path class="gm" d="M9,-23.5 H30 V-18.5 H9 Z"/>' +
      '<path class="go" d="M-3,-16 V-8 L-1.5,0 H1.5 L3,-8 V-16"/>' + reflet("M-32,-100 Q-32,-122 -22,-134");
    return { g: g(s), w: 100, h: 208, x0: -42 };
  };
  P.cuveCCM = function (o) {
    var d = "M-38,-92 V-4 Q-38,0 -34,0 H34 Q38,0 38,-4 V-92 Z", front = o.front == null ? 0.7 : o.front;
    var yDepot = -18, yTop = -78, yF = yDepot + (yTop - yDepot) * front, i;
    var taches = o.taches || [{ x: -9, r: 0.35, c: "--v-cuivre-t" }, { x: 9, r: 0.62, c: "--v-fer-t" }];
    var s = verre(d) + liquide(d, -38, 38, 0, -14, 1, o.solution || "organique", 1.5) +
      '<path class="gpap" d="M-20,-84 V-4 H20 V-84 Z"/>' +
      '<path d="M-20,' + yDepot + ' H20" stroke="var(--v-papier-trait)" stroke-width="1.4"/>' +
      '<path d="M-20,' + r(yF) + ' H20" stroke="var(--v-papier-trait)" stroke-width="1.4" stroke-dasharray="3 3"/>';
    for (i = 0; i < taches.length; i++) s += '<ellipse cx="' + taches[i].x + '" cy="' + r(yDepot + (yF - yDepot) * taches[i].r) + '" rx="4.2" ry="3.4" style="fill:var(' + taches[i].c + ')"/>';
    s += trait(d.replace(" Z", "")) + '<path class="gm" d="M-42,-92 H42 V-102 H-42 Z"/><path class="gm" d="M-6,-102 H6 V-108 H-6 Z"/>' + reflet("M-31,-84 V-14");
    return { g: g(s), w: 92, h: 110, x0: -46 };
  };
  /* Fiole à vide : erlenmeyer à parois épaisses et tubulure latérale (reliée à la trompe à eau). */
  P.fioleVide = function (o) {
    var d = "M-14,-122 V-82 L-48,-6 Q-50,0 -42,0 H42 Q50,0 48,-6 L14,-82 V-122 Z";
    var s = verre(d) + liquide(d, -50, 50, 0, -90, o.niveau == null ? 0.15 : o.niveau, o.solution, 3) +
      '<path class="gf" d="M14,-110 H44 V-98 H14 Z"/>' +
      trait("M-14,-122 V-82 L-48,-6 Q-50,0 -42,0 H42 Q50,0 48,-6 L14,-82 V-122 M-17,-122 H17", "go gk") +
      trait("M14,-110 H44 V-98 H14 M40,-112 V-96", "go") + reflet("M-9,-114 V-92") + reflet("M-38,-22 L-26,-48");
    return { g: g(s), w: 108, h: 124, x0: -52, buse: [44, -104] };
  };
  /* Entonnoir Büchner : origine sous la collerette du joint, posé sur le col d'une fiole à vide. */
  P.buchner = function (o) {
    var d = "M-40,-62 V-26 L-9,-18 V20 L-5,25 H5 L9,20 V-18 L40,-26 V-62 Z", s = verre(d), cl = uid();
    s += '<path class="gpap" d="M-32,-33 H32 V-30 H-32 Z"/>';
    if (o.solide) s += '<path class="gs" d="M-30,-33 Q-30,-41 0,-41 Q30,-41 30,-33 Z"/>';
    s += liquide("M-40,-62 V-33 H40 V-62 Z", -40, 40, -33, -58, o.niveau == null ? 0 : o.niveau, o.solution, 2) +
      trait(d.replace(" Z", "")) + '<path class="gt" d="M-34,-28 H34" stroke-dasharray="2 4"/>' + reflet("M-33,-56 V-40") +
      '<path class="gp" d="M-22,-8 H22 V0 H17 L14,8 H-14 L-17,0 H-22 Z"/>';
    return { g: g(s), w: 90, h: 64, x0: -45, bas: 26 };
  };

  /* --- Chauffer, agiter --- */
  P.agitateur = function (o) {
    var s = '<path class="gm" d="M-60,0 H60 V-20 Q60,-24 56,-24 H-56 Q-60,-24 -60,-20 Z"/>' +
      '<path class="gmt" d="M-52,-24 H52" stroke-width="1.5" opacity=".5"/>' +
      '<circle class="gm" cx="40" cy="-11" r="6"/><path class="gmt" d="M40,-11 L43,-16" stroke-width="1.5"/>' +
      '<circle class="' + (o.actif ? "gled-on" : "gled-off") + '" cx="-46" cy="-11" r="3"/>';
    return { g: g(s), w: 124, h: 26, x0: -62, dessus: -24 };
  };
  P.barreau = function () {
    return { g: g('<rect x="-12" y="-6" width="24" height="6" rx="3" fill="var(--v-solide)" stroke="var(--v-trait)" stroke-width="1.6"/><path d="M-5,-3 H5" stroke="var(--v-trait)" stroke-width="1.4"/>'), w: 28, h: 6, x0: -14 };
  };
  P.chauffeBallon = function (o) {
    var s = '<path class="gm" d="M-52,0 H52 V-28 H-52 Z"/>' +
      '<path class="gm" d="M-68,-88 C-68,-54 -38,-30 0,-30 C38,-30 68,-54 68,-88 Z"/><path class="gmt" d="M-72,-88 H72" stroke-width="3"/>' +
      '<circle class="gm" cx="34" cy="-14" r="6"/><path class="gmt" d="M34,-14 L37,-19" stroke-width="1.5"/>' +
      '<circle class="' + (o.actif ? "gled-on" : "gled-off") + '" cx="-34" cy="-14" r="3.2"/>';
    return { g: g(s), w: 150, h: 92, x0: -75, fond: -30 };
  };
  P.supportElevateur = function () {
    var s = '<path class="gm" d="M-62,0 H62 V-7 H-62 Z"/><path class="gm" d="M-62,-27 H62 V-20 H-62 Z"/>' +
      '<path class="gmt" d="M-38,-7 L38,-20 M-38,-20 L38,-7" stroke-width="3"/>' +
      '<circle class="gm" cx="0" cy="-13.5" r="4.5"/><rect class="gm" x="62" y="-17" width="12" height="7" rx="2"/>';
    return { g: g(s), w: 150, h: 28, x0: -62, dessus: -27 };
  };

  /* --- Supports --- */
  P.statif = function (o) {
    var h = o.hauteur || 450, base = o.base || 100;
    var s = '<path class="gm" d="M-16,0 H' + base + ' V-9 H-16 Z"/><path class="gm" d="M-4.5,-9 H4.5 V' + (-h) + ' H-4.5 Z"/>';
    return { g: g(s), w: base + 20, h: h, x0: -16 };
  };
  /* Noix et pince, posées sur la tige du statif (origine : axe de la tige). distance : écart horizontal jusqu'à l'axe
     de l'objet tenu ; y : hauteur ; pas : largeur de l'objet tenu. */
  P.pince = function (o) {
    var x = o.distance || 120, y = o.y == null ? -12 : o.y, w = o.pas || 14;
    var s = '<path class="gm" d="M-11,' + (y + 10) + " H11 V" + (y - 10) + ' H-11 Z"/><circle class="gm" cx="0" cy="' + y + '" r="3.2"/>' +
      '<path class="gm" d="M11,' + (y + 4) + " H" + (x - w / 2 - 2) + " V" + (y - 4) + ' H11 Z"/>' +
      '<path class="gm" d="M' + (x - w / 2 - 4) + "," + (y + 11) + " H" + (x + w / 2 + 4) + " V" + (y - 11) + " H" + (x - w / 2 - 4) + ' Z"/>' +
      '<path class="gmt" d="M' + (x - w / 2) + "," + (y - 11) + " V" + (y + 11) + " M" + (x + w / 2) + "," + (y - 11) + " V" + (y + 11) + '" stroke-width="1.5"/>';
    return { g: g(s), w: x + 30, h: 24, x0: -12 };
  };

  /* ========== Catalogue : noms, familles, options ========== */
  var NOMS = {
    eprouvette: "Éprouvette graduée", fiole: "Fiole jaugée", pipetteJaugee: "Pipette jaugée", pipetteGraduee: "Pipette graduée",
    propipette: "Propipette", burette: "Burette graduée", balance: "Balance", thermometre: "Thermomètre", electrode: "Électrode de pH",
    becher: "Bécher", erlenmeyer: "Erlenmeyer", tubeEssai: "Tube à essais", verreMontre: "Verre de montre", entonnoir: "Entonnoir",
    pissette: "Pissette", spatule: "Spatule", ballon: "Ballon", refrigerant: "Réfrigérant à boules", ampoule: "Ampoule à décanter",
    cuveCCM: "Cuve de CCM", fioleVide: "Fiole à vide", buchner: "Entonnoir Büchner", agitateur: "Agitateur magnétique",
    barreau: "Barreau aimanté", chauffeBallon: "Chauffe-ballon", supportElevateur: "Support élévateur", statif: "Statif", pince: "Noix et pince"
  };
  var FAMILLES = [
    ["Mesurer", ["eprouvette", "fiole", "pipetteJaugee", "pipetteGraduee", "propipette", "burette", "balance", "thermometre", "electrode"]],
    ["Contenir et transvaser", ["becher", "erlenmeyer", "tubeEssai", "verreMontre", "entonnoir", "pissette", "spatule"]],
    ["Synthétiser et séparer", ["ballon", "refrigerant", "ampoule", "cuveCCM", "fioleVide", "buchner"]],
    ["Chauffer et agiter", ["agitateur", "chauffeBallon", "supportElevateur"]],
    ["Supports", ["statif", "pince"]]
  ];
  var OPTIONS = {
    eprouvette: "niveau (0 à 1), solution", fiole: "niveau, solution, bouchon", pipetteJaugee: "niveau, solution, traits (1 ou 2)",
    pipetteGraduee: "niveau, solution", propipette: "aucune", burette: "volume (mL lu, 0 à 25), solution", balance: "lecture (texte affiché)",
    thermometre: "temperature (0 à 110 °C)", electrode: "aucune", becher: "niveau, solution", erlenmeyer: "niveau, solution",
    tubeEssai: "niveau, solution", verreMontre: "solide (booléen)", entonnoir: "filtre (booléen), niveau, solution", pissette: "aucune",
    spatule: "aucune", ballon: "niveau, solution", refrigerant: "aucune", ampoule: "haut, bas (hauteurs des phases), solutionHaut, solutionBas",
    cuveCCM: "front (0 à 1), taches, solution", fioleVide: "niveau, solution", buchner: "filtre-papier toujours présent, solide, niveau, solution",
    agitateur: "actif (booléen)", chauffeBallon: "actif (booléen)", supportElevateur: "aucune", statif: "hauteur, base", pince: "distance, y, pas"
  };

  /* ========== API des pièces ========== */
  function piece(nom, o) {
    if (!P[nom]) throw new Error("Pièce inconnue : " + nom);
    return P[nom](o || {});
  }
  /* <svg> autonome d'une pièce. marge : espace autour (10 par défaut). decoratif : pas d'étiquette (vignette de menu). */
  function svg(nom, o) {
    css();
    o = o || {};
    var p = piece(nom, o), pad = o.marge == null ? 10 : o.marge, bas = p.bas || 0;
    var x = p.x0 - pad, w = p.w + 2 * pad, y = -p.h - pad, h = p.h + bas + 2 * pad;
    return '<svg class="verrerie" viewBox="' + r(x) + " " + r(y) + " " + r(w) + " " + r(h) + '" ' +
      (o.decoratif ? 'role="presentation" aria-hidden="true"' : 'role="img" aria-label="' + (o.alt || NOMS[nom] || nom) + '"') + ">" + p.g + "</svg>";
  }
  /* Groupe <g> d'une pièce, placé à (x, y) : à insérer dans une scène <svg class="verrerie">. */
  function gAt(nom, o, x, y) {
    css();
    var p = piece(nom, o);
    return '<g transform="translate(' + r(x || 0) + "," + r(y || 0) + ')">' + p.g + "</g>";
  }

  /* ---------- Légendes : traits horizontaux, texte aligné (convention des schémas de TP) ---------- */
  function legender(items, xTexte) {
    var s = "", i, it;
    for (i = 0; i < items.length; i++) {
      it = items[i];
      if (it.gauche !== undefined) {
        s += '<path class="gld" d="M' + r(it.x) + "," + r(it.y) + " H" + (it.gauche + 6) + '"/><circle class="gld-pt" cx="' + r(it.x) + '" cy="' + r(it.y) + '" r="2.4"/>' +
          '<text class="gleg" x="' + it.gauche + '" y="' + r(it.y + 4.5) + '" text-anchor="end">' + it.texte + "</text>";
      } else {
        s += '<path class="gld" d="M' + r(it.x) + "," + r(it.y) + " H" + (xTexte - 6) + '"/><circle class="gld-pt" cx="' + r(it.x) + '" cy="' + r(it.y) + '" r="2.4"/>' +
          '<text class="gleg" x="' + xTexte + '" y="' + r(it.y + 4.5) + '">' + it.texte + "</text>";
      }
    }
    return s;
  }

  /* ========== LES MONTAGES ========== */
  var MONTAGES = {};
  var LARGEUR = 560, MARGE_G = 110;     // marge à gauche ajoutée quand les légendes sont affichées

  /* Titrage direct : statif et pince, burette, erlenmeyer sur agitateur magnétique avec son barreau.
     Options : volume (mL lu sur la burette), solutionBurette, solution (erlenmeyer), niveau, agite, legendes. */
  MONTAGES.titrage = function (o) {
    var sol0 = o.solutionBurette || "permanganate", sol1 = o.solution || "eau", V = o.volume == null ? 0 : o.volume;
    var sol_ = 478, ax = 230, st = 50, ag = piece("agitateur", {});
    var yAg = sol_, yEr = yAg + ag.dessus, yBur = yEr - 124 - 18, X = 380;
    var s = '<rect class="gsol" x="0" y="' + sol_ + '" width="' + LARGEUR + '" height="6" rx="3"/>' +
      gAt("statif", { hauteur: 470, base: 104 }, st, sol_) +
      gAt("agitateur", { actif: o.agite !== false }, ax, yAg) +
      gAt("erlenmeyer", { niveau: o.niveau == null ? 0.22 : o.niveau, solution: sol1 }, ax, yEr) +
      '<g transform="translate(' + ax + "," + (yEr - 5) + ')">' + P.barreau({}).g + "</g>" +
      gAt("burette", { volume: V, solution: sol0 }, ax, yBur) +
      gAt("pince", { distance: ax - st, y: yBur - 168 - sol_, pas: 14 }, st, sol_);
    if (o.legendes) {
      s += legender([
        { x: ax + 7, y: yBur - 255, texte: "Burette graduée" },
        { x: ax + 30, y: yBur - 20, texte: "Robinet" },
        { x: ax + 40, y: yEr - 70, texte: "Erlenmeyer" },
        { x: ax, y: yEr - 5, texte: "Barreau aimanté" },
        { x: ax + 46, y: yAg - 4, texte: "Agitateur magnétique" },
        { x: st, y: sol_ - 440, texte: "Statif", gauche: -20 },
        { x: st - 11, y: yBur - 168, texte: "Pince", gauche: -20 }
      ], X);
    }
    return { vb: (o.legendes ? -MARGE_G : 0) + " -30 " + (LARGEUR + (o.legendes ? MARGE_G : 0)) + " 520", g: s };
  };

  /* Chauffage à reflux : support élévateur, chauffe-ballon, ballon, réfrigérant à boules, statif et pince.
     Options : solution, niveau, chauffe (booléen), legendes. */
  MONTAGES.reflux = function (o) {
    var sol_ = 440, ax = 230, st = 70, se = piece("supportElevateur", {}), cb = piece("chauffeBallon", {});
    var yCb = sol_ + se.dessus, yBallon = yCb + cb.fond, yRef = yBallon - 136;
    var ent = [ax - 42, yRef - 81], sor = [ax + 42, yRef - 201];
    var s = '<rect class="gsol" x="0" y="' + sol_ + '" width="' + LARGEUR + '" height="6" rx="3"/>' +
      gAt("statif", { hauteur: 470, base: 118 }, st, sol_) +
      gAt("supportElevateur", {}, ax, sol_) +
      gAt("chauffeBallon", { actif: o.chauffe !== false }, ax, yCb) +
      gAt("ballon", { niveau: o.niveau == null ? 0.42 : o.niveau, solution: o.solution || "organique" }, ax, yBallon) +
      gAt("refrigerant", {}, ax, yRef) +
      gAt("pince", { distance: ax - st, y: yRef - 120 - sol_, pas: 54 }, st, sol_) +
      tuyau("M" + (ent[0] - 3) + "," + ent[1] + " C" + (ent[0] - 38) + "," + (ent[1] + 10) + " " + (ent[0] - 52) + "," + (ent[1] + 70) + " " + (ent[0] - 70) + "," + (ent[1] + 120), 6) +
      tuyau("M" + (sor[0] + 3) + "," + sor[1] + " C" + (sor[0] + 40) + "," + (sor[1] - 8) + " " + (sor[0] + 60) + "," + (sor[1] + 10) + " " + (sor[0] + 82) + "," + (sor[1] + 70), 6);
    if (o.legendes) {
      s += legender([
        { x: ax + 43, y: sor[1], texte: "Sortie d'eau" },
        { x: ax + 44, y: yRef - 150, texte: "Réfrigérant à boules" },
        { x: ax + 30, y: yRef - 20, texte: "Ballon" },
        { x: ax + 56, y: yBallon - 70, texte: "Chauffe-ballon" },
        { x: ax + 62, y: sol_ - 15, texte: "Support élévateur" },
        { x: st, y: yRef - 260, texte: "Statif", gauche: -20 },
        { x: st - 11, y: yRef - 120, texte: "Pince", gauche: -20 }
      ], 400) +
        '<text class="gleg" x="' + (ent[0] - 66) + '" y="' + (ent[1] + 140) + '" text-anchor="middle">Entrée d’eau</text>';
    }
    return { vb: (o.legendes ? -MARGE_G : 0) + " -80 " + (LARGEUR + (o.legendes ? MARGE_G : 0)) + " 540", g: s };
  };

  /* Filtration sous vide : Büchner et papier filtre sur une fiole à vide, reliée à la trompe à eau.
     Options : niveau (liquide au-dessus du filtre), solide (gâteau sur le filtre), solution, legendes. */
  MONTAGES.filtration = function (o) {
    var sol_ = 350, ax = 190, tx = 340, fv = piece("fioleVide", {});
    var yRim = sol_ - 122, nz = [ax + fv.buse[0], sol_ + fv.buse[1]];
    var s = '<rect class="gsol" x="0" y="' + sol_ + '" width="' + LARGEUR + '" height="6" rx="3"/>' +
      gAt("fioleVide", { niveau: o.niveauFiole == null ? 0.12 : o.niveauFiole, solution: o.solution || "eau" }, ax, sol_) +
      gAt("buchner", { solide: o.solide !== false, niveau: o.niveau == null ? 0.25 : o.niveau, solution: o.solution || "eau" }, ax, yRim) +
      /* trompe à eau : corps métallique fixé au robinet, tubulure latérale pour le tuyau, écoulement en bas */
      '<path class="gm" d="M' + (tx - 9) + "," + (sol_ - 150) + " H" + (tx + 9) + " V" + (sol_ - 78) + " L" + (tx + 4) + "," + (sol_ - 66) +
        " V" + (sol_ - 40) + " H" + (tx - 4) + " V" + (sol_ - 66) + " L" + (tx - 9) + "," + (sol_ - 78) + ' Z"/>' +
      '<path class="gm" d="M' + (tx - 22) + "," + (sol_ - 100) + " H" + (tx - 9) + " V" + (sol_ - 90) + " H" + (tx - 22) + ' Z"/>' +
      tuyau("M" + (nz[0] + 2) + "," + nz[1] + " C" + (nz[0] + 60) + "," + nz[1] + " " + (tx - 70) + "," + (sol_ - 95) + " " + (tx - 20) + "," + (sol_ - 95), 6);
    if (o.legendes) {
      s += legender([
        { x: ax + 32, y: yRim - 48, texte: "Papier filtre" },
        { x: tx + 9, y: sol_ - 120, texte: "Trompe à eau" },
        { x: ax - 40, y: yRim - 50, texte: "Entonnoir Büchner", gauche: 100 },
        { x: ax - 46, y: sol_ - 30, texte: "Fiole à vide", gauche: 100 }
      ], 460);
    }
    return { vb: o.legendes ? "-30 150 590 215" : "110 150 270 215", g: s };
  };

  var NOMS_MONTAGES = { titrage: "Titrage direct", reflux: "Chauffage à reflux", filtration: "Filtration sous vide" };
  var ALT_MONTAGES = {
    titrage: "Montage de titrage : burette graduée fixée à un statif au-dessus d'un erlenmeyer posé sur un agitateur magnétique.",
    reflux: "Montage de chauffage à reflux : ballon dans un chauffe-ballon sur support élévateur, réfrigérant à boules fixé à un statif.",
    filtration: "Montage de filtration sous vide : entonnoir Büchner sur une fiole à vide reliée à une trompe à eau."
  };
  function montage(nom, o) {
    css();
    o = o || {};
    if (!MONTAGES[nom]) throw new Error("Montage inconnu : " + nom);
    var m = MONTAGES[nom](o);
    return '<svg class="verrerie" viewBox="' + m.vb + '" role="img" aria-label="' + (o.alt || ALT_MONTAGES[nom]) + '">' + m.g + "</svg>";
  }

  global.Verrerie = {
    version: VERSION,
    css: css,
    svg: svg,
    g: gAt,
    montage: montage,
    legender: legender,
    tuyau: tuyau,
    familles: function () { return FAMILLES.map(function (f) { return { nom: f[0], pieces: f[1].slice() }; }); },
    pieces: function () { return Object.keys(P).filter(function (k) { return k !== "barreau"; }); },
    montages: function () { return Object.keys(MONTAGES).map(function (k) { return { id: k, nom: NOMS_MONTAGES[k] }; }); },
    solutions: function () { return Object.keys(SOLUTIONS).map(function (k) { return { id: k, nom: SOLUTIONS[k][0] }; }); },
    nom: function (id) { return NOMS[id] || id; },
    options: function (id) { return OPTIONS[id] || ""; },
    fr: fr
  };
})(window);
