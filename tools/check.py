#!/usr/bin/env python3
"""Contrôle automatique de cohérence du site (sans dépendance, Python 3.8+).

Usage (depuis la racine du dépôt) :
    python3 tools/check.py             # erreurs bloquantes + avertissements
    python3 tools/check.py --strict    # les avertissements deviennent bloquants
    python3 tools/check.py --quiet     # n'affiche que les problèmes

Niveaux
  ERREUR       : à corriger avant fusion (catalogue incohérent, fichier manquant,
                 simulation fondée sur le socle qui ne respecte pas ses règles).
  AVERTISSEMENT: dette connue. Les simulations qui n'utilisent pas encore le socle
                 (shared/simulabo.css) sont contrôlées avec indulgence : leurs écarts
                 de charte sont signalés mais ne bloquent pas. Dès qu'une simulation
                 adopte le socle, les mêmes écarts deviennent des erreurs.

Ce contrôle vérifie des règles mécaniques (structure, ressources externes, présence
des repères d'accessibilité). Il ne remplace ni un test au clavier, ni un lecteur
d'écran, ni la relecture pédagogique.
"""
import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THEMES = {"matiere", "mouvement", "energie", "ondes"}
STATUTS = {"dispo", "prepa"}
REQUIRED = ["id", "titre", "resume", "theme", "niveau", "type", "duree", "notions", "statut", "url", "glyph"]
JSON_RE = r'<script type="application/json" id="%s">(.*?)</script>'
EXTERNAL_RE = re.compile(r'^(https?:)?//', re.I)
CSS_EXTERNAL_RE = re.compile(r'(@import\s+(url\()?["\']?|url\(\s*["\']?)(https?:)?//', re.I)


