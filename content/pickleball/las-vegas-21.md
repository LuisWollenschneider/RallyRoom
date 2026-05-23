---
sport: pickleball
title: Las Vegas 21
category: Game
skill_requirement: All Levels
skills_trained:
  - Taktik
  - Punkte
half_court: true
players: 
duration: {min: 4, max: 10}
materials:

summary: Wer wagt, gewinnt!
diagram:
  players:
    - { id: e7, team: A, x: 0.207, y: -0.026, label: A1 }
    - { id: e8, team: B, x: 0.207, y: 1.028, label: B1 }
    - { id: e13, team: A, x: 0.745, y: -0.028, label: A2 }
    - { id: e14, team: B, x: 0.698, y: 1.026, label: B2 }
  arrows:
  markers:
    - { id: e11, type: text, x: 0.482, y: 0.139, color: '#e8ede4', text: '1', size: 38, bold: true }
    - { id: e12, type: text, x: 0.496, y: 0.863, color: '#e8ede4', text: '1', size: 38, bold: true }
  zones:
---

## Aufbau
Das Spiel beginnt mit den Punktestand `1:1`.
Spieler/Teams müssen vor jedem Punkt eine bestimmte Anzahl ihrer Punkte wetten. Wenn sie den Punkt gewinnen, werden die gesetzten Punkte verdoppelt. Wenn sie verlieren, verlieren sie die gesetzten Punkte.

Gesetzt werden kann immer nur maximal, was der Spieler/Team an Punkten aktuell hat.

_Wenn ein Spieler/Team 0 Punkte hat, kann er immer 1 Punkt setzen, um neu ins Spiel zu kommen. Negative Punkte sind nicht möglich._

## Beispiel
Steht es `4:2` und Team {A1}&{A2} setzten 3 Punkte, und Team {B1}&{B2} 1 Punkt. Gewinnt {A1}&{A2}, steht es danach `7:1`.

## Ziel
Gespielt wird bis 21.

## Variationen
Das ganze kann als Einzel oder aus als Doppel gespielt werden.
