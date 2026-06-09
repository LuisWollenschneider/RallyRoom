---
sport: pickleball
title: Hotball
category: Game
skill_requirement: Intermediate
skills_trained:
  - Punkte
  - Kommunikation
half_court: false
players: 4
duration: {min: 0, max: 10}
materials:

summary: Einzel zu Doppel im gleichen Punkt
diagram:
  players:
    - { id: e2, team: A, x: 0.21, y: -0.02, label: A1 }
    - { id: e3, team: A, x: 0.754, y: -0.021, label: A2 }
    - { id: e4, team: B, x: 0.25, y: 1.015, label: B1 }
    - { id: e5, team: B, x: 0.813, y: 1.017, label: B2 }
  arrows:
    - { id: e1, x1: 0.492, y1: -0.02, x2: 0.495, y2: 1.033, type: line }
    - { id: e8, x1: 0.207, y1: 0.028, x2: 0.217, y2: 0.837, type: ball, cx: 0.106, cy: 0.416, midTouched: true }
    - { id: e9, x1: 0.745, y1: 0.029, x2: 0.755, y2: 0.838, type: ball, cx: 0.633, cy: 0.371, midTouched: true }
  markers:
    - { id: e6, type: ball, x: 0.171, y: 0.013 }
    - { id: e7, type: ball, x: 0.721, y: 0.014 }
  zones:
---

## Aufbau
- 2v2

## Regeln
- Begonnen wird immer im 1v1, im halben Feld. Angabe wird von beiden Spielern eines Teams zeitgleich gespielt.
- Sobald in einer Hälfte der Punkt vorbei ist, rufen die Spieler laut $Hotball$. Ab dann ist der noch laufende Ballwechsel in der anderen Hälfte offen für alle, und darf im ganzen Feld ausgespielt werden.
- Es gibt nur einen Punkt, wenn ein Team beide Ballwechsel gewinnt.

## Ziel
Gespielt wird bis 11.

## Variationen
Es kann auch über die Cross Richtung gespielt werden, sodass im 1v1 {A1} gegen {B2} spielen würde.
