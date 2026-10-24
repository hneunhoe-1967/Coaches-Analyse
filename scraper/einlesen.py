#!/usr/bin/env python3
"""
Einlese-Skript der Coaches-Analyse.

Liest von 2basketballbundesliga.de für ProA, ProB Nord und ProB Süd:
  - die Teamstatistik (eine Seite je Liga),
  - die Tabelle (eine Seite je Liga),
  - die Kader-Seite jedes Teams (Kader, Spielplan, Spielerstatistik),
prüft die Werte und schreibt alles in eine Datei (daten.json), die die App lädt.

Aufruf:
  python einlesen.py --modus voll          # alle 47 Kader-Seiten neu einlesen
  python einlesen.py --modus aktualisieren # nur Teams, die seit dem letzten Lauf gespielt haben
  python einlesen.py --team 527            # eine Kader-Seite einlesen und anzeigen (zum Testen)

Sicherheitsnetz: Erkennt das Skript, dass sich der Aufbau der Liga-Seiten geändert
hat, bricht es mit Exit-Code 1 ab und lässt die bisherige daten.json unverändert.
"""
from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import sys
import time
import unicodedata
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup

BASE = "https://www.2basketballbundesliga.de"
KADER_PFAD = "/teams/kader/?id={id}"
LIGEN = {
    "proa": {"name": "ProA", "tabelle": "/tabelle-proa/", "teamstat": "/teamstatistik-proa/"},
    "probn": {"name": "ProB Nord", "tabelle": "/tabelle-prob-nord/", "teamstat": "/teamstatistik-prob-nord/"},
    "probs": {"name": "ProB Süd", "tabelle": "/tabelle-prob-sued/", "teamstat": "/teamstatistik-prob-sued/"},
}
PAUSE_SEK = 1.5           # Pause zwischen zwei Abrufen, um den Liga-Server zu schonen
KADER_MAX_ALTER_TAGE = 7  # Kader-Seiten spätestens nach so vielen Tagen neu einlesen (Spielverlegungen)
USER_AGENT = "Coaches-Analyse-Einleser/1.0 (Kontakt: bitte im README eintragen)"
TZ = ZoneInfo("Europe/Berlin")

# Kurzname (Ort) je Team-ID für die Anzeige „Auswärts in …“. Fehlt ein Team, nutzt die App den vollen Namen.
KURZNAMEN = {
    "412": "Rhöndorf",
    "416": "Leverkusen",
    "421": "Gießen",
    "425": "Bayreuth",
    "432": "Tübingen",
    "435": "Quakenbrück",
    "436": "Bochum",
    "439": "Bremerhaven",
    "441": "Braunschweig",
    "444": "Essen",
    "445": "Schwelm",
    "446": "Crailsheim",
    "447": "Nürnberg",
    "475": "Paderborn",
    "476": "Iserlohn",
    "477": "Göttingen",
    "482": "Langen",
    "488": "Heidelberg",
    "510": "Herten",
    "513": "Bernau",
    "527": "Kirchheim",
    "529": "Speyer",
    "536": "Düsseldorf",
    "537": "Neu-Ulm",
    "538": "Frankfurt",
    "539": "Wedel",
    "545": "Sandersdorf",
    "547": "Dresden",
    "548": "Westerstede",
    "555": "Itzehoe",
    "556": "Köln",
    "557": "Karlsruhe",
    "558": "München",
    "559": "Coburg",
    "562": "Münster",
    "563": "Erfurt",
    "564": "Oberhaching",
    "569": "Koblenz",
    "570": "Wolmirstedt",
    "573": "Leitershofen",
    "575": "Ludwigsburg",
    "582": "Fellbach",
    "584": "Rostock",
    "585": "Neustadt",
    "588": "Weimar",
    "591": "Reutlingen",
    "593": "Hagen",
}


class StrukturFehler(Exception):
    """Der Aufbau einer Liga-Seite entspricht nicht mehr dem erwarteten Muster."""


# ---------------------------------------------------------------- Hilfsfunktionen

