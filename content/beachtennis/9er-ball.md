---
sport: beachtennis
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
    - { id: e12, team: A, x: 0.211, y: -0.031, label: A1 }
    - { id: e13, team: A, x: 0.734, y: 0.132, label: A2 }
    - { id: e14, team: B, x: 0.253, y: 0.74, label: B1 }
    - { id: e15, team: B, x: 0.709, y: 0.739, label: B2 }
  arrows:
    - { id: e16, x1: 0.256, y1: -0.001, x2: 0.653, y2: 0.676, type: ball }
    - { id: e21, x1: 0.737, y1: 0.694, x2: 1.038, y2: 0.281, type: ball, cx: 0.699, cy: 0.3, midTouched: true }
  markers:
    - { id: e1, type: ball, x: -0.084, y: 0.468 }
    - { id: e2, type: ball, x: -0.083, y: 0.437 }
    - { id: e3, type: ball, x: -0.083, y: 0.404 }
    - { id: e4, type: ball, x: -0.082, y: 0.372 }
    - { id: e5, type: ball, x: -0.077, y: 0.628 }
    - { id: e6, type: ball, x: -0.08, y: 0.596 }
    - { id: e7, type: ball, x: -0.083, y: 0.56 }
    - { id: e8, type: ball, x: -0.089, y: 0.53 }
    - { id: e23, type: ball, x: 1.093, y: 0.286 }
  zones:
    - { id: e36, x: -0.128, y: 0.343, width: 0.103, height: 0.147, label: Balllager, color: '#a8c6fe' }
    - { id: e37, x: -0.127, y: 0.509, width: 0.103, height: 0.147, label: Balllager B, color: '#cce8b5' }
diagram2:
  players:
    - { id: e12, team: A, x: 0.211, y: -0.031, label: A1 }
    - { id: e13, team: A, x: 0.734, y: 0.132, label: A2 }
    - { id: e14, team: B, x: 0.253, y: 0.74, label: B1 }
    - { id: e15, team: B, x: 0.709, y: 0.739, label: B2 }
  arrows:
    - { id: e38, x1: 0.744, y1: 0.707, x2: 1.077, y2: 0.311, type: move }
    - { id: e39, x1: 1.041, y1: 0.299, x2: -0.018, y2: 0.585, type: move }
    - { id: e40, x1: 0.195, y1: -0.001, x2: -0.051, y2: 0.353, type: move }
    - { id: e41, x1: -0.096, y1: 0.34, x2: 0.14, y2: 0.001, type: move }
    - { id: e42, x1: 0.227, y1: 0.014, x2: 0.379, y2: 0.722, type: ball }
  markers:
    - { id: e1, type: ball, x: -0.084, y: 0.468 }
    - { id: e2, type: ball, x: -0.083, y: 0.437 }
    - { id: e3, type: ball, x: -0.083, y: 0.404 }
    - { id: e4, type: ball, x: -0.082, y: 0.372 }
    - { id: e5, type: ball, x: -0.077, y: 0.628 }
    - { id: e6, type: ball, x: -0.08, y: 0.596 }
    - { id: e7, type: ball, x: -0.083, y: 0.56 }
    - { id: e8, type: ball, x: -0.089, y: 0.53 }
    - { id: e23, type: ball, x: 1.093, y: 0.286 }
  zones:
    - { id: e36, x: -0.128, y: 0.343, width: 0.103, height: 0.147, label: Balllager, color: '#a8c6fe' }
    - { id: e37, x: -0.127, y: 0.509, width: 0.103, height: 0.147, label: Balllager B, color: '#cce8b5' }
---

## Aufbau
- 2v2
- Jedes Team hat ein [Balllager] am Ende seines Feldes.
- Zu Beginn befinden sich dort je `4` Bälle.

## Ablauf
Es werden normale Punkte gespielt.

Wenn ein Fehler passiert, muss der für den Fehler verantwortliche Spieler den Ball umgehend sammeln und in sein [Balllager B] bringen. z.B. {B2}
In der Zwischenzeit holt sich {A1} einen neuen Ball aus dem [Balllager] und beginnt umgehend den neuen Punkt. 
Solange {B2} seinen Ball noch nicht abgelegt hat, darf er am Ballwechsel nicht teilnehmen und {B1} muss alleine verteidigen.


## Ziel
Das Team, das zuerst sein [Balllager] leer hat, gewinnt.

## Trainer Hinweis
Prinzipiell ist es egal wer vom Team läuft. Wenn {B2} den Fehler gemacht hat und der Ball neben {B1} ankommt, kann auch {B1} laufen.
