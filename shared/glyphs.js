/* ==========================================================================
   Simulabo PhCh : catalogue des glyphes (vignettes dessinées en SVG)
   --------------------------------------------------------------------------
   Rôle : une vignette par simulation, dessinée à partir de ce que l'élève voit et
   manipule dans la simulation (pas d'illustration générique).

   Règles de dessin (voir docs/glyphes.md)
   - Repère 200 x 120, aucun texte, aucune couleur codée en dur :
       .s     trait de structure (couleur du thème)      .dash   trait pointillé
       .f     objet plein (couleur du thème)             .v      grandeur mesurée (ambre)
       .water remplissage léger (liquide, milieu)        .beam   faisceau      .sun  source
   - Un glyphe par simulation : deux simulations ne partagent pas le même dessin.
   - Les glyphes sont décoratifs (aria-hidden) : le titre de la carte porte le sens.

   Utilisation :  Glyphs.draw("lens")  ->  chaîne <svg>…</svg>
                  Glyphs.names()       ->  liste des noms disponibles
   Ajouter un glyphe : appeler add() avec un nom et une fonction qui renvoie le dessin (voir docs/glyphes.md).
   Un nom inconnu affiche le glyphe de repli « graph ».
   ========================================================================== */
(function (global) {
  "use strict";
  var shapes = {};
  function add(name, fn) { shapes[name] = fn; }
  function pt(n) { return Number(n).toFixed(1); }


  /* ---------- Glyphes dessinés d'après le contenu des simulations ---------- */

  /* Lentilles minces : objet, lentille convergente, foyers, trois rayons caractéristiques, image renversée. */
  add("lens", function () {
    var s = "";
    s += '<line class="s dash" x1="8" y1="60" x2="192" y2="60"/>';
    s += '<path class="water" d="M100 12Q124 60 100 108Q76 60 100 12Z"/><path class="s" d="M100 12Q124 60 100 108Q76 60 100 12Z"/>';
    s += '<circle class="f" cx="60" cy="60" r="2.8"/><circle class="f" cx="140" cy="60" r="2.8"/>';
    s += '<line class="s" x1="16" y1="60" x2="16" y2="34"/><path class="s" d="M11 40L16 33L21 40"/>';
    s += '<line class="s" x1="176" y1="60" x2="176" y2="83.4"/><path class="s" d="M171 77L176 84.4L181 77"/>';
    s += '<path class="v" style="stroke-width:2" d="M16 34H100L176 83.4"/>';
    s += '<path class="v" style="stroke-width:2" d="M16 34L176 83.4"/>';
    s += '<path class="v" style="stroke-width:2" d="M16 34L100 83.6H176"/>';
    return s;
  });

  /* Décrire un mouvement / référentiel : point d'une roue qui roule (cycloïde) et son vecteur vitesse. */
  add("cycloid", function () {
    var s = "", r = 14, g0 = 100, x0 = 12, d = "", k, t;
    for (k = 0; k <= 60; k++) {
      t = k / 60 * 4 * Math.PI;
      d += (k ? "L" : "M") + pt(x0 + r * (t - Math.sin(t))) + " " + pt(g0 - r * (1 - Math.cos(t)));
    }
    t = 2.7;
    var xc = x0 + r * t, px = x0 + r * (t - Math.sin(t)), py = g0 - r * (1 - Math.cos(t));
    var vx = r * (1 - Math.cos(t)) * 0.7, vy = r * Math.sin(t) * 0.7;
    s += '<line class="s" style="stroke-width:1.5" x1="6" y1="' + g0 + '" x2="194" y2="' + g0 + '"/>';
    s += '<line class="s dash" style="opacity:.55" x1="12" y1="' + (g0 - r) + '" x2="188" y2="' + (g0 - r) + '"/>';
    s += '<path class="s dash" d="' + d + '"/>';
    s += '<circle class="s" cx="' + pt(xc) + '" cy="' + (g0 - r) + '" r="' + r + '"/>';
    s += '<line class="s" style="stroke-width:1.2" x1="' + pt(xc - r) + '" y1="' + (g0 - r) + '" x2="' + pt(xc + r) + '" y2="' + (g0 - r) + '"/>';
    s += '<line class="s" style="stroke-width:1.2" x1="' + pt(xc) + '" y1="' + (g0 - 2 * r) + '" x2="' + pt(xc) + '" y2="' + g0 + '"/>';
    s += '<circle class="f" cx="' + pt(px) + '" cy="' + pt(py) + '" r="4"/>';
    var ex = px + vx, ey = py - vy;
    s += '<line class="v" x1="' + pt(px) + '" y1="' + pt(py) + '" x2="' + pt(ex) + '" y2="' + pt(ey) + '"/>';
    s += '<path class="v" d="M' + pt(ex - 7) + ' ' + pt(ey - 2.2) + 'L' + pt(ex) + ' ' + pt(ey) + 'L' + pt(ex - 5.5) + ' ' + pt(ey + 5) + '"/>';
    return s;
  });

  /* Construire un vecteur vitesse : positions successives, corde M(i-1)M(i+1) et vecteur vitesse en M(i). */
  add("velocity", function () {
    var s = "", a, x, y, pts = [];
    s += '<path class="s dash" style="opacity:.5" d="M22 102Q100 -50 178 102"/>';
    for (a = 0; a <= 8; a++) { x = 22 + a * 19.5; y = 102 - 4.6 * a * (8 - a); pts.push([x, y]); }
    s += '<line class="s dash" x1="' + pt(pts[2][0]) + '" y1="' + pt(pts[2][1]) + '" x2="' + pt(pts[4][0]) + '" y2="' + pt(pts[4][1]) + '"/>';
    for (a = 0; a <= 8; a++) s += '<circle class="f" cx="' + pt(pts[a][0]) + '" cy="' + pt(pts[a][1]) + '" r="' + (a === 3 ? 5.2 : 3.8) + '"/>';
    var dx = pts[4][0] - pts[2][0], dy = pts[4][1] - pts[2][1];
    var ex = pts[3][0] + dx * 0.95, ey = pts[3][1] + dy * 0.95;
    s += '<line class="v" x1="' + pt(pts[3][0]) + '" y1="' + pt(pts[3][1]) + '" x2="' + pt(ex) + '" y2="' + pt(ey) + '"/>';
    s += '<path class="v" d="M' + pt(ex - 9) + ' ' + pt(ey - 2) + 'L' + pt(ex) + ' ' + pt(ey) + 'L' + pt(ex - 6) + ' ' + pt(ey + 7) + '"/>';
    return s;
  });

  /* Structure électronique : noyau, deux couches, la couche externe à 7 électrons et la place du huitième (octet). */
  add("atom", function () {
    var s = "", cx = 100, cy = 60, k, ang;
    s += '<circle class="s dash" cx="' + cx + '" cy="' + cy + '" r="24"/><circle class="s dash" cx="' + cx + '" cy="' + cy + '" r="46"/>';
    s += '<circle class="f" cx="' + cx + '" cy="' + cy + '" r="8"/>';
    for (k = 0; k < 2; k++) { ang = (30 + k * 180) * Math.PI / 180; s += '<circle class="f" cx="' + pt(cx + 24 * Math.cos(ang)) + '" cy="' + pt(cy - 24 * Math.sin(ang)) + '" r="3.8"/>'; }
    for (k = 0; k < 8; k++) {
      ang = (22.5 + k * 45) * Math.PI / 180;
      var ex = cx + 46 * Math.cos(ang), ey = cy - 46 * Math.sin(ang);
      if (k === 0) s += '<circle class="v" style="stroke-dasharray:2 3;stroke-width:2" cx="' + pt(ex) + '" cy="' + pt(ey) + '" r="5.6"/>';
      else s += '<circle class="f" cx="' + pt(ex) + '" cy="' + pt(ey) + '" r="3.8"/>';
    }
    s += '<line class="v" x1="184" y1="22" x2="152" y2="38"/><path class="v" d="M160 29L151.5 38.5L163 40"/>';
    return s;
  });

  /* Oxydoréduction : le réducteur cède des électrons à l'oxydant. */
  add("redox", function () {
    var s = "";
    s += '<circle class="water" cx="42" cy="86" r="22"/><circle class="s" cx="42" cy="86" r="22"/>';
    s += '<circle class="s" cx="158" cy="86" r="22"/>';
    s += '<path class="v" style="stroke-width:2.5" d="M58 60Q100 6 142 60"/>';
    s += '<path class="v" d="M140.5 49.1L142 60L131.8 55.9"/>';
    s += '<circle class="f" cx="79" cy="39.8" r="3.6"/><circle class="f" cx="100" cy="33" r="3.6"/><circle class="f" cx="121" cy="39.8" r="3.6"/>';
    return s;
  });

  /* Dissolution et dilution : fiole jaugée, trait de jauge, cristaux qui se dispersent. */
  add("flask", function () {
    var s = "";
    s += '<path class="water" d="M57 78H143Q145 83 144 88Q138 108 100 108Q62 108 56 88Q55 83 57 78Z"/>';
    s += '<path class="s" d="M91 10V40C62 50 52 72 56 88Q62 108 100 108Q138 108 144 88C148 72 138 50 109 40V10"/>';
    s += '<line class="s" x1="85" y1="10" x2="115" y2="10"/>';
    s += '<line class="v" x1="86" y1="24" x2="114" y2="24"/>';
    s += '<rect class="f" x="79" y="95" width="6.5" height="6.5" transform="rotate(20 82 98)"/>';
    s += '<rect class="f" x="96" y="98" width="6.5" height="6.5" transform="rotate(-15 99 101)"/>';
    s += '<rect class="f" x="111" y="94" width="6.5" height="6.5" transform="rotate(35 114 97)"/>';
    s += '<circle class="f" style="opacity:.55" cx="90" cy="86" r="2"/><circle class="f" style="opacity:.55" cx="108" cy="84" r="2"/><circle class="f" style="opacity:.55" cx="122" cy="90" r="2"/><circle class="f" style="opacity:.55" cx="74" cy="90" r="2"/>';
    return s;
  });

  /* Décroissance radioactive : dé (hasard), courbe N(t), demi-vies repérées. */
  add("decay", function () {
    var s = "", k, t, d = "", T = 0.28, x, y;
    s += '<rect class="s" x="12" y="26" width="46" height="46" rx="8"/>';
    s += '<circle class="f" cx="24" cy="38" r="3.8"/><circle class="f" cx="35" cy="49" r="3.8"/><circle class="f" cx="46" cy="60" r="3.8"/>';
    s += '<path class="s" style="stroke-width:1.6" d="M84 16V100H190"/>';
    for (k = 0; k <= 40; k++) { t = k / 40; x = 84 + t * 102; y = 100 - 76 * Math.pow(2, -t / T); d += (k ? "L" : "M") + pt(x) + " " + pt(y); }
    s += '<path class="s" d="' + d + '"/>';
    for (k = 1; k <= 2; k++) {
      x = 84 + k * T * 102; y = 100 - 76 * Math.pow(2, -k);
      s += '<path class="v" style="stroke-width:2;stroke-dasharray:4 4" d="M84 ' + pt(y) + 'H' + pt(x) + 'V100"/>';
    }
    for (k = 0; k <= 3; k++) s += '<circle class="f" cx="' + pt(84 + k * T * 102) + '" cy="' + pt(100 - 76 * Math.pow(2, -k)) + '" r="3.6"/>';
    return s;
  });

  /* Repli : graphe de mesures (axes, points, droite de modélisation). */
  add("graph", function () {
    var s = "";
    s += '<path class="s" d="M26 14V100H186"/>';
    s += '<line class="v" x1="38" y1="92" x2="178" y2="24"/>';
    [[50, 86], [80, 72], [110, 56], [140, 44], [168, 28]].forEach(function (p) { s += '<circle class="f" cx="' + p[0] + '" cy="' + p[1] + '" r="4"/>'; });
    return s;
  });

  /* ---------- Glyphes conservés (dessin inchangé) ---------- */
  /* Banc d'optique photovoltaïque : règle graduée, source, cellule inclinée. */
  add("bench", function () {
      var s = "";
      s += '<line class="s" x1="12" y1="94" x2="188" y2="94"/>';
      for (var i = 0; i <= 10; i++) s += '<line class="s" style="stroke-width:1.5" x1="' + (12 + i * 17.6) + '" y1="94" x2="' + (12 + i * 17.6) + '" y2="' + (i % 5 === 0 ? 104 : 100) + '"/>';
      s += '<rect class="f" x="16" y="50" width="24" height="32" rx="3"/><polygon class="beam" points="40,58 138,44 138,88 40,74"/>';
      s += '<line class="s" x1="138" y1="68" x2="138" y2="94"/><g transform="translate(138,66) rotate(-24)"><rect class="f" x="-3.5" y="-26" width="7" height="52" rx="1.5"/></g>';
      return s;
  });
  /* Titrage : burette graduée, goutte, erlenmeyer. */
  add("titration", function () {
      var s = "";
      s += '<path class="s" d="M94 8V62M106 8V62"/><path class="s" d="M94 62L98 68H102L106 62"/><line class="s" x1="88" y1="70" x2="112" y2="70"/>';
      s += '<path class="s" style="stroke-width:1.5" d="M94 18H99M94 28H99M94 38H99M94 48H99"/><circle class="f" cx="100" cy="82" r="3.4"/>';
      s += '<path class="water" d="M80 104H120L130 113H70Z"/><path class="s" d="M92 90V98L70 113H130L108 98V90"/>';
      return s;
  });
  /* Loi d'Ohm : circuit avec générateur et conducteur ohmique. */
  add("circuit", function () {
      var s = "";
      s += '<path class="s" d="M30 30H76L82 17L94 43L106 17L118 43L124 30H170V92H30V68M30 52V30"/>';
      s += '<line class="s" x1="20" y1="52" x2="40" y2="52"/><line class="s" x1="25" y1="60" x2="35" y2="60"/><circle class="sun" cx="100" cy="92" r="5"/>';
      return s;
  });
  /* Gaz : seringue, piston, molécules et vitesses. */
  add("gas", function () {
      var s = "";
      s += '<rect class="s" x="28" y="28" width="120" height="64" rx="3"/><rect class="f" x="148" y="22" width="9" height="76" rx="2"/><line class="s" x1="157" y1="60" x2="188" y2="60"/>';
      [[44, 44], [70, 70], [96, 40], [118, 76], [60, 82], [130, 48], [88, 62], [108, 52]].forEach(function (p) { s += '<circle class="f" cx="' + p[0] + '" cy="' + p[1] + '" r="3.8"/>'; });
      s += '<line class="v" x1="96" y1="40" x2="110" y2="34"/><line class="v" x1="118" y1="76" x2="104" y2="84"/>';
      return s;
  });
  /* Interaction gravitationnelle : astre, satellite, force. */
  add("orbit", function () {
      var s = "";
      s += '<ellipse class="s dash" cx="100" cy="60" rx="72" ry="40"/><circle class="sun" cx="46" cy="60" r="11"/>';
      s += '<circle class="f" cx="156" cy="32" r="6"/><line class="v" x1="150" y1="35" x2="108" y2="52"/>';
      return s;
  });
  /* Combustion : profil d'énergie d'une réaction. */
  add("reaction", function () {
      var s = "";
      s += '<line class="s dash" x1="16" y1="80" x2="184" y2="80"/><path class="s" d="M16 80H48C74 80 80 20 100 20C120 20 126 98 152 98H184"/>';
      s += '<line class="v" x1="168" y1="83" x2="168" y2="96"/><line class="v" x1="164" y1="91" x2="168" y2="96"/><line class="v" x1="172" y1="91" x2="168" y2="96"/><circle class="f" cx="100" cy="20" r="4.5"/>';
      return s;
  });
  /* Énergie d'un pendule. */
  add("pendulum", function () {
      var s = "";
      s += '<line class="s dash" x1="100" y1="12" x2="100" y2="100"/><path class="s dash" d="M52 78Q100 118 148 78"/>';
      s += '<line class="s" x1="100" y1="12" x2="54" y2="78"/><circle class="f" cx="54" cy="78" r="10"/><circle class="f" cx="100" cy="12" r="3.5"/>';
      return s;
  });
  /* Réfraction : interface, normale, rayons incident et réfracté. */
  add("refraction", function () {
      var s = "";
      s += '<rect class="water" x="0" y="62" width="200" height="58"/><line class="s" x1="0" y1="62" x2="200" y2="62"/>';
      s += '<line class="s dash" x1="100" y1="10" x2="100" y2="112"/><line class="v" x1="44" y1="14" x2="100" y2="62"/><line class="v" x1="100" y1="62" x2="132" y2="110"/>';
      return s;
  });
  /* Spectres : raies d'émission. */
  add("spectrum", function () {
      var s = "";
      s += '<rect x="14" y="28" width="172" height="64" rx="4" fill="#0B1218"/>';
      [[40, "#8B5CF6"], [58, "#3B82F6"], [76, "#22D3EE"], [112, "#84CC16"], [134, "#FACC15"], [160, "#EF4444"]].forEach(function (l) { s += '<rect x="' + l[0] + '" y="28" width="3" height="64" fill="' + l[1] + '"/>'; });
      return s;
  });
  /* Signaux sonores périodiques : signal et période. */
  add("signal", function () {
      var s = "";
      s += '<line class="s dash" x1="10" y1="60" x2="190" y2="60"/>';
      s += '<path class="s" d="M14 60C28 12 48 12 62 60S96 108 110 60 144 12 158 60 180 96 188 76"/>';
      s += '<line class="v" x1="38" y1="104" x2="134" y2="104"/><line class="v" x1="38" y1="98" x2="38" y2="110"/><line class="v" x1="134" y1="98" x2="134" y2="110"/>';
      return s;
  });
  /* Principe d'inertie : positions régulières d'un mobile et vecteur vitesse. */
  add("chrono-droite", function () {
      var s = "";
      s += '<line class="s dash" x1="14" y1="70" x2="186" y2="70"/>';
      for (var b = 0; b < 7; b++) s += '<circle class="f" cx="' + (24 + b * 25) + '" cy="70" r="4.8"/>';
      s += '<line class="v" x1="24" y1="48" x2="52" y2="48"/><line class="v" x1="49" y1="43" x2="54" y2="48"/><line class="v" x1="49" y1="53" x2="54" y2="48"/>';
      return s;
  });

  /* Tableau d'avancement : réservoirs de billes (1 bille = 1 mol). Les réactifs se vident (billes en pointillé = consommées), les produits se remplissent. */
  add("avancement", function () {
    var s = "", i, row, col;
    function tube(x0) { return '<path class="s" d="M' + x0 + ' 22V102H' + (x0 + 30) + 'V22"/>'; }
    function billes(x0, plein, fantome) {
      var out = "";
      for (i = 0; i < plein + fantome; i++) {
        row = Math.floor(i / 2); col = i % 2;
        out += '<circle class="' + (i < plein ? "f" : "s dash") + '" cx="' + pt(x0 + 9.5 + col * 11) + '" cy="' + pt(95 - row * 12) + '" r="5"/>';
      }
      return out;
    }
    s += tube(12) + tube(50) + tube(122) + tube(160);
    s += billes(12, 2, 4) + billes(50, 4, 2) + billes(122, 4, 0) + billes(160, 2, 2);
    s += '<line class="v" x1="92" y1="62" x2="112" y2="62"/><path class="v" d="M106 55L113 62L106 69"/>';
    return s;
  });

  /* Champs : deux plaques (cuve), équipotentielles pointillées, lignes de champ de la plaque + vers la plaque −, sonde. */
  add("champ", function () {
    var s = "";
    s += '<rect class="f" x="20" y="14" width="8" height="92" rx="2"/><rect class="f" x="172" y="14" width="8" height="92" rx="2"/>';
    s += '<rect class="water" x="28" y="14" width="144" height="92" style="opacity:.35"/>';
    [64, 100, 136].forEach(function (x) { s += '<line class="s dash" x1="' + x + '" y1="14" x2="' + x + '" y2="106"/>'; });
    [34, 60, 86].forEach(function (y) {
      s += '<line class="v" style="stroke-width:2" x1="166" y1="' + y + '" x2="40" y2="' + y + '"/><path class="v" style="stroke-width:2" d="M49 ' + (y - 6) + 'L39 ' + y + 'L49 ' + (y + 6) + '"/>';
    });
    s += '<line class="s" x1="100" y1="60" x2="100" y2="108"/><circle class="f" cx="100" cy="60" r="4"/>';
    return s;
  });

  /* ---------- Noms génériques (anciens noms, à éviter pour une nouvelle simulation) ---------- */
  /* Générique : chronophotographie d'un lancer. */
  add("chrono", function () {
      var s = "";
      var d = "";
      for (var a = 0; a <= 8; a++) { var x = 22 + a * 19.5, y = 102 - 4.6 * a * (8 - a); d += '<circle class="f" cx="' + x + '" cy="' + y.toFixed(1) + '" r="4.6"/>'; }
      s += '<path class="s dash" d="M22 102 Q100 -50 178 102"/>' + d;
      s += '<line class="v" x1="22" y1="102" x2="38" y2="72"/>';
      return s;
  });
  /* Équation de réaction : balance à deux plateaux, mêmes atomes de chaque côté (conservation des éléments). */
  add("balance", function () {
    var s = "";
    s += '<line class="s" x1="100" y1="34" x2="100" y2="104"/><line class="s" x1="76" y1="106" x2="124" y2="106"/>';
    s += '<line class="s" x1="30" y1="36" x2="170" y2="36"/><circle class="f" cx="100" cy="36" r="4.2"/>';
    s += '<path class="s" d="M30 36L9 82M30 36L51 82M170 36L149 82M170 36L191 82"/>';
    s += '<path class="water s" d="M7 82H53Q51 95 30 95Q9 95 7 82Z"/><path class="water s" d="M147 82H193Q191 95 170 95Q149 95 147 82Z"/>';
    s += '<circle class="f" cx="19" cy="75.5" r="6.2"/><circle class="f" cx="31" cy="75.5" r="6.2"/><circle class="f" cx="43" cy="75.5" r="6.2"/><circle class="f" cx="25" cy="64" r="6.2"/><circle class="f" cx="37" cy="64" r="6.2"/>';
    s += '<circle class="f" cx="159" cy="75.5" r="6.2"/><circle class="f" cx="171" cy="75.5" r="6.2"/><circle class="f" cx="183" cy="75.5" r="6.2"/><circle class="f" cx="165" cy="64" r="6.2"/><circle class="f" cx="177" cy="64" r="6.2"/>';
    return s;
  });

  /* Générique : bécher et particules. */
  add("beaker", function () {
      var s = "";
      s += '<path class="water" d="M65 56H135V92Q135 103 124 103H76Q65 103 65 92Z" style="opacity:.3"/><path class="s" d="M62 18V92Q62 106 76 106H124Q138 106 138 92V18"/><line class="s" x1="56" y1="18" x2="144" y2="18"/>';
      s += '<circle class="f" cx="82" cy="94" r="4"/><circle class="f" cx="100" cy="97" r="4"/><circle class="f" cx="117" cy="93" r="4"/><circle class="f" cx="96" cy="78" r="3"/>';
      return s;
  });

  var Glyphs = {
    names: function () { return Object.keys(shapes); },
    has: function (name) { return Object.prototype.hasOwnProperty.call(shapes, name); },
    draw: function (name) {
      var fn = shapes[name] || shapes.graph;
      return '<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + fn() + '</svg>';
    }
  };
  global.Glyphs = Glyphs;
})(window);
