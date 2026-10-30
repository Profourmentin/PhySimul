#!/usr/bin/env python3
"""Crée une nouvelle simulation à partir du gabarit et l'inscrit au catalogue.

Usage (depuis la racine du dépôt) :
    python3 tools/new-sim.py                       # mode interactif
    python3 tools/new-sim.py --titre "Réfraction de la lumière" --theme ondes \
        --niveau Seconde --resume "Fais varier l'angle d'incidence." --duree 15 \
        --notions "Snell-Descartes, indice de réfraction" --glyph refraction

Ce que fait l'outil :
  1. copie templates/simulation.html vers sims/<fichier>.html (sans jamais écraser) ;
  2. remplace les {{marques}} ;
  3. ajoute l'entrée au bloc JSON « catalogue-data » de index.html. Si une carte
     « en préparation » du même titre existe déjà, elle est activée sur place
     (pas de doublon) en conservant son identifiant.
Il ne touche à rien d'autre. Relire ensuite le diff (git diff) avant de proposer la pull request.
"""
import argparse
import datetime
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
THEMES = {
    "matiere": "Constitution et transformations de la matière",
    "mouvement": "Mouvement et interactions",
    "energie": "L'énergie : conversions et transferts",
    "ondes": "Ondes et signaux",
}
NIVEAUX = ["Seconde", "Première", "Première spé", "Terminale", "Terminale spé"]
TYPES = ["Simulation", "Jeu", "Activité"]
GLYPHS = ["bench", "chrono", "chrono-droite", "refraction", "spectrum", "beaker",
          "titration", "gas", "circuit", "orbit", "pendulum", "reaction"]
