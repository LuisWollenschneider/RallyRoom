---
sport: tennis
title: Todespunkt
category: Game
skill_requirement: All Levels
skills_trained:
  - Drucksituationen
  - Punkte
half_court: false
stages: [orange, green, yellow]
diagram_stage: yellow
players: 3+
duration: {min: 5, max: 10}
materials:
  - Stoppuhr
summary: Überleben auf Zeit
diagram:
  players:
    - { id: e1, team: A, x: 0.508, y: -0.018, label: A }
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
    - { id: e16, type: text, x: 0.489, y: 0.151, color: '#e8ede4', text: '❤️❤️💔', size: 35 }
  zones:
---

Variation von [Platzkönig](#platzkonig)

## Aufbau
- Ein Spieler {A} ist alleine auf einer Seite des Platzes.
- Die restlichen Spieler {S} + {W1} befinden sich auf der anderen Seite.
- {A} beginnt mit $3 Leben$
- Zu Beginn der Runde wird eine Stoppuhr gestartet.

## Ablauf
Spieler {S} hat immer Angabe. Für die Angabe muss {S} hinter der Grundlinie stehen.
- Verliert {S} den Punkt, stellt er sich hinten an, {W1} ist als nächstes dran und wird zu {S}.
- Gewinnt {S} den Punkt, hat er erneut Angabe.
  - Sobald 3 Punkte in Folge gewonnen wurden, verliert {A} ein Leben.

## Ziel
Das Spiel endet sobald {A} keine Leben mehr hat.

Danach ist ein neuer Spieler als {A} an der Reihe.

- Gewinner ist, wer am längsten überlebt.

## Trainer Hinweise
- Es ist ratsam vor dem Spiel alle Bälle auf die Seite von {S} + {W1} zu bringen. Von der Seite wird immer aufgeschlagen, wodurch viele Bälle verbraucht werden.
- Man kann zusätzlich zu den Leben ein Zeitlimit hinzufügen, damit einzelne Runden nicht zu lange dauern.

## Variationen
- Unfaire Angabe - Erlaube es die Angabe (weiterhin von hinter der Grundlinie) jederzeit und egal wo hin zu machen. Explizit erlaubt sind dabei Angaben, bevor der Platzkönig wieder bereit ist. Dies bringt mehr Wechsel in das Spiel und setzt den Platzkönig unter mehr Druck.
- Geringere Fehler-Anzahl für den Wechsel. Wenn 3 Punkte in Folge gewinnen zu schwer ist, kann man auch nur z.B. 2 Punkte in Folge verlangen.
