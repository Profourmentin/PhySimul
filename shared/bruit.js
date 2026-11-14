/* ==========================================================================
   Simulabo PhCh : bruit de mesure commun à toutes les animations
   --------------------------------------------------------------------------
   Rôle : au laboratoire, une mesure n'est jamais exacte. Par défaut, les grandeurs
   « mesurées » (capteur, multimètre, oscilloscope, sonde) sont donc affichées avec
   un petit bruit aléatoire ; un interrupteur « Modèle théorique » le supprime pour
   montrer la valeur exacte du modèle.

   >>> RÉGLAGE GLOBAL : le niveau de bruit se règle à UN seul endroit <<<
   Ligne « SIMULABO_BRUIT » ci-dessous : fraction de la grandeur mesurée
   (0.005 = 0,5 %). Mettre 0 supprime le bruit partout. Une page peut aussi définir
   `window.SIMULABO_BRUIT = 0.01;` AVANT de charger ce script (essai local, démonstration).

   Modèle : bruit gaussien d'écart-type  σ = niveau × échelle  (l'échelle est la valeur
   mesurée elle-même, ou l'amplitude / la pleine échelle pour un signal qui passe par
   zéro), borné à ±3 σ pour qu'aucune mesure ne soit aberrante.

   Utilisation (aucune dépendance, compatible avec une ouverture directe en file://) :
     Bruit.appliquer(valeur [, echelle [, cle]])   valeur bruitée (ou exacte en mode théorique)
         - sans « cle » : tirage aléatoire neuf à chaque appel (nouvelle mesure)
         - avec « cle » (entier) : même bruit pour la même clé (courbe redessinée, sonde à
           la même position) : pas de scintillement
     Bruit.lecture(id, valeur [, echelle [, periodeMs]])   afficheur en direct : le bruit
         est renouvelé toutes les periodeMs (250 ms par défaut), pas à chaque image
     Bruit.actif()           vrai si le bruit s'applique (faux en modèle théorique)
     Bruit.niveau()          niveau courant (fraction)
     Bruit.theorique(bool)   lit ou fixe le mode théorique
     Bruit.auChangement(fn)  fn(actif) est appelée à chaque changement de mode
     Bruit.bascule(hote, {onChange})   construit l'interrupteur « Modèle théorique »
     Bruit.lien()            « theo=1 » en mode théorique, sinon « » (pour un lien partageable)
   Le mode théorique peut aussi être demandé par l'adresse de la page : …#theo=1

   Documentation : docs/socle.md, section « Bruit de mesure »
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---------- RÉGLAGE GLOBAL ---------- */
  if (typeof global.SIMULABO_BRUIT !== "number") global.SIMULABO_BRUIT = 0.005;   // 0,5 %

  var theorique = /[#&?]theo=1(?:&|$)/.test(String(global.location && global.location.hash));
  var ecouteurs = [];

  function niveau() {
    var n = global.SIMULABO_BRUIT;
    return (typeof n === "number" && isFinite(n) && n > 0) ? n : 0;
  }
  function actif() { return !theorique && niveau() > 0; }

  /* ---------- Tirages ---------- */
  function borne(z) { return Math.max(-3, Math.min(3, z)); }

  function gauss() {                                    // N(0, 1) par Box-Muller
    var u = 1 - Math.random(), v = Math.random();
    return borne(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
  }
  function hash(n) {                                    // entier -> réel dans [0, 1[, déterministe
    var t = (n | 0) + 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function gaussCle(cle) {                              // N(0, 1) déterministe pour une clé entière
    var u = 1 - hash(cle * 2 + 1), v = hash(cle * 2 + 2);
    return borne(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
  }

  /* ---------- Application du bruit ---------- */
  function appliquer(valeur, echelle, cle) {
    if (!actif() || !isFinite(valeur)) return valeur;
    var ref = (echelle == null) ? Math.abs(valeur) : Math.abs(echelle);
    if (!(ref > 0)) return valeur;
    var z = (cle == null) ? gauss() : gaussCle(Math.round(cle));
    return valeur + niveau() * ref * z;
  }

  var memoire = {};
  function lecture(id, valeur, echelle, periodeMs) {
    if (!actif() || !isFinite(valeur)) return valeur;
    var ref = (echelle == null) ? Math.abs(valeur) : Math.abs(echelle);
    if (!(ref > 0)) return valeur;
    var now = Date.now(), m = memoire[id];
    if (!m || now - m.t >= (periodeMs || 250)) { m = memoire[id] = { t: now, z: gauss() }; }
    return valeur + niveau() * ref * m.z;
  }

  /* ---------- Mode théorique ---------- */
  function fixer(b) {
    b = !!b;
    if (b === theorique) return theorique;
    theorique = b;
    memoire = {};
    for (var i = 0; i < ecouteurs.length; i++) { try { ecouteurs[i](actif()); } catch (e) { /* un écouteur ne doit pas bloquer les autres */ } }
    return theorique;
  }
  function mode(b) { return b === undefined ? theorique : fixer(b); }
  function auChangement(fn) { if (typeof fn === "function") ecouteurs.push(fn); }
  function lien() { return theorique ? "theo=1" : ""; }

  function pct() {
    return (niveau() * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 }).replace(/ /g, " ") + " %";
  }

  /* ---------- Interrupteur « Modèle théorique » ---------- */
  var CSS =
    ".bruit-ctl{display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin:6px 0}" +
    ".bruit-sw{display:inline-flex;align-items:center;gap:10px;min-height:var(--tap,44px);padding:6px 12px;font:600 15px/1.2 var(--font-body,system-ui,sans-serif);" +
    "color:var(--ink,#1a2330);background:var(--surface,var(--bg,#fff));border:1px solid var(--line,#b9c4cc);border-radius:var(--radius-sm,8px);cursor:pointer;text-align:left}" +
    ".bruit-sw:focus-visible{outline:3px solid var(--focus,#1B5E8C);outline-offset:2px}" +
    ".bruit-sw .bruit-track{display:block;flex:none;width:34px;height:20px;border-radius:10px;background:var(--line,#b9c4cc);padding:2px;transition:background .15s}" +
    ".bruit-sw .bruit-knob{display:block;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.35);transition:transform .15s}" +
    ".bruit-sw[aria-checked=true]{border-color:var(--accent,#0E7566)}" +
    ".bruit-sw[aria-checked=true] .bruit-track{background:var(--accent,#0E7566)}" +
    ".bruit-sw[aria-checked=true] .bruit-knob{transform:translateX(14px)}" +
    ".bruit-etat{margin:0;font:400 13px/1.35 var(--font-body,system-ui,sans-serif);color:var(--muted,#55626e);max-width:60ch}" +
    "@media (prefers-reduced-motion:reduce){.bruit-sw .bruit-track,.bruit-sw .bruit-knob{transition:none}}" +
    "@media (forced-colors:active){.bruit-sw[aria-checked=true]{outline:2px solid Highlight}}";
  var cssPose = false;
  function poserCss() {
    if (cssPose || !global.document) return;
    cssPose = true;
    var st = document.createElement("style");
    st.id = "bruit-css";
    st.appendChild(document.createTextNode(CSS));
    document.head.appendChild(st);
  }

  function bascule(hote, o) {
    o = o || {};
    if (typeof hote === "string") hote = document.querySelector(hote);
    if (!hote) return null;
    poserCss();

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bruit-sw";
    btn.setAttribute("role", "switch");
    btn.innerHTML = '<span class="bruit-track" aria-hidden="true"><span class="bruit-knob"></span></span><span>' + (o.label || "Modèle théorique") + "</span>";
    var etat = document.createElement("p");
    etat.className = "bruit-etat";
    etat.setAttribute("aria-live", "polite");
    var cadre = document.createElement("div");
    cadre.className = "bruit-ctl";
    cadre.appendChild(btn);
    cadre.appendChild(etat);
    hote.appendChild(cadre);

    function dessiner() {
      btn.setAttribute("aria-checked", theorique ? "true" : "false");
      etat.textContent = niveau() === 0
        ? "Le bruit de mesure est désactivé sur ce site."
        : (theorique
            ? "Modèle théorique : les mesures sont exactes, sans bruit."
            : "Comme au laboratoire : les mesures sont bruitées (environ " + pct() + " de la valeur).");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();                                    // le socle branche aussi les role="switch" : on évite le double basculement
      fixer(!theorique);
      if (typeof o.onChange === "function") o.onChange(actif(), theorique);
    });
    auChangement(dessiner);
    dessiner();
    return { el: cadre, button: btn, set: function (b) { fixer(b); dessiner(); } };
  }

  global.Bruit = {
    appliquer: appliquer, lecture: lecture, actif: actif, niveau: niveau, theorique: mode,
    auChangement: auChangement, bascule: bascule, lien: lien, texteNiveau: pct,
    gauss: gauss, gaussCle: gaussCle
  };
  if (global.Simulabo) global.Simulabo.bruit = global.Bruit;
})(window);