def hole(session: requests.Session, pfad: str) -> str:
    url = BASE + pfad
    for versuch in range(3):
        try:
            antwort = session.get(url, timeout=30)
            if antwort.status_code == 200:
                time.sleep(PAUSE_SEK)
                antwort.encoding = antwort.encoding or "utf-8"
                return antwort.text
            if antwort.status_code in (429, 500, 502, 503, 504):
                time.sleep(10 * (versuch + 1))
                continue
            raise RuntimeError(f"{url}: HTTP {antwort.status_code}")
        except requests.RequestException as fehler:
            if versuch == 2:
                raise RuntimeError(f"{url}: {fehler}") from fehler
            time.sleep(10 * (versuch + 1))
    raise RuntimeError(f"{url}: keine Antwort nach drei Versuchen")


def norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]", "", text)


def zellen(tr):
    return tr.find_all(["td", "th"], recursive=False)


def kopf(tabelle) -> list[str]:
    erste = tabelle.find("tr")
    if not erste:
        return []
    return [z.get_text(" ", strip=True) for z in zellen(erste)]


def spalte(k: list[str], name: str, exakt: bool = False) -> int:
    for i, text in enumerate(k):
        if (text == name) if exakt else text.startswith(name):
            return i
    raise StrukturFehler(f"Spalte „{name}“ fehlt (gefunden: {k})")


def erste_zeile(zelle) -> str:
    text = zelle.get_text("\n", strip=True)
    return text.split("\n")[0].strip() if text else ""


def zahlen(text: str) -> list[int]:
    return [int(x) for x in re.findall(r"-?\d+", text)]


def anzeige_stand(roh: str | None) -> str | None:
    if not roh:
        return None
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})", roh)
    return f"{m.group(3)}.{m.group(2)}.{m.group(1)}, {m.group(4)}:{m.group(5)} Uhr" if m else roh


def letzte_aktualisierung(soup) -> str | None:
    m = re.search(r"Letzte Aktualisierung:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})", soup.get_text(" "))
    return m.group(1) if m else None


def jetzt() -> datetime:
    return datetime.now(TZ).replace(microsecond=0)


# ---------------------------------------------------------------- Teamstatistik

def lies_teamstat(html: str):
    """Liefert {team_id: (kuerzel, [17 Summenwerte])} und den Stand der Seite."""
    soup = BeautifulSoup(html, "html.parser")
    for tabelle in soup.find_all("table"):
        k = kopf(tabelle)
        if "RA" not in k or "Team" not in k or "EF" not in k:
            continue
        i = {n: spalte(k, n, exakt=n in ("P", "A", "F", "G")) for n in
             ("Team", "G", "2P", "3P", "FT", "P", "A", "R:", "F", "BL", "ST", "TO", "EF")}
        teams = {}
        for tr in tabelle.find_all("tr")[1:]:
            c = zellen(tr)
            if len(c) < len(k):
                continue
            link = c[i["Team"]].find("a", href=re.compile(r"id=\d+"))
            if not link:
                continue
            if "." in erste_zeile(c[i["P"]]):
                break  # das ist bereits die Tabelle „Schnitt“, nicht „Gesamt“
            tid = int(re.search(r"id=(\d+)", link["href"]).group(1))
            p2, p3, ft = (zahlen(erste_zeile(c[i[n]]))[:2] for n in ("2P", "3P", "FT"))
            reb = zahlen(erste_zeile(c[i["R:"]]))[:3]
            einzeln = [zahlen(erste_zeile(c[i[n]]))[0] for n in ("P", "A", "F", "BL", "ST", "TO", "EF")]
            g = zahlen(erste_zeile(c[i["G"]]))[0]
            werte = [g, *p2, *p3, *ft, einzeln[0], einzeln[1], *reb, *einzeln[2:]]
            if len(werte) != 17:
                raise StrukturFehler(f"Teamstatistik: unerwartete Werte für Team {tid}: {werte}")
            teams[tid] = (link.get_text(strip=True), werte)
        if teams:
            return teams, letzte_aktualisierung(soup)
    raise StrukturFehler("Teamstatistik-Tabelle nicht gefunden")