class Page(HTMLParser):
    """Relève les éléments utiles à la charte."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = None
        self.title = ""
        self._in_title = False
        self.h1 = 0
        self.viewport = False
        self.has_main = False
        self.back_link = False
        self.external = []          # ressources chargées depuis l'extérieur
        self.stylesheets = []       # href des feuilles de style
        self.scripts = []           # src des scripts
        self.imgs_without_alt = 0
        self.canvas_unlabeled = 0
        self.has_dark = False
        self._in_style = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html": self.lang = a.get("lang")
        elif tag == "title": self._in_title = True
        elif tag == "h1": self.h1 += 1
        elif tag == "main": self.has_main = True
        elif tag == "meta" and a.get("name") == "viewport": self.viewport = True
        elif tag == "style": self._in_style = True
        elif tag == "link" and "stylesheet" in (a.get("rel") or ""):
            self.stylesheets.append(a.get("href", ""))
            if EXTERNAL_RE.match(a.get("href", "")): self.external.append(a["href"])
        elif tag == "link" and a.get("rel") in ("preconnect", "dns-prefetch", "preload", "prefetch"):
            if EXTERNAL_RE.match(a.get("href", "")): self.external.append(a["href"])
        elif tag == "script" and a.get("src"):
            self.scripts.append(a["src"])
            if EXTERNAL_RE.match(a["src"]): self.external.append(a["src"])
        elif tag in ("img", "iframe", "source", "video", "audio") and EXTERNAL_RE.match(a.get("src", "") or ""):
            self.external.append(a["src"])
        if tag == "img" and "alt" not in a: self.imgs_without_alt += 1
        if tag == "canvas" and not (a.get("aria-label") or a.get("aria-labelledby") or a.get("role") == "presentation"):
            self.canvas_unlabeled += 1
        if tag == "a" and "../index.html" in (a.get("href") or ""): self.back_link = True

    def handle_endtag(self, tag):
        if tag == "title": self._in_title = False
        elif tag == "style": self._in_style = False

    def handle_data(self, data):
        if self._in_title: self.title += data
        if self._in_style:
            if "prefers-color-scheme" in data: self.has_dark = True
            if CSS_EXTERNAL_RE.search(data): self.external.append("(CSS) @import/url externe")


class Report:
    def __init__(self):
        self.errors, self.warnings = [], []

    def err(self, where, msg): self.errors.append(f"ERREUR        {where} : {msg}")
    def warn(self, where, msg): self.warnings.append(f"AVERTISSEMENT {where} : {msg}")


def load_json(text, block_id, rep, where):
    m = re.search(JSON_RE % block_id, text, re.S)
    if not m:
        rep.err(where, f"bloc JSON « {block_id} » introuvable")
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        rep.err(where, f"JSON invalide dans « {block_id} » : {e}")
        return None


def parse(path: Path) -> Page:
    p = Page()
    p.feed(path.read_text(encoding="utf-8"))
    return p


def check_catalogue(rep):
    index = ROOT / "index.html"
    text = index.read_text(encoding="utf-8")
    cat = load_json(text, "catalogue-data", rep, "index.html")
    if cat is None:
        return {}, set()
    glyphs_ok = set(re.findall(r'g === "([a-z-]+)"', text))
    ids, urls = set(), set()
    by_id = {}
    for i, e in enumerate(cat):
        where = f"catalogue[{e.get('id', i)}]"
        for k in REQUIRED:
            if k not in e: rep.err(where, f"champ « {k} » manquant")
        if e.get("id") in ids: rep.err(where, "identifiant en double")
        ids.add(e.get("id")); by_id[e.get("id")] = e
        if e.get("theme") not in THEMES: rep.err(where, f"thème inconnu « {e.get('theme')} »")
        if e.get("statut") not in STATUTS: rep.err(where, f"statut inconnu « {e.get('statut')} »")
        if glyphs_ok and e.get("glyph") not in glyphs_ok: rep.err(where, f"vignette « {e.get('glyph')} » non dessinée dans index.html")
        if not isinstance(e.get("notions"), list) or not e.get("notions"):
            rep.warn(where, "aucune notion renseignée (le moteur de recherche s'appuie dessus)")
        if len(e.get("resume", "")) > 260: rep.warn(where, "résumé long (> 260 caractères) : la carte sera tronquée")
        if e.get("statut") == "dispo":
            if not e.get("url") or not (ROOT / e["url"]).is_file(): rep.err(where, f"fichier introuvable : {e.get('url')}")
            if e.get("url") in urls: rep.err(where, "même fichier utilisé par deux entrées")
            urls.add(e.get("url"))
            if not e.get("date"): rep.warn(where, "date manquante")
        elif e.get("url"):
            rep.warn(where, "statut « prepa » mais une url est renseignée")
        if e.get("fiche") and not (ROOT / e["fiche"]).is_file(): rep.err(where, f"fiche introuvable : {e['fiche']}")
    # Simulations présentes sur disque mais absentes du catalogue
    for f in sorted((ROOT / "sims").glob("*.html")):
        if f"sims/{f.name}" not in urls:
            rep.err(f"sims/{f.name}", "absente du catalogue (index.html)")
    return by_id, urls


def check_fiches(rep, by_id):
    page = ROOT / "enseignants" / "index.html"
    if not page.is_file():
        return
    data = load_json(page.read_text(encoding="utf-8"), "fiches-data", rep, "enseignants/index.html")
    if data is None:
        return
    listed = {}
    for e in data:
        where = f"fiches-data[{e.get('id')}]"
        listed[e.get("id")] = e
        if e.get("id") not in by_id: rep.err(where, "identifiant absent du catalogue")
        if e.get("fiche") and not (ROOT / "enseignants" / e["fiche"]).is_file(): rep.err(where, f"fiche introuvable : {e['fiche']}")
        cat = by_id.get(e.get("id"))
        if cat:
            expected = "enseignants/" + e["fiche"] if e.get("fiche") else None
            if cat.get("fiche") != expected:
                rep.err(where, f"fiche différente entre le catalogue ({cat.get('fiche')}) et l'espace enseignant ({expected})")
    for cid, cat in by_id.items():
        if cat.get("statut") == "dispo" and cid not in listed:
            rep.warn(f"catalogue[{cid}]", "absente de la liste « fiches-data » de l'espace enseignant")
    # Fiches présentes sur disque mais référencées nulle part
    referenced = {e["fiche"] for e in data if e.get("fiche")}
    for f in sorted((ROOT / "enseignants" / "fiches").glob("*.html")):
        if f.name != "modele-fiche.html" and f"fiches/{f.name}" not in referenced:
            rep.warn(f"enseignants/fiches/{f.name}", "fiche non référencée dans « fiches-data »")
        p = parse(f)
        if p.external: rep.err(f"enseignants/fiches/{f.name}", "ressource externe : " + ", ".join(sorted(set(p.external))))
        if p.lang != "fr": rep.err(f"enseignants/fiches/{f.name}", "attribut lang=\"fr\" manquant")


def check_sims(rep):
    for f in sorted((ROOT / "sims").glob("*.html")):
        where = f"sims/{f.name}"
        p = parse(f)
        text = f.read_text(encoding="utf-8")
        uses_socle = any("shared/simulabo.css" in s for s in p.stylesheets)
        # Règles de charte : bloquantes pour le socle, indicatives pour l'existant.
        rule = rep.err if uses_socle else rep.warn
        tag = "" if uses_socle else " (héritage : hors socle)"

        # Règles de base : toujours bloquantes
        if p.lang != "fr": rep.err(where, "attribut lang=\"fr\" manquant")
        if not p.viewport: rep.err(where, "balise meta viewport manquante")
        if not p.title.strip(): rep.err(where, "balise <title> vide")
        if p.h1 < 1: rep.err(where, "aucun titre h1")

        # Règles de charte
        if p.h1 > 1: rule(where, f"plusieurs h1 ({p.h1}){tag}")
        if p.external: rule(where, "ressource externe (RGPD, hors-ligne) : " + ", ".join(sorted(set(p.external))) + tag)
        if not p.back_link: rule(where, "lien de retour vers ../index.html absent" + tag)
        if not p.has_dark and not uses_socle: rep.warn(where, "pas de thème sombre (prefers-color-scheme)" + tag)
        if p.imgs_without_alt: rule(where, f"{p.imgs_without_alt} image(s) sans attribut alt{tag}")
        if p.canvas_unlabeled: rule(where, f"{p.canvas_unlabeled} canvas sans aria-label{tag}")
        if not uses_socle:
            rep.warn(where, "n'utilise pas encore le socle shared/simulabo.css (migration à planifier)")
        else:
            if not any("shared/simulabo.js" in s for s in p.scripts): rep.err(where, "socle CSS sans le script shared/simulabo.js")
            if not p.has_main: rep.err(where, "élément <main> manquant")
            if "{{" in text: rep.err(where, "marque {{...}} du gabarit non remplacée")
            if "===== DÉMO" in text or "FIN DE LA DÉMO" in text: rep.err(where, "bloc DÉMO du gabarit encore présent")
            if "--bg:" in text.split("</style>")[0] and ":root" in text.split("</style>")[0]:
                rep.warn(where, "redéfinit les jetons de couleur : utiliser ceux du socle")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--strict", action="store_true", help="les avertissements font échouer le contrôle")
    ap.add_argument("--quiet", action="store_true", help="n'afficher que les problèmes")
    args = ap.parse_args()

    rep = Report()
    for needed in ("shared/simulabo.css", "shared/simulabo.js", "templates/simulation.html"):
        if not (ROOT / needed).is_file(): rep.err(needed, "fichier du socle manquant")
    by_id, _ = check_catalogue(rep)
    check_fiches(rep, by_id)
    check_sims(rep)

    for line in rep.errors + rep.warnings:
        print(line)
    n_sims = len(list((ROOT / "sims").glob("*.html")))
    if not args.quiet:
        print(f"\n{n_sims} simulation(s), {len(by_id)} entrée(s) au catalogue : "
              f"{len(rep.errors)} erreur(s), {len(rep.warnings)} avertissement(s).")
    failed = rep.errors or (args.strict and rep.warnings)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
