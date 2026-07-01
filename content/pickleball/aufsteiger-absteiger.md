---
sport: pickleball
title: Aufsteiger Absteiger
category: Game
skill_requirement: All Levels
skills_trained:
  - Punkte
half_court: true
players: 
duration: {min: 25, max: null}
materials:

summary: Turnier Format über mehrere Runden
diagram:
  players:
    - { id: e4, team: A, x: 0.207, y: -0.024, label: A1 }
    - { id: e5, team: A, x: 0.214, y: 1.023, label: A2 }
    - { id: e6, team: B, x: 0.737, y: -0.027, label: B1 }
    - { id: e7, team: B, x: 0.763, y: 1.024, label: B2 }
  arrows:
    - { id: e29, x1: 0.335, y1: 1.026, x2: 0.659, y2: 1.024, type: move, headStart: true }
  markers:
    - { id: e26, type: text, x: 0.41, y: 0.223, color: '#e8ede4', text: 'Text', size: 0.06 }
    - { id: e28, type: text, x: 0.781, y: 0.644, color: '#e8ede4', text: 'Feld 2', size: 20, rotation: 270, bold: true, italic: true }
    - { id: e33, type: text, x: 0.212, y: 0.647, color: '#e8ede4', text: 'Feld 1', size: 20, rotation: 270, bold: true, italic: true }
    - { id: e34, type: text, x: 0.495, y: 1.075, color: '#6c9ed6', text: 'Wechsel', size: 8, bold: true }
  zones:
    - { id: e9, x: 0.109, y: 0.031, width: 0.262, height: 0.067, label: Sieger, color: '#f5e642' }
    - { id: e30, x: 0.637, y: 0.888, width: 0.262, height: 0.067, label: Sieger, color: '#f5e642' }
    - { id: e31, x: 0.624, y: 0.03, width: 0.262, height: 0.067, label: Verlierer, color: '#ff6251' }
    - { id: e32, x: 0.091, y: 0.885, width: 0.262, height: 0.067, label: Verlierer, color: '#ff6251' }
---

$Aufsteiger Absteiger$ ist ein allgemeines Spielformat, welches gut mit 
anderen Punkte-Variationen kombiniert werden kann.

Man kann dies sowohl als Doppel, als auch Einzel (auch im Halben Feld) spielen.

## Konzept
- Den Plätzen / Platzhälften wird eine Reihenfolge zugeteilt.
- Die Spieler / Teams verteilen sich über die Felder.
- Eine Runde, nach beliebigen Regeln, wird gespielt.
- Zum Ende der Runde, wechseln alle Spieler das Feld
  - [Sieger] steigen auf
  - [Verlierer] steigen ab
  - Der Sieger auf Feld 1 und Verlierer des letzten Feldes bleiben stehen.

## Trainer Hinweise
Es ist Vorteilhaft auf allen Feldern die Runde zu beenden, sobald auf einem
Feld die Partie beendet ist, und direkt mit der nächsten Runde weiter zu machen.
So entsteht eine höhere Wechsel-Frequenz und Wartezeiten fallen weg.

Bei Unentschieden sollte ein finaler Entscheidungspunkt gespielt werden.

## Variationen
Da $Aufsteiger Absteiger$ ein übergeordnetes Konzept ist, sind die Variationen 
unbegrenzt. Alles ist möglich:
- Normales Pickleball 2v2
- Einzel Punkte auf halbem Feld
- Eigene Regeln um Gewichtung auf bestimmte Schläge zu legen
- uvm.