# ---------------------------------------------------------------- Kader-Seite

def _spieler_link_id(tag) -> int | None:
    link = tag.find("a", href=re.compile(r"/spieler/\d+"))
    return int(re.search(r"/spieler/(\d+)", link["href"]).group(1)) if link else None


def _lies_personen(tabelle) -> dict[int, dict]:
    k = kopf(tabelle)
    i_pos = spalte(k, "Pos", exakt=True)
    personen = {}
    for tr in tabelle.find_all("tr")[1:]:
        c = zellen(tr)
        links = [a for a in tr.find_all("a", href=re.compile(r"/spieler/\d+"))]
        if len(c) < len(k) or not links:
            continue
        pid = int(re.search(r"/spieler/(\d+)", links[0]["href"]).group(1))
        vor = links[0].get_text(" ", strip=True)
        nach = links[1].get_text(" ", strip=True) if len(links) > 1 else ""
        personen[pid] = {
            "nr": c[0].get_text(strip=True),
            "vor": vor,
            "nach": nach.replace("*", "").strip(),
            "pos": c[i_pos].get_text(strip=True),
            "u22": "*" in nach,
        }
    return personen


def _lies_spielplan(tabelle) -> list[list]:
    k = kopf(tabelle)
    i = {n: spalte(k, n) for n in ("Spieltag", "Datum", "Uhrzeit", "Heim", "Gast", "Ergebnis")}
    spiele = []
    for tr in tabelle.find_all("tr")[1:]:
        c = zellen(tr)
        if len(c) < len(k):
            continue
        if not re.search(r"\bHR\b", c[0].get_text(" ", strip=True)):
            continue  # nur Hauptrunde, keine Pokalspiele
        datum = re.search(r"(\d{2})\.(\d{2})\.(\d{4})", c[i["Datum"]].get_text(" "))
        uhr = re.search(r"(\d{1,2}):(\d{2})", c[i["Uhrzeit"]].get_text(" "))
        heim = c[i["Heim"]].find("img", src=re.compile(r"/lt/\d+"))
        gast = c[i["Gast"]].find("img", src=re.compile(r"/lt/\d+"))
        if not (datum and heim and gast):
            continue
        st = zahlen(c[i["Spieltag"]].get_text(" "))
        erg = re.search(r"(\d+)\s*:\s*(\d+)", c[i["Ergebnis"]].get_text(" "))
        zeit = f"{int(uhr.group(1)):02d}:{uhr.group(2)}" if uhr else "00:00"
        spiele.append([
            f"{datum.group(3)}-{datum.group(2)}-{datum.group(1)}T{zeit}",
            st[0] if st else None,
            int(re.search(r"/lt/(\d+)", heim["src"]).group(1)),
            int(re.search(r"/lt/(\d+)", gast["src"]).group(1)),
            int(erg.group(1)) if erg else None,
            int(erg.group(2)) if erg else None,
        ])
    return spiele


def _lies_boxscore(tabelle) -> tuple[list[dict], int]:
    k = kopf(tabelle)
    i = {n: spalte(k, n, exakt=n in ("P", "A", "F", "G")) for n in
         ("G", "Min", "2P", "3P", "FT", "P", "A", "R:", "F", "BL", "ST", "TO", "EF", "PM")}
    zeilen, ohne_id = [], 0
    for tr in tabelle.find_all("tr")[1:]:
        c = zellen(tr)
        if len(c) < len(k):
            continue
        link = c[0].find("a", href=re.compile(r"/spieler/"))
        if not link:
            continue  # z. B. „Teamaktionen“
        m = re.search(r"/spieler/(\d+)", link["href"])
        if not m:
            ohne_id += 1  # Zeile ohne Spieler-ID (Datenfehler auf der Liga-Seite)
            continue
        text = c[0].get_text(" ", strip=True)
        nr = re.match(r"#\s*(\d+)\s*(.*)", text)
        p2, p3, ft = (zahlen(erste_zeile(c[i[n]]))[:2] for n in ("2P", "3P", "FT"))
        reb = zahlen(erste_zeile(c[i["R:"]]))[:3]
        zeilen.append({
            "pid": int(m.group(1)),
            "nr": int(nr.group(1)) if nr else None,
            "name": (nr.group(2) if nr else text).strip(),
            "g": zahlen(erste_zeile(c[i["G"]]))[0],
            "min": erste_zeile(c[i["Min"]]),
            "werte": [*p2, *p3, *ft] + [zahlen(erste_zeile(c[i["P"]]))[0], zahlen(erste_zeile(c[i["A"]]))[0], *reb]
                     + [zahlen(erste_zeile(c[i[n]]))[0] for n in ("F", "BL", "ST", "TO", "EF", "PM")],
        })
    return zeilen, ohne_id


