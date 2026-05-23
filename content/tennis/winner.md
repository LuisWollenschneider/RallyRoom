---
sport: tennis
title: Winner
category: Game
skill_requirement: Intermediate
skills_trained:
  - Schmetterball
  - Volley
  - Winner
half_court: false
stages: []
diagram_stage: yellow
players: 6+
duration: {min: 8, max: 8}
materials:
  - Ballkorb
summary: Geeignet für große Gruppen
diagram:
  players:
    - { id: e1, team: A, x: 0.322, y: -0.01, label: G1 }
    - { id: e2, team: A, x: 0.678, y: -0.008, label: G2 }
    - { id: e3, team: B, x: 0.318, y: 0.575, label: N1 }
    - { id: e4, team: B, x: 0.675, y: 0.574, label: N2 }
    - { id: e5, team: W, x: 0.312, y: -0.081, label: W1 }
    - { id: e6, team: W, x: 0.665, y: -0.082, label: W2 }
    - { id: e10, team: W, x: -0.045, y: 0.639, label: T }
  arrows:
    - { id: e11, x1: -0.006, y1: 0.611, x2: 0.269, y2: 0.043, type: ball, cx: 0.053, cy: 0.26, midTouched: true }
  markers:
    - { id: e7, type: ball, x: -0.114, y: 0.59 }
    - { id: e8, type: ball, x: -0.074, y: 0.596 }
    - { id: e9, type: ball, x: -0.11, y: 0.612 }
  zones:
---

## Aufbau

Spieler bilden 2er Teams. Ein Team startet am Netz, der Rest auf der gegenüberliegenden Seite an der Grundlinie.
Dort ist zeitgleich immer nur ein Team an der Reihe, die restlichen Teams warten dahinter.

Der Trainer {T} steht auf höhe vom Netz mit dem Ballkorb zum anspielen.

## Ablauf

Punkte können nur vom Netz-Team {N1}&{N2} gemacht werden. Und auch nur durch $Winner$-Schläge. D.h. der Ball muss 2x aufkommen, ohne dass er von einem Gegner zuvor berührt wird.

Der Trainer spielt nacheinander Bälle, abwechselnd, den Grundlinien-Spielern {G1}&{G2} zu.
- Wenn {G1}/{G2} einen $Winner$ schlägen ({N1}&{N2} kommen nicht an den Ball, bevor dieser 2x aufkommt), wechselt {G1}&{G2} zur Netzposition {N1}&{N2}. Und {N1}&{N2} stellen sich auf der gegenüberliegenden Seite hinten an. Und das nächste Team {W1}&{W2} ist an der Reihe.
- Wenn {G1}/{G2} den Punkt normal gewinnen, bzw. {N1}/{N2} einen Fehler machen, gibt es $1 Fehler Netz$. Bei dem 2. Fehler am Netz, wird ebenfalls gewechselt. {G1}&{G2} -> {N1}&{N2} -> {W1}&{W2}.
- Wenn {N1}/{N2} einen $Winner$ schlägen, gibt es "1 Punkt" für das Team. Dies sind die wichtigen Punkte!
- Wenn {N1}/{N2} den Punkt normal gewinnen, bzw. {G1}/{G2} einen Fehler macht, gibt es $1 Fehler Grundlinie$. Bei dem 3. Fehler an der Grundlinie, wird gewechselt. Aber nur an der Grundlinie, die Netz-Spieler bleiben stehen. {G1}&{G2} <-> {W1}&{W2}.

Bei jedem Wechsel von {G1}&{G2} -> {N1}&{N2}, ruft der Trainer laut $WINNER$. Dies dient als Signal zum Wechsel, und leitet das nächste Trainer-Anspiel ein, welches dabei immer ein hoher, langer Ball ist, welchen das nachrückende Team als Schmetterball spielen soll.

Der Trainer zählt jederzeit die Fehler als z.B. $"2 Fehler Grundlinie, 1 Fehler Netz"$ laut an.

## Ziel
Gespielt wird bis der Korb leer ist.

## Trainer Hinweise
- Mit stärkeren Spielern sollte man den hohen, langen Ball zwingen aufkommen zu lassen, um den Schmetterball zu verlangsamen, anderenfalls hat das einwechselnde Netz-Team fast keine Chance diesen Ball zu bekommen.

- Ebenfalls kann man beim ersten Ball Lobs verbieten, um mehr Volleys am Netz und flache, schnelle Bälle von der Grundlinie zu erzwingen.
