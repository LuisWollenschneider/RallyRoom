---
sport: padel
title: 9er Ball
category: Game
skill_requirement: Intermediate
skills_trained:
  - Punkte
  - Drucksituation
half_court: false
players: 4
duration: {min: 0, max: 0}
materials:
  - Bälle
summary: Ziel ist es seine Bällevorrat aufzubrauchen.
diagram:
  players:
    - { id: e12, team: A, x: 0.237, y: 0.133, label: A1 }
    - { id: e13, team: A, x: 0.734, y: 0.132, label: A2 }
    - { id: e14, team: B, x: 0.259, y: 0.868, label: B1 }
    - { id: e15, team: B, x: 0.757, y: 0.868, label: B2 }
  arrows:
    - { id: e16, x1: 0.266, y1: 0.175, x2: 0.737, y2: 0.786, type: ball }
    - { id: e21, x1: 0.773, y1: 0.828, x2: 0.057, y2: 0.522, type: ball, mode: angled, cx: 0.201, cy: 0.514, midTouched: true }
  markers:
    - { id: e1, type: ball, x: 0.41, y: 0.02 }
    - { id: e2, type: ball, x: 0.466, y: 0.02 }
    - { id: e3, type: ball, x: 0.521, y: 0.022 }
    - { id: e4, type: ball, x: 0.577, y: 0.02 }
    - { id: e5, type: ball, x: 0.407, y: 0.989 }
    - { id: e6, type: ball, x: 0.466, y: 0.989 }
    - { id: e7, type: ball, x: 0.521, y: 0.989 }
    - { id: e8, type: ball, x: 0.58, y: 0.989 }
    - { id: e23, type: ball, x: 0.021, y: 0.53 }
  zones:
    - { id: e9, x: 0.351, y: 0.002, width: 0.272, height: 0.037, label: Balllager, color: '#41aec2' }
    - { id: e11, x: 0.349, y: 0.969, width: 0.272, height: 0.037, label: Balllager B, color: '#cb5944' }
diagram2:
  players:
    - { id: e12, team: A, x: 0.237, y: 0.133, label: A1 }
    - { id: e13, team: A, x: 0.734, y: 0.132, label: A2 }
    - { id: e14, team: B, x: 0.259, y: 0.868, label: B1 }
    - { id: e15, team: B, x: 0.757, y: 0.868, label: B2 }
  arrows:
    - { id: e24, x1: 0.678, y1: 0.856, x2: 0.043, y2: 0.542, type: move }
    - { id: e25, x1: 0.007, y1: 0.557, x2: 0.364, y2: 0.953, type: move }
    - { id: e27, x1: 0.698, y1: 0.101, x2: 0.58, y2: 0.046, type: move }
    - { id: e28, x1: 0.554, y1: 0.051, x2: 0.629, y2: 0.135, type: move }
    - { id: e29, x1: 0.642, y1: 0.154, x2: 0.282, y2: 0.755, type: ball }
  markers:
    - { id: e1, type: ball, x: 0.41, y: 0.02 }
    - { id: e2, type: ball, x: 0.466, y: 0.02 }
    - { id: e3, type: ball, x: 0.521, y: 0.022 }
    - { id: e4, type: ball, x: 0.577, y: 0.02 }
    - { id: e5, type: ball, x: 0.407, y: 0.989 }
    - { id: e6, type: ball, x: 0.466, y: 0.989 }
    - { id: e7, type: ball, x: 0.521, y: 0.989 }
    - { id: e8, type: ball, x: 0.58, y: 0.989 }
    - { id: e23, type: ball, x: 0.021, y: 0.53 }
  zones:
    - { id: e9, x: 0.351, y: 0.002, width: 0.272, height: 0.037, label: Balllager, color: '#41aec2' }
    - { id: e11, x: 0.349, y: 0.969, width: 0.272, height: 0.037, label: Balllager B, color: '#cb5944' }
---

## Aufbau
- 2v2
- Jedes Team hat ein [Balllager B] am Ende seines Feldes.
- Zu Beginn befinden sich dort je `4` Bälle.

## Ablauf
Es werden normale Punkte gespielt.

Wenn ein Fehler passiert, muss der für den Fehler verantwortliche Spieler den Ball umgehend sammeln und in sein [Balllager B] bringen. z.B. {B2}
In der Zwischenzeit holt sich {A2} einen neuen Ball aus dem [Balllager B] und beginnt umgehend den neuen Punkt. 
Solange {B2} seinen Ball noch nicht abgelegt hat, darf er am Ballwechsel nicht teilnehmen und {B1} muss alleine verteidigen.


## Ziel
Das Team, das zuerst sein [Balllager B] leer hat, gewinnt.
