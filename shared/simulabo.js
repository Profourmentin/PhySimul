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

  var Simulabo = { version: "1.1.0" };

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


  /* ---------- Prédire · Observer · Expliquer (v2, bêta) ----------
     Démarche en trois temps : l'élève s'engage sur une prédiction AVANT de manipuler,
     observe, puis confronte sa prédiction à l'observation et explique avec ses mots.
     Le retour ne dit jamais seulement « faux » : un écart est présenté comme une information.

     const p = poe("#poe", {
        question: "Si on double la période T, que devient la fréquence f ?",
        choices: [{id:"a", text:"Elle double"}, {id:"b", text:"Elle est divisée par 2"}, {id:"c", text:"Elle ne change pas"}],
        answer: "b",
        observe: "Règle T à 4 ms puis à 8 ms et compare les fréquences affichées.",
        explain: "f = 1 / T : si T double, f est divisée par 2.",
        why: { a: "…", c: "…" },            // optionnel : message ciblé selon la mauvaise prédiction
        lock: "#zone-simulation",          // optionnel : zone rendue inactive (inert) jusqu'à la prédiction
        confidence: true,                  // optionnel (défaut true) : « Sûr·e de toi ? »
        onStep: function (n) {}            // optionnel : 1 prédire, 2 observer, 3 expliquer
     });
     p.state()  -> {prediction, confidence, observation, explanation, step, match}
     p.reset()
     Rien n'est envoyé ni enregistré : « Copier ma démarche » place le texte dans le presse-papiers. */
  function poe(host, o) {
    host = resolve(host);
    var id = nextId("poe");
    var lockEl = o.lock ? resolve(o.lock) : null;
    var useConf = o.confidence !== false;
    var st = { step: 1, prediction: null, confidence: null, observation: "", explanation: "", match: null, skipped: false };
    var LAB = ["", "Pas sûr·e", "Plutôt sûr·e", "Sûr·e"];

    function radios(name, items) {
      return items.map(function (c) {
        var rid = id + "-" + name + "-" + c.id;
        return h("label", { class: "poe-opt", for: rid }, h("input", { type: "radio", name: id + "-" + name, id: rid, value: c.id }), h("span", { html: c.text }));
      });
    }
    var choiceBox = h("fieldset", { class: "poe-fs" }, h("legend", { html: o.question }));
    radios("c", o.choices).forEach(function (n) { choiceBox.appendChild(n); });
    var confBox = null;
    if (useConf) {
      var confRow = h("div", { class: "row" });
      radios("k", [{ id: "1", text: LAB[1] }, { id: "2", text: LAB[2] }, { id: "3", text: LAB[3] }]).forEach(function (n) { confRow.appendChild(n); });
      confBox = h("fieldset", { class: "poe-fs poe-conf" }, h("legend", { text: "À quel point es-tu sûr·e de ta prédiction ?" }), confRow);
    }
    var bPredict = h("button", { type: "button", class: "primary", text: "Valider ma prédiction" });
    var bSkip = h("button", { type: "button", class: "small", text: "Explorer d'abord, sans prédire" });
    var err1 = h("p", { class: "status err", role: "alert" });

    var p1 = h("div", { class: "poe-panel", "data-s": "1" },
      h("h3", { tabindex: "-1", text: "1. Prédis" }),
      h("p", { class: "help", text: "Avant de toucher à la simulation, choisis ce qui va se passer. Se tromper n'est pas grave : l'écart avec l'observation est justement ce qui fait comprendre." }),
      choiceBox, confBox, h("div", { class: "row" }, bPredict, bSkip), err1);

    var recap = h("p", { class: "poe-recap" });
    var notes = h("textarea", { id: id + "-obs", rows: "2", class: "poe-ta", placeholder: "Par exemple : les valeurs que tu as lues, ce qui a changé…" });
    var bObs = h("button", { type: "button", class: "primary", text: "J'ai observé : comparer avec ma prédiction" });
    var p2 = h("div", { class: "poe-panel", "data-s": "2", hidden: true },
      h("h3", { tabindex: "-1", text: "2. Observe" }), recap,
      h("p", { html: o.observe }),
      h("label", { for: id + "-obs", class: "poe-lab", text: "Mes observations (facultatif)" }), notes, h("div", { class: "row" }, bObs));

    var cmp = h("div", { class: "fb", role: "status", "aria-live": "polite" });
    var expl = h("textarea", { id: id + "-exp", rows: "3", class: "poe-ta", placeholder: "Écris ton explication, même incomplète." });
    var bExp = h("button", { type: "button", class: "primary", text: "Voir l'explication attendue" });
    var expected = h("div", { class: "fb", "data-tone": "info", hidden: true });
    var bCopy = h("button", { type: "button", class: "small", text: "Copier ma démarche" });
    var bReset = h("button", { type: "button", class: "small", text: "Recommencer" });
    var status3 = h("p", { class: "status", "aria-live": "polite" });
    var p3 = h("div", { class: "poe-panel", "data-s": "3", hidden: true },
      h("h3", { tabindex: "-1", text: "3. Explique" }), cmp,
      h("label", { for: id + "-exp", class: "poe-lab", text: o.explainPrompt || "Avec tes mots, explique ce que tu as observé." }), expl,
      h("div", { class: "row" }, bExp), expected, h("div", { class: "row" }, bCopy, bReset), status3);

    var steps = h("ol", { class: "poe-steps", "aria-label": "Étapes" },
      h("li", { text: "Prédire" }), h("li", { text: "Observer" }), h("li", { text: "Expliquer" }));
    var root = h("section", { class: "poe", id: id }, h("h2", { text: "Prédire · Observer · Expliquer" }), steps, p1, p2, p3);
    host.appendChild(root);

    function choiceText(cid) { var f = o.choices.filter(function (c) { return c.id === cid; })[0]; return f ? f.text.replace(/<[^>]+>/g, "") : ""; }
    function go(n, noFocus) {
      st.step = n;
      [p1, p2, p3].forEach(function (p, i) { p.hidden = i + 1 !== n; });
      Array.prototype.forEach.call(steps.children, function (li, i) {
        if (i + 1 === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
        li.className = i + 1 < n ? "done" : "";
      });
      if (lockEl) { if (n >= 2) lockEl.removeAttribute("inert"); else lockEl.setAttribute("inert", ""); lockEl.classList.toggle("poe-locked", n < 2); }
      var hd = $("h3", [p1, p2, p3][n - 1]); if (hd && !noFocus) hd.focus();
      if (o.onStep) o.onStep(n);
    }
    function checked(name) { var r = $('input[name="' + id + "-" + name + '"]:checked', root); return r ? r.value : null; }

    bPredict.addEventListener("click", function () {
      var c = checked("c"), k = useConf ? checked("k") : "0";
      if (!c) { err1.textContent = "Choisis une réponse avant de valider."; return; }
      if (!k) { err1.textContent = "Indique aussi ton degré de certitude."; return; }
      err1.textContent = "";
      st.prediction = c; st.confidence = useConf ? Number(k) : null; st.skipped = false;
      recap.innerHTML = "Ta prédiction : <b></b>" + (useConf ? " (" + LAB[Number(k)].toLowerCase() + ")" : "") + ".";
      $("b", recap).textContent = choiceText(c);
      go(2);
    });
    bSkip.addEventListener("click", function () {
      st.prediction = null; st.confidence = null; st.skipped = true;
      recap.textContent = "Tu explores sans avoir prédit. Tu pourras comparer avec la réponse attendue à l'étape suivante.";
      go(2);
    });
    bObs.addEventListener("click", function () {
      st.observation = notes.value.trim();
      var ok = st.prediction != null && st.prediction === o.answer;
      st.match = st.prediction == null ? null : ok;
      var tone, html;
      if (st.prediction == null) { tone = "info"; html = "<b>Pas de prédiction à comparer.</b> Lis l'explication attendue ci-dessous et vérifie qu'elle correspond à ce que tu as observé."; }
      else if (ok) { tone = "ok"; html = "<b>Ta prédiction se confirme.</b> Ce que tu as observé correspond à ce que tu attendais."; }
      else {
        tone = "warn"; html = "<b>Ta prédiction ne correspond pas à l'observation.</b> C'est une information utile : ce que tu pensais n'est pas ce qui se produit. ";
        if (o.why && o.why[st.prediction]) html += o.why[st.prediction];
        if (st.confidence === 3) html += " Tu étais sûr·e de toi : retourne dans la simulation et regarde précisément ce qui t'a surpris·e.";
      }
      cmp.setAttribute("data-tone", tone); cmp.innerHTML = html;
      go(3);
    });
    bExp.addEventListener("click", function () {
      st.explanation = expl.value.trim();
      if (!st.explanation) { status3.textContent = "Écris d'abord ton explication, même en une phrase : c'est elle que l'on compare ensuite."; expl.focus(); return; }
      status3.textContent = ""; expected.hidden = false; expected.innerHTML = "<b>Explication attendue.</b> " + o.explain;
    });
    function summary() {
      var lines = ["Prédiction : " + (st.prediction ? choiceText(st.prediction) + (st.confidence ? " (" + LAB[st.confidence].toLowerCase() + ")" : "") : "non prédit"),
        "Observations : " + (st.observation || "—"), "Mon explication : " + (st.explanation || expl.value.trim() || "—")];
      return lines.join("\n");
    }
    bCopy.addEventListener("click", function () {
      var t = summary();
      function fb() { status3.textContent = "Copie automatique impossible : sélectionne et copie ton texte à la main."; }
      try { navigator.clipboard.writeText(t).then(function () { status3.textContent = "Démarche copiée : colle-la dans ton cahier ou ton document."; }, fb); } catch (e) { fb(); }
    });
    function reset() {
      st = { step: 1, prediction: null, confidence: null, observation: "", explanation: "", match: null, skipped: false };
      $$("input[type=radio]", root).forEach(function (r) { r.checked = false; });
      notes.value = ""; expl.value = ""; expected.hidden = true; status3.textContent = ""; err1.textContent = "";
      go(1);
    }
    bReset.addEventListener("click", reset);
    if (lockEl) { lockEl.setAttribute("inert", ""); lockEl.classList.add("poe-locked"); }
    go(1, true); // au chargement, on ne déplace pas le focus : le lien d'évitement et le fil d'Ariane restent les premiers atteints au clavier
    return { el: root, state: function () { var c = {}; Object.keys(st).forEach(function (k) { c[k] = st[k]; }); return c; }, reset: reset, step: function () { return st.step; } };
  }

  /* ---------- Pied de page commun (v2) ----------
     footer("#hote", {base: "../"})   // base : chemin relatif vers la racine du site */
  function footer(host, o) {
    host = resolve(host); var b = (o && o.base) || "";
    host.appendChild(h("footer", { class: "sim-footer" },
      h("span", { text: "Simulabo PhCh · simulations libres d'accès, sans compte ni collecte de données." }),
      h("a", { href: b + "index.html", text: "Catalogue" }), h("a", { href: b + "enseignants/index.html", text: "Enseignants" }),
      h("a", { href: b + "a-propos/index.html", text: "À propos" }), h("a", { href: b + "a-propos/accessibilite.html", text: "Accessibilité" }),
      h("a", { href: b + "a-propos/licence.html", text: "Licence" })));
  }

  /* ---------- Export ---------- */
  Simulabo.$ = $; Simulabo.$$ = $$; Simulabo.h = h;
  Simulabo.clamp = clamp; Simulabo.lerp = lerp; Simulabo.mapRange = mapRange;
  Simulabo.fmt = fmt; Simulabo.sig = sig; Simulabo.parseNum = parseNum; Simulabo.rng = rng;
  Simulabo.reducedMotion = reducedMotion;
  Simulabo.slider = slider; Simulabo.readout = readout; Simulabo.tabs = tabs; Simulabo.observe = observe;
  Simulabo.canvas = canvas; Simulabo.cssVar = cssVar; Simulabo.loop = loop;
  Simulabo.measureTable = measureTable; Simulabo.defi = defi; Simulabo.shareState = shareState;
  Simulabo.poe = poe; Simulabo.footer = footer;
  global.Simulabo = Simulabo;
})(window);
