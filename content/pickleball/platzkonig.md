---
sport: pickleball
title: Platzkönig
category: Game
skill_requirement: All Levels
skills_trained:
  - Drucksituationen
  - Punkte
half_court: false
players: 3+
duration: {min: 8, max: 12}
materials:

summary: Schnelle Punkte mit Fokus auf Drucksituationen seitens des "Platzkönigs".
diagram:
  players:
    - { id: e1, team: A, x: 0.501, y: -0.017, label: P }
    - { id: e2, team: B, x: 0.505, y: 1.02, label: S }
    - { id: e3, team: W, x: 0.672, y: 1.087, label: W1 }
    - { id: e4, team: W, x: 0.793, y: 1.088, label: W2 }
    - { id: e5, team: W, x: 0.914, y: 1.088, label: W3 }
  arrows:
  markers:
    - { id: e6, type: ball, x: 0.417, y: 1.102 }
    - { id: e7, type: ball, x: 0.449, y: 1.094 }
    - { id: e8, type: ball, x: 0.403, y: 1.088 }
    - { id: e9, type: ball, x: 0.554, y: 0.995 }
    - { id: e10, type: ball, x: 0.688, y: 1.06 }
    - { id: e11, type: ball, x: 0.813, y: 1.062 }
    - { id: e12, type: ball, x: 0.927, y: 1.062 }
  zones:
---

## Aufbau
Ein Spieler beginnt als $Platzkönig$ {P} und befindet sich alleine auf einer Seite des Platzes.
Die restlichen Spieler {S} & {W1}... befinden sich auf der anderen Seite.

## Ablauf
Spieler {S} hat immer Angabe. Für die Angabe muss {S} hinter der Grundlinie stehen.
- Verliert {S} den Punkt, stellt er sich hinten an, {W1} ist als nächstes dran und wird zu {S}.
- Gewinnt {S} den Punkt, hat er erneut Angabe.
  - Sobald 3 Punkte in Folge gewonnen wurden, wird er der neue $Platzkönig$ {P}, wechselt die Seite, und der vorherige Platzkönig stellt sich in die Warteschlange {W3}.

Punkte kann nur der Platzkönig machen. Jeder gewonnene Ballwechseln zählt 1 Punkt.

## Ziel
Das Spiel kann 
- auf Zeit gespielt werden, oder 
- bis ein Spieler z.B. 11 Punkte hat.

## Trainer Hinweise
Es ist ratsam vor dem Spiel alle Bälle auf die Seite von {S} & {W1} zu bringen. Von der Seite wird immer aufgeschlagen, wodurch viele Bälle verbraucht werden.

## Variationen
- Unfaire Angabe - Erlaube es die Angabe (weiterhin von hinter der Grundlinie) jederzeit und egal wo hin zu machen. Explizit erlaubt sind dabei Angaben, bevor der Platzkönig wieder bereit ist. Dies bringt mehr Wechsel in das Spiel und setzt den Platzkönig unter mehr Druck.
- Geringere Fehler-Anzahl für den Wechsel. Wenn 3 Punkte in Folge gewinnen zu schwer ist, kann man auch nur z.B. 2 Punkte in Folge verlangen.
- [Todespunkt](#todespunkt)
