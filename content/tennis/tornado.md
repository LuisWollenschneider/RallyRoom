---
sport: tennis
title: Tornado
category: Game
skill_requirement: Intermediate
skills_trained:
  - Angriff
  - Volley
  - Punkte
  - Drucksituationen
half_court: true
stages: [orange, green, yellow]
diagram_stage: yellow
players: 3+
duration: {min: 8, max: 15}
materials:

summary: Angriffs Spiel, 3 Punkte zum Punkt-Gewinn
diagram:
  players:
    - { id: e1, team: A, x: 0.495, y: -0.014, label: A }
    - { id: e2, team: B, x: 0.502, y: 1.014, label: B }
    - { id: e3, team: W, x: 0.619, y: 1.097, label: W }
  arrows:
    - { id: e4, x1: 0.485, y1: 0.023, x2: 0.498, y2: 0.254, type: move, cx: 0.403, cy: 0.138, midTouched: true }
    - { id: e5, x1: 0.489, y1: 0.279, x2: 0.495, y2: 0.455, type: move, cx: 0.436, cy: 0.373, midTouched: true }
  markers:
    - { id: e6, type: text, x: 0.508, y: 0.123, color: '#e8ede4', text: '1. Punkt gewonnen', size: 11, bold: true }
    - { id: e7, type: text, x: 0.483, y: 0.363, color: '#e8ede4', text: '2. Punkt gewonnen', size: 11, bold: true }
  zones:
---

## Aufbau
- Spieler {A} ist alleine auf einer Seite.
- Die restlichen Spieler sind befinden sich auf der anderen Seite des Feldes und formen ein Team.
- Gespielt werden immer Einzelpunkte, wobei sich {B} und {W} abwechseln.

## Regeln
- Gewinnt {A} einen Ballwechsel, rückt {A} vor ans T-Feld, gewinnt {A} diesen Ballwechsel ebenfalls, vor zum Netz, und wenn {A} am Netz auch gewinnt, erhält {A} einen Punkt. Der nächste Punkt beginnt wieder von der Grundlinie.
- Gewinnt {B} einen Ballwechsel, erhält das Team einen Punkt und {A} muss zurück an die Grundlinie.

## Ziel
Gespielt wird bis 10.

## Trainer Hinweise
Dieses Spiel eignet sich insbesondere für ungleichmäßige Spielstärken, da {A} einen großen Nachteil hat, welcher durch Spielkönnen ausgeglichen werden muss.
