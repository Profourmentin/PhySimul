/* ==========================================================================
   Simulabo PhCh : socle JavaScript commun aux simulations
   --------------------------------------------------------------------------
   Rôle : fournir les briques réutilisables (curseurs, afficheurs, onglets, canvas
   net sur écrans Retina, boucle d'animation, tableau de mesures exportable, défi
   numérique, état partageable par lien) pour que chaque nouvelle simulation se
   concentre sur la physique et non sur l'interface.

   - Aucun module ni dépendance : un simple <script src="../shared/simulabo.js">,
     compatible avec une ouverture directe du fichier (file://).
   - Tout est exposé dans l'objet global `Simulabo`.
   - Les nombres sont affichés à la française (virgule décimale, vrai signe moins).
   - Aucune donnée n'est envoyée nulle part ni stockée : l'état partagé passe par
     le fragment d'URL (#...), qui ne quitte jamais le navigateur.

   Documentation : docs/socle.md
   ========================================================================== */
(function (global) {
  "use strict";

  var Simulabo = { version: "1.0.0" };

  /* ---------- Outils : DOM ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function resolve(x) { return typeof x === "string" ? $(x) : x; }

  /* h("button", {class: "primary", onclick: fn}, "Texte", autreNoeud) */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === false || v == null) return;
        if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (k === "text") el.textContent = v;
        else if (k === "html") el.innerHTML = v; // réservé à du contenu écrit par l'auteur de la simulation
        else el.setAttribute(k, v === true ? "" : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  var uid = 0;
  function nextId(prefix) { uid += 1; return (prefix || "sl") + "-" + uid; }

  /* ---------- Outils : nombres (affichage français) ---------- */
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mapRange(x, a, b, c, d) { return c + (x - a) * (d - c) / (b - a); }

  /* fmt(3.14159, 2) -> "3,14" ; fmt(-2, 1) -> "−2,0" */
  function fmt(x, digits) {
    if (x == null || !isFinite(x)) return "–";
    var d = digits == null ? 2 : digits;
    var s = Number(x).toFixed(d).replace(".", ",");
    if (/^-0(,0*)?$/.test(s)) s = s.slice(1);   // pas de « −0,0 »
    return s.replace("-", "−");
  }

  /* sig(0.0012345, 3) -> "0,00123" : n chiffres significatifs */
  function sig(x, n) {
    if (x == null || !isFinite(x)) return "–";
    if (x === 0) return "0";
    var nn = n || 3;
    var mag = Math.floor(Math.log10(Math.abs(x)));
    var d = Math.max(0, nn - 1 - mag);
    return fmt(Number(x.toPrecision(nn)), d);
  }

  /* parseNum("3,5") -> 3.5 ; renvoie NaN si le texte n'est pas un nombre */
  function parseNum(s) {
    if (typeof s === "number") return s;
    var t = String(s == null ? "" : s).trim().replace(/\s/g, "").replace("−", "-").replace(",", ".");
    if (t === "" || !/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(t)) return NaN;
    return Number(t);
  }

  /* Générateur pseudo-aléatoire à graine (mulberry32) : reproductible pour un même lien */
  function rng(seed) {
    var a = (seed == null ? Date.now() : seed) >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var reducedMotion = !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- Curseur ----------
     slider("#hote", {label:"Distance", unit:"m", min:0, max:10, step:.1, value:5, digits:1,
                      onInput: function (v) {...}})
     -> { get(), set(v, silent), el } */
  function slider(host, o) {
    host = resolve(host);
    var id = nextId("sl");
    var digits = o.digits != null ? o.digits : 1;
    var out = h("b", { id: id + "-out" });
    var input = h("input", {
      type: "range", id: id, min: o.min, max: o.max, step: o.step || "any", value: o.value
    });
    var lab = h("label", { for: id }, h("span", { text: o.label }), h("span", null, out, o.unit ? " " + o.unit : ""));
    var wrap = h("div", { class: "slider" }, lab, input);
    if (o.bounds) {
      wrap.appendChild(h("div", { class: "bounds", "aria-hidden": "true" },
        h("span", { text: fmt(o.min, digits) }), h("span", { text: fmt(o.max, digits) })));
    }
    function paint() {
      var v = Number(input.value);
      out.textContent = fmt(v, digits);
      input.setAttribute("aria-valuetext", fmt(v, digits) + (o.unit ? " " + o.unit : ""));
    }
    input.addEventListener("input", function () { paint(); if (o.onInput) o.onInput(Number(input.value)); });
    paint();
    host.appendChild(wrap);
    return {
      el: wrap, input: input,
      get: function () { return Number(input.value); },
      set: function (v, silent) { input.value = v; paint(); if (!silent && o.onInput) o.onInput(Number(input.value)); }
    };
  }

  /* ---------- Afficheur LCD ----------
     readout("#hote", {label:"Puissance", unit:"W", digits:2}) -> { set(v), el } */
  function readout(host, o) {
    host = resolve(host);
    var v = h("span", { class: "v", text: "–" });
    var el = h("div", { class: "lcd", role: "group", "aria-label": o.label },
      h("div", { class: "lab", "aria-hidden": "true", text: o.label }),
      h("div", { class: "val" }, v, o.unit ? h("span", { class: "u", text: o.unit }) : null));
    host.appendChild(el);
    return {
      el: el,
      set: function (x) { v.textContent = typeof x === "string" ? x : fmt(x, o.digits != null ? o.digits : 2); }
    };
  }

  /* ---------- Onglets à choix unique ----------
     tabs("#groupe", function (valeur) {...}, "valeur-initiale")
     Boutons attendus : <button class="tab" data-mode="valeur">…</button> */
  function tabs(group, onChange, initial) {
    group = resolve(group);
    var btns = $$(".tab", group);
    function select(value, silent) {
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === value)); });
      if (!silent && onChange) onChange(value);
    }
    btns.forEach(function (b) {
      b.setAttribute("type", "button");
      b.addEventListener("click", function () { select(b.getAttribute("data-mode")); });
    });
    var start = initial != null ? initial : (btns[0] && btns[0].getAttribute("data-mode"));
    if (start != null) select(start);
    return { select: select };
  }

  /* ---------- Interrupteurs (role="switch") : branchement automatique ---------- */
  document.addEventListener("click", function (e) {
    var sw = e.target.closest && e.target.closest('[role="switch"]');
    if (!sw || sw.disabled) return;
    sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true"));
    sw.dispatchEvent(new CustomEvent("switch", { bubbles: true, detail: { checked: sw.getAttribute("aria-checked") === "true" } }));
  });

  /* ---------- Zone d'observation ----------
     observe("#obs", "ok" | "warn" | "info" | "bad" | "", "<p>Texte</p>")
     La zone doit porter aria-live="polite" (voir le gabarit). */
  function observe(el, tone, html) {
    el = resolve(el);
    if (tone) el.setAttribute("data-tone", tone); else el.removeAttribute("data-tone");
    var p = $("[data-obs-text]", el);
    if (p && html != null) p.innerHTML = html;
  }

  /* ---------- Canvas net sur tous les écrans ----------
     const c = canvas("#cv", {width: 1000, height: 400, draw: function (ctx, w, h) {...}})
     Le dessin travaille toujours dans le repère logique w x h (ex. 1000 x 400) ;
     c.redraw() redessine, c.ctx donne le contexte. */
  function canvas(el, o) {
    el = resolve(el);
    var W = o.width || 1000, H = o.height || 400;
    var ctx = el.getContext("2d");
    function fit() {
      var dpr = clamp(global.devicePixelRatio || 1, 1, 3);
      el.width = Math.round(W * dpr);
      el.height = Math.round(H * dpr);
      el.style.aspectRatio = W + " / " + H;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function redraw() { ctx.clearRect(0, 0, W, H); if (o.draw) o.draw(ctx, W, H); }
    fit();
    if (global.matchMedia) {
      // Redessiner si le thème clair/sombre change : les couleurs lues dans les variables CSS changent.
      var mq = global.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", redraw);
    }
    redraw();
    return { ctx: ctx, redraw: redraw, width: W, height: H,
      /* Convertit un événement pointeur en coordonnées logiques du canvas */
      toLocal: function (ev) {
        var r = el.getBoundingClientRect();
        return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height };
      } };
  }

  /* Lire une variable CSS dans le dessin canvas : cssVar("--accent") */
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  /* ---------- Boucle d'animation ----------
     const b = loop(function (dt) {...})   // dt en secondes, plafonné à 0,05 s
     b.start(); b.stop(); b.running
     La boucle se met en pause quand l'onglet est masqué (économie de batterie). */
  function loop(step) {
    var raf = 0, last = 0, api = { running: false };
    function frame(t) {
      if (!api.running) return;
      var dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      step(dt);
      raf = requestAnimationFrame(frame);
    }
    api.start = function () { if (api.running) return; api.running = true; last = performance.now(); raf = requestAnimationFrame(frame); };
    api.stop = function () { api.running = false; cancelAnimationFrame(raf); };
    document.addEventListener("visibilitychange", function () { if (document.hidden && api.running) { api.stop(); api.wasRunning = true; } else if (!document.hidden && api.wasRunning) { api.wasRunning = false; api.start(); } });
    return api;
  }

  /* ---------- Tableau de mesures ----------
     const t = measureTable("#hote", {
        caption: "Mesures de puissance",
        columns: [{key:"d", label:"d", unit:"m", digits:1}, {key:"P", label:"P", unit:"W", digits:2}],
        max: 20 })
     t.add({d: 2, P: 3.1}); t.rows(); t.clear(); t.csv()
     Le bouton d'export produit un CSV lisible par Excel/LibreOffice en français (séparateur « ; », virgule décimale). */
  function measureTable(host, o) {
    host = resolve(host);
    var data = [];
    var tbody = h("tbody");
    var head = h("tr");
    o.columns.forEach(function (c) { head.appendChild(h("th", { scope: "col", text: c.label + (c.unit ? " (" + c.unit + ")" : "") })); });
    var table = h("table", { class: "mesures" }, h("caption", { text: o.caption || "Mesures" }), h("thead", null, head), tbody);
    var status = h("p", { class: "status", "aria-live": "polite" });
    var bClear = h("button", { type: "button", class: "small", text: "Effacer le tableau" });
    var bCsv = h("button", { type: "button", class: "small", text: "Exporter en CSV" });
    var wrap = h("div", null, h("div", { class: "tablewrap" }, table), h("div", { class: "row", style: "margin-top:8px" }, bClear, bCsv), status);
    host.appendChild(wrap);

    function paint() {
      tbody.textContent = "";
      if (!data.length) {
        tbody.appendChild(h("tr", null, h("td", { class: "empty", colspan: o.columns.length, text: o.empty || "Aucune mesure pour l'instant." })));
        return;
      }
      data.forEach(function (r) {
        var tr = h("tr");
        o.columns.forEach(function (c) { tr.appendChild(h("td", { text: typeof r[c.key] === "number" ? fmt(r[c.key], c.digits != null ? c.digits : 2) : (r[c.key] == null ? "" : r[c.key]) })); });
        tbody.appendChild(tr);
      });
    }
    function csv() {
      var lines = [o.columns.map(function (c) { return c.label + (c.unit ? " (" + c.unit + ")" : ""); }).join(";")];
      data.forEach(function (r) {
        lines.push(o.columns.map(function (c) {
          var v = r[c.key];
          if (typeof v === "number") return String(v).replace(".", ",");
          return v == null ? "" : '"' + String(v).replace(/"/g, '""') + '"';
        }).join(";"));
      });
      return "﻿" + lines.join("\r\n");
    }
    bClear.addEventListener("click", function () { api.clear(); status.textContent = "Tableau effacé."; });
    bCsv.addEventListener("click", function () {
      if (!data.length) { status.textContent = "Rien à exporter : le tableau est vide."; return; }
      var blob = new Blob([csv()], { type: "text/csv;charset=utf-8" });
      var a = h("a", { href: URL.createObjectURL(blob), download: (o.filename || "mesures") + ".csv" });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      status.textContent = "Fichier CSV téléchargé.";
    });
    var api = {
      el: wrap,
      add: function (row) {
        if (o.max && data.length >= o.max) { status.textContent = "Tableau complet (" + o.max + " mesures maximum)."; return false; }
        data.push(row); paint(); status.textContent = "Mesure " + data.length + " ajoutée."; return true;
      },
      rows: function () { return data.slice(); },
      clear: function () { data = []; paint(); },
      csv: csv
    };
    paint();
    return api;
  }

  /* ---------- Défi numérique ----------
     defi("#hote", {
        question: "Quelle est la puissance à 4 m ?", unit: "W", answer: 3.2,
        tolerance: 0.05,                       // tolérance relative (5 %), ou {abs: 0.1}
        hint: "Utilise la loi en 1/d².",
        explain: "P = k / d², donc …",         // affiché après réponse
        onResult: function (ok, value) {...} })
     Accepte la virgule ou le point. Le retour ne dit jamais seulement « faux » : il oriente. */
  function defi(host, o) {
    host = resolve(host);
    var id = nextId("df");
    var input = h("input", { type: "text", inputmode: "decimal", id: id, autocomplete: "off", style: "min-height:44px;font:600 16px var(--font-data);padding:6px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);width:9em" });
    var fb = h("div", { class: "fb", role: "status", "aria-live": "polite", hidden: true });
    var bOk = h("button", { type: "button", class: "primary", text: "Vérifier" });
    var tries = 0;
    var hintBtn = o.hint ? h("button", { type: "button", class: "small", text: "Un indice" }) : null;
    var el = h("div", { class: "card" },
      h("label", { for: id, html: o.question }),
      h("div", { class: "row" }, input, o.unit ? h("span", { text: o.unit }) : null, bOk, hintBtn),
      fb);
    host.appendChild(el);

    function show(tone, html) { fb.hidden = false; fb.setAttribute("data-tone", tone); fb.innerHTML = html; }
    function check() {
      var v = parseNum(input.value);
      if (isNaN(v)) { show("warn", "<b>À vérifier :</b> entre un nombre (la virgule est acceptée)."); input.focus(); return; }
      tries += 1;
      var tol = o.tolerance == null ? 0.05 : o.tolerance;
      var gap = Math.abs(v - o.answer);
      var ok = typeof tol === "object" ? gap <= tol.abs : gap <= Math.abs(o.answer) * tol;
      if (ok) show("ok", "<b>Bravo.</b> " + (o.explain || ""));
      else if (o.explain && tries >= 2) show("bad", "<b>Pas encore.</b> " + o.explain);
      else show("bad", "<b>Pas encore.</b> " + (v > o.answer ? "Ta valeur est trop grande." : "Ta valeur est trop petite.") + " Relis les données et recommence.");
      if (o.onResult) o.onResult(ok, v, tries);
    }
    bOk.addEventListener("click", check);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
    if (hintBtn) hintBtn.addEventListener("click", function () { show("warn", "<b>Indice :</b> " + o.hint); });
    return { el: el, check: check, reset: function () { input.value = ""; fb.hidden = true; tries = 0; } };
  }

  /* ---------- État partageable par lien ----------
     const etat = shareState({d: 5, angle: 30});   // valeurs par défaut
     etat.read()            -> {d, angle} (lit le fragment #d=5&angle=30)
     etat.write({d: 4})     -> met à jour l'URL sans recharger
     etat.link()            -> URL complète à copier
     Le fragment reste dans le navigateur : rien n'est transmis au serveur. */
  function shareState(defaults) {
    function read() {
      var out = {};
      Object.keys(defaults).forEach(function (k) { out[k] = defaults[k]; });
      var hash = (global.location.hash || "").replace(/^#/, "");
      if (!hash) return out;
      hash.split("&").forEach(function (pair) {
        var kv = pair.split("=");
        var k = decodeURIComponent(kv[0] || "");
        if (!(k in defaults)) return;
        var raw = decodeURIComponent(kv[1] || "");
        out[k] = typeof defaults[k] === "number" ? (isNaN(Number(raw)) ? defaults[k] : Number(raw)) : raw;
      });
      return out;
    }
    function write(obj) {
      var parts = Object.keys(obj).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]); });
      try { global.history.replaceState(null, "", "#" + parts.join("&")); } catch (e) { /* ouverture en file:// ou iframe : sans effet */ }
    }
    return { read: read, write: write, link: function () { return global.location.href; } };
  }

  /* ---------- Export ---------- */
  Simulabo.$ = $; Simulabo.$$ = $$; Simulabo.h = h;
  Simulabo.clamp = clamp; Simulabo.lerp = lerp; Simulabo.mapRange = mapRange;
  Simulabo.fmt = fmt; Simulabo.sig = sig; Simulabo.parseNum = parseNum; Simulabo.rng = rng;
  Simulabo.reducedMotion = reducedMotion;
  Simulabo.slider = slider; Simulabo.readout = readout; Simulabo.tabs = tabs; Simulabo.observe = observe;
  Simulabo.canvas = canvas; Simulabo.cssVar = cssVar; Simulabo.loop = loop;
  Simulabo.measureTable = measureTable; Simulabo.defi = defi; Simulabo.shareState = shareState;
  global.Simulabo = Simulabo;
})(window);