def lies_kader(html: str, team_punkte: int | None = None) -> dict:
    """Liest Name, Liga, Spielplan und Spielerstatistik (Hauptrunde) einer Kader-Seite."""
    soup = BeautifulSoup(html, "html.parser")
    name = liga = saison = None
    for h in soup.find_all(["h1", "h2", "h3", "h4"]):
        m = re.match(r"(.+?)\s+-\s+(ProA|ProB Nord|ProB Süd)\s+-\s+(\d{4})/(\d{4})", h.get_text(" ", strip=True))
        if m:
            name, liga, saison = m.group(1).strip(), m.group(2), f"{m.group(3)}/{m.group(4)[2:]}"
            break
    if not name:
        raise StrukturFehler("Teamname auf der Kader-Seite nicht gefunden")

    kader, abgaenge, spielplan, boxen = {}, {}, None, []
    for tabelle in soup.find_all("table"):
        k = kopf(tabelle)
        if "Pos" in k and "kg" in k and "Datum" not in k:
            kader.update(_lies_personen(tabelle))
        elif "Pos" in k and "Datum" in k:
            vorher = tabelle.find_previous(string=re.compile(r"Abgänge|Zugänge"))
            if vorher and "Abgänge" in vorher:
                abgaenge.update(_lies_personen(tabelle))
        elif "Spieltag" in k and "Heim" in k and spielplan is None:
            spielplan = _lies_spielplan(tabelle)
        elif k and k[0].startswith("Player") and any(x.startswith("PM") for x in k):
            boxen.append(_lies_boxscore(tabelle))
    if not boxen:
        raise StrukturFehler("Spielerstatistik auf der Kader-Seite nicht gefunden")

    # Die Seite kann mehrere Boxscores enthalten (Hauptrunde, Pokal, Gesamt).
    # Gewählt wird der, dessen Punktsumme zur Teamstatistik der Hauptrunde passt, sonst der erste.
    wahl, ohne_id = boxen[0]
    if team_punkte is not None:
        for zeilen, leer in boxen:
            if sum(z["werte"][6] for z in zeilen) == team_punkte:
                wahl, ohne_id = zeilen, leer
                break

    spieler = []
    for z in wahl:
        person = kader.get(z["pid"]) or abgaenge.get(z["pid"])
        if person:
            vor, nach, pos = person["vor"], person["nach"], person["pos"]
        else:
            teile = z["name"].split(" ")
            vor, nach, pos = " ".join(teile[:-1]), teile[-1], "–"
        hinweis = "left" if (z["pid"] not in kader and z["pid"] in abgaenge) else ("U22" if person and person["u22"] else None)
        zeile = [z["nr"], f"{vor}|{nach}", pos, z["g"], z["min"], *z["werte"]]
        if hinweis:
            zeile.append(hinweis)
        spieler.append(zeile)

    return {
        "name": name, "liga": liga, "saison": saison, "spieler": spieler,
        "spiele": spielplan or [], "stand": letzte_aktualisierung(soup), "ohne_id": ohne_id,
    }


# ---------------------------------------------------------------- Tabelle