CATALOGUE_RE = re.compile(r'(<script type="application/json" id="catalogue-data">)(.*?)(</script>)', re.S)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def ask(label, default=None, choices=None):
    hint = f" [{'/'.join(choices)}]" if choices else ""
    dflt = f" ({default})" if default is not None else ""
    while True:
        value = input(f"{label}{hint}{dflt} : ").strip() or (default if default is not None else "")
        if value and (not choices or value in choices):
            return value
        print("  Valeur attendue." if not choices else f"  Choisir parmi : {', '.join(choices)}")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--titre")
    p.add_argument("--theme", choices=list(THEMES))
    p.add_argument("--niveau", choices=NIVEAUX)
    p.add_argument("--resume", help="Une phrase qui donne envie d'ouvrir la simulation.")
    p.add_argument("--duree", type=int, help="Durée indicative en minutes.")
    p.add_argument("--notions", help="Notions séparées par des virgules.")
    p.add_argument("--type", choices=TYPES, default="Simulation")
    p.add_argument("--glyph", choices=GLYPHS)
    p.add_argument("--fichier", help="Nom de fichier sans extension (par défaut : dérivé du titre).")
    p.add_argument("--dry-run", action="store_true", help="Afficher ce qui serait fait sans rien écrire.")
    a = p.parse_args()

    interactive = sys.stdin.isatty()
    if not a.titre and interactive: a.titre = ask("Titre")
    if not a.theme and interactive: a.theme = ask("Thème", choices=list(THEMES))
    if not a.niveau and interactive: a.niveau = ask("Niveau", choices=NIVEAUX)
    if not a.resume and interactive: a.resume = ask("Résumé (une phrase)")
    if a.duree is None and interactive: a.duree = int(ask("Durée en minutes", "20"))
    if not a.notions and interactive: a.notions = ask("Notions (séparées par des virgules)", "")
    if not a.glyph and interactive: a.glyph = ask("Vignette", "chrono", GLYPHS)

    missing = [k for k in ("titre", "theme", "niveau", "resume") if not getattr(a, k)]
    if missing:
        p.error("paramètres manquants : " + ", ".join("--" + m for m in missing))

    sim_id = slugify(a.titre)
    fichier = slugify(a.fichier) if a.fichier else sim_id
    target = ROOT / "sims" / f"{fichier}.html"
    if target.exists():
        print(f"Erreur : {target.relative_to(ROOT)} existe déjà (rien n'est écrasé).", file=sys.stderr)
        return 1

    index = ROOT / "index.html"
    html = index.read_text(encoding="utf-8")
    m = CATALOGUE_RE.search(html)
    if not m:
        print("Erreur : bloc catalogue-data introuvable dans index.html.", file=sys.stderr)
        return 1
    catalogue = json.loads(m.group(2))
    same = [e for e in catalogue if e["id"] == sim_id or e["titre"].strip().lower() == a.titre.strip().lower()]
    existing = same[0] if same else None
    if existing and existing.get("statut") != "prepa":
        print(f"Erreur : « {existing['titre']} » ({existing['id']}) existe déjà au catalogue.", file=sys.stderr)
        return 1
    if existing:
        sim_id = existing["id"]   # on garde l'identifiant de la carte « en préparation »

    notions = [n.strip() for n in (a.notions or "").split(",") if n.strip()]
    if existing and not notions:
        notions = existing.get("notions", [])
    entry = {
        "id": sim_id, "titre": a.titre, "resume": a.resume,
        "theme": a.theme, "niveau": a.niveau, "type": a.type, "duree": a.duree or 20,
        "notions": notions, "statut": "dispo", "url": f"sims/{fichier}.html",
        "date": datetime.date.today().isoformat(), "glyph": a.glyph or "chrono",
    }

    # Même mise en forme que les entrées existantes (lisible dans un diff).
    def j(x): return json.dumps(x, ensure_ascii=False)
    block = (
        "  {\n"
        f'    "id": {j(entry["id"])},\n'
        f'    "titre": {j(entry["titre"])},\n'
        f'    "resume": {j(entry["resume"])},\n'
        f'    "theme": {j(entry["theme"])}, "niveau": {j(entry["niveau"])}, "type": {j(entry["type"])}, "duree": {entry["duree"]},\n'
        f'    "notions": {j(entry["notions"])},\n'
        f'    "statut": "dispo", "url": {j(entry["url"])}, "date": {j(entry["date"])}, "glyph": {j(entry["glyph"])}\n'
        "  }"
    )
    body = m.group(2)
    if existing:
        # Remplace le bloc de la carte « en préparation » (blocs plats : de « {\n    "id" » à « \n  } »).
        pat = re.compile(r'  \{\n    "id": ' + re.escape(json.dumps(existing["id"], ensure_ascii=False)) + r',.*?\n  \}', re.S)
        if not pat.search(body):
            print("Erreur : bloc de la carte existante introuvable (mise en forme inattendue).", file=sys.stderr)
            return 1
        new_body = pat.sub(lambda _m: block, body, count=1)
        action = "carte « en préparation » activée"
    else:
        body = body.rstrip()
        if not body.endswith("]"):
            print("Erreur : format inattendu du bloc catalogue-data.", file=sys.stderr)
            return 1
        new_body = body[:-1].rstrip() + ",\n" + block + "\n]\n"
        action = "entrée ajoutée"

    template = (ROOT / "templates" / "simulation.html").read_text(encoding="utf-8")
    subs = {
        "{{TITRE}}": a.titre.replace("&", "&amp;").replace("<", "&lt;"),
        "{{RESUME}}": a.resume.replace("&", "&amp;").replace("<", "&lt;").replace('"', "&quot;"),
        "{{THEME}}": a.theme, "{{THEME_LABEL}}": THEMES[a.theme],
        "{{NIVEAU}}": a.niveau, "{{ID}}": sim_id,
    }
    for k, v in subs.items():
        template = template.replace(k, v)
    # Le mode d'emploi du gabarit n'a pas sa place dans la simulation produite.
    template = re.sub(r"<!--GABARIT-DEBUT.*?GABARIT-FIN-->", "<!-- Simulation créée avec le gabarit Simulabo : voir docs/socle.md. -->", template, flags=re.S)

    if a.dry_run:
        print(f"[essai] créerait {target.relative_to(ROOT)} ; catalogue : {action} :\n{block}")
        return 0

    target.write_text(template, encoding="utf-8")
    index.write_text(html[:m.start(2)] + "\n" + new_body.lstrip("\n") + html[m.end(2):], encoding="utf-8")
    print(f"Créé : {target.relative_to(ROOT)}")
    print(f"Catalogue : {action} dans index.html")
    print("Suite : remplacer le bloc DÉMO par votre simulation, puis  python3 tools/check.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