def lies_tabelle(html: str, namen: dict[str, int]):
    soup = BeautifulSoup(html, "html.parser")
    zeilen, markiert = {}, None
    schluessel = list(namen.keys())
    for tr in soup.find_all("tr"):
        c = [z.get_text(" ", strip=True) for z in zellen(tr)]
        if len(c) < 13 or not re.fullmatch(r"\d+", c[0] or ""):
            continue
        if not (re.fullmatch(r"\d+-\d+", c[9]) and re.fullmatch(r"\d+-\d+", c[10])):
            continue
        roh = c[1]
        n = norm(roh.replace("*", ""))
        tid = namen.get(n)
        if tid is None:
            treffer = difflib.get_close_matches(n, schluessel, n=1, cutoff=0.8)
            tid = namen[treffer[0]] if treffer else None
        if tid is None or tid in zeilen:
            continue
        try:
            werte = [int(c[2]), int(c[3]), int(c[4]), int(c[5]), int(c[6]), int(c[7])]
            serie = int(c[12])
        except ValueError:
            continue
        if "*" in roh:
            markiert = tid
        zeilen[tid] = (int(c[0]), [tid, *werte, c[9].replace("-", "–"), c[10].replace("-", "–"), serie])
    tabelle = [z for _, z in sorted(zeilen.values(), key=lambda x: x[0])]
    hinweis = None
    m = re.search(r"\*\)\s*([^\n]+?)(?:\s{2,}|$)", soup.get_text("\n"), re.M)
    if m:
        hinweis = "* " + m.group(1).strip()
    return tabelle, letzte_aktualisierung(soup), markiert, hinweis


def berechne_tabelle(ids: list[int], spiele: list[list]) -> list[list]:
    """Ersatz, falls die offizielle Tabelle nicht lesbar ist (ohne Punktabzüge und Direktvergleich)."""
    st = {t: {"g": 0, "s": 0, "n": 0, "p": 0, "m": 0, "hs": 0, "hn": 0, "gs": 0, "gn": 0, "folge": []} for t in ids}
    for d, _, h, a, hp, ap in sorted((s for s in spiele if s[4] is not None), key=lambda s: s[0]):
        if h not in st or a not in st:
            continue
        for team, eig, geg, heim in ((h, hp, ap, True), (a, ap, hp, False)):
            x = st[team]
            x["g"] += 1; x["p"] += eig; x["m"] += geg
            sieg = eig > geg
            x["s" if sieg else "n"] += 1
            x[("hs" if sieg else "hn") if heim else ("gs" if sieg else "gn")] += 1
            x["folge"].append(sieg)
    zeilen = []
    for t, x in st.items():
        serie = 0
        for sieg in reversed(x["folge"]):
            if serie == 0 or (serie > 0) == sieg:
                serie += 1 if sieg else -1
            else:
                break
        zeilen.append([t, x["g"], x["s"], x["n"], 2 * x["s"], x["p"], x["m"],
                       f'{x["hs"]}–{x["hn"]}', f'{x["gs"]}–{x["gn"]}', serie])
    return sorted(zeilen, key=lambda z: (-z[4], -(z[5] - z[6]), -z[5]))


# ---------------------------------------------------------------- Ablauf

def einlesen(modus: str, ausgabe: str) -> int:
    alt = None
    if os.path.exists(ausgabe):
        with open(ausgabe, encoding="utf-8") as f:
            alt = json.load(f)
    alt_ts = (alt or {}).get("teamstat", {})
    alt_spieler = (alt or {}).get("spieler", {})
    alt_teams = (alt or {}).get("teams", {})
    alt_pruef = (alt or {}).get("pruefung", {})

    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT
    start = jetzt()
    warnungen: list[str] = []

    # 1) Teamstatistik je Liga: liefert die Team-IDs, Kürzel und Summenwerte
    teamstat, team_liga, kuerzel, ts_stand = {}, {}, {}, {}
    for lk, liga in LIGEN.items():
        teams, stand = lies_teamstat(hole(session, liga["teamstat"]))
        if len(teams) < 10:
            raise StrukturFehler(f"{liga['name']}: nur {len(teams)} Teams in der Teamstatistik gefunden")
        ts_stand[lk] = stand
        for tid, (kz, werte) in teams.items():
            teamstat[tid], team_liga[tid], kuerzel[tid] = werte, lk, kz

    # 2) Kader-Seiten: alle (voll) oder nur Teams mit Änderungen
    grenze = start - timedelta(days=KADER_MAX_ALTER_TAGE)
    zu_laden = []
    for tid in teamstat:
        s = str(tid)
        geladen = alt_teams.get(s, {}).get("kaderGeladen")
        if (modus == "voll" or s not in alt_spieler or alt_ts.get(s) != teamstat[tid]
                or not alt_pruef.get(s, {}).get("ok", False)
                or not geladen or datetime.fromisoformat(geladen) < grenze):
            zu_laden.append(tid)

    kader, fehler = {}, []
    for nr, tid in enumerate(zu_laden, 1):
        print(f"  Kader {nr}/{len(zu_laden)}: Team {tid}", flush=True)
        try:
            kader[tid] = lies_kader(hole(session, KADER_PFAD.format(id=tid)), teamstat[tid][7])
        except (StrukturFehler, RuntimeError) as e:
            fehler.append(f"Team {tid}: {e}")
    if zu_laden and len(fehler) > max(3, len(zu_laden) // 2):
        raise StrukturFehler("Zu viele Kader-Seiten nicht lesbar:\n  " + "\n  ".join(fehler[:10]))
    warnungen += [f"Kader-Seite nicht lesbar, alter Stand bleibt: {f}" for f in fehler]

    # 3) Teams, Spieler und Spiele zusammenführen
    teams, spieler, spiele = {}, {}, {}
    for s in (alt or {}).get("spiele", []):
        spiele[(s[2], s[3])] = s
    saison = (alt or {}).get("saison")
    for tid in teamstat:
        s = str(tid)
        alt_t = alt_teams.get(s, {})
        if tid in kader:
            k = kader[tid]
            saison = k["saison"] or saison
            teams[s] = {"c": kuerzel[tid], "n": k["name"], "s": KURZNAMEN.get(s, k["name"]), "l": team_liga[tid],
                        "kaderStand": anzeige_stand(k["stand"]), "kaderGeladen": start.isoformat()}
            spieler[s] = k["spieler"]
            for key in [key for key in spiele if tid in key]:
                del spiele[key]
            for sp in k["spiele"]:
                spiele[(sp[2], sp[3])] = sp
            if k["ohne_id"]:
                warnungen.append(f"{k['name']}: {k['ohne_id']} Spielerzeile(n) ohne Namen auf der Kader-Seite ignoriert")
        elif alt_t:
            teams[s] = {**alt_t, "c": kuerzel[tid], "l": team_liga[tid]}
            if s in alt_spieler:
                spieler[s] = alt_spieler[s]
        else:
            teams[s] = {"c": kuerzel[tid], "n": kuerzel[tid], "s": kuerzel[tid], "l": team_liga[tid],
                        "kaderStand": None, "kaderGeladen": None}

    # Nur Spiele zwischen Teams derselben Liga behalten
    spiele_liste = sorted((s for s in spiele.values()
                           if str(s[2]) in teams and str(s[3]) in teams
                           and teams[str(s[2])]["l"] == teams[str(s[3])]["l"]), key=lambda s: (s[0], s[2]))

    # 4) Prüfung: Summe der Spielerpunkte = Teampunkte laut Teamstatistik
    pruefung = {}
    for s, zeilen in spieler.items():
        summe = sum(z[11] for z in zeilen)
        team_p = teamstat[int(s)][7]
        max_g = max((z[3] for z in zeilen), default=0)
        ok = summe == team_p and max_g == teamstat[int(s)][0]
        pruefung[s] = {"spielerPunkte": summe, "teamPunkte": team_p, "spielerSpiele": max_g, "ok": ok}
        if not ok:
            warnungen.append(f"{teams[s]['n']}: Spielerwerte ({max_g} Spiele, {summe} Punkte) passen nicht zur "
                             f"Teamstatistik ({teamstat[int(s)][0]} Spiele, {team_p} Punkte). Die Kader-Seite ist "
                             "vermutlich noch nicht aktualisiert und wird beim nächsten Lauf erneut eingelesen.")

    # 5) Tabellen je Liga
    namen = {norm(t["n"]): int(s) for s, t in teams.items()}
    ligen = {}
    for lk, liga in LIGEN.items():
        ids = [tid for tid, l in team_liga.items() if l == lk]
        tabelle, stand, markiert, hinweis = lies_tabelle(hole(session, liga["tabelle"]), namen)
        if len({z[0] for z in tabelle} & set(ids)) != len(ids):
            warnungen.append(f"{liga['name']}: Tabelle nicht vollständig lesbar, sie wurde aus den Ergebnissen "
                             "berechnet (ohne Punktabzüge und Direktvergleich).")
            tabelle, markiert = berechne_tabelle(ids, spiele_liste), None
        if len(ids) % 2 == 1:
            frei = f"{len(ids)} Teams: An jedem Spieltag hat ein Team spielfrei, daher unterscheidet sich die Zahl der Spiele."
            hinweis = f"{hinweis} {frei}" if hinweis else frei
        ligen[lk] = {"name": liga["name"], "tableUrl": BASE + liga["tabelle"], "tsUrl": BASE + liga["teamstat"],
                     "tableStand": anzeige_stand(stand), "tsStand": anzeige_stand(ts_stand[lk]),
                     "note": hinweis, "mark": markiert, "table": [z for z in tabelle if z[0] in ids]}

    daten = {
        "version": 1, "saison": saison, "stand": start.isoformat(), "ligen": ligen, "teams": teams,
        "teamstat": {str(t): w for t, w in teamstat.items()}, "spiele": spiele_liste,
        "spieler": spieler, "pruefung": pruefung, "warnungen": warnungen,
    }
    os.makedirs(os.path.dirname(os.path.abspath(ausgabe)), exist_ok=True)
    tmp = ausgabe + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(daten, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, ausgabe)

    bericht = [
        f"## Einlesen {start:%d.%m.%Y %H:%M} ({modus})",
        f"- Teams: {len(teams)}, davon mit Spielerwerten: {len(spieler)}",
        f"- Kader-Seiten neu eingelesen: {len(kader)} von {len(zu_laden)} angefordert",
        f"- Spiele im Datenbestand: {len(spiele_liste)}",
        f"- Prüfung bestanden: {sum(1 for p in pruefung.values() if p['ok'])} von {len(pruefung)} Teams",
    ] + ([f"- Hinweis: {w}" for w in warnungen] or ["- Keine Hinweise"])
    print("\n".join(bericht))
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write("\n".join(bericht) + "\n")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Liest die Daten der 2. Basketball Bundesliga für die Coaches-Analyse ein.")
    ap.add_argument("--modus", choices=["aktualisieren", "voll"], default="aktualisieren")
    ap.add_argument("--ausgabe", default=os.path.join(os.path.dirname(__file__), "..", "docs", "daten", "daten.json"))
    ap.add_argument("--team", type=int, help="nur diese Kader-Seite einlesen und anzeigen (Test)")
    args = ap.parse_args()
    try:
        if args.team:
            s = requests.Session()
            s.headers["User-Agent"] = USER_AGENT
            print(json.dumps(lies_kader(hole(s, KADER_PFAD.format(id=args.team))), ensure_ascii=False, indent=1))
            return 0
        return einlesen(args.modus, args.ausgabe)
    except StrukturFehler as e:
        print(f"ABBRUCH: Der Aufbau der Liga-Seiten hat sich geändert. Die bisherigen Daten bleiben erhalten.\n{e}",
              file=sys.stderr)
        return 1
    except RuntimeError as e:
        print(f"ABBRUCH: Die Liga-Seiten waren nicht erreichbar. Die bisherigen Daten bleiben erhalten.\n{e}",
              file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
