---
sport: pickleball
title: Stopper
category: Game
skill_requirement: Advanced
skills_trained:
  - Punkte
  - Drucksituationen
  - Stop
half_court: true
players: 2-4
duration: {min: 10, max: 15}
materials:

summary: Punkte mit Stop / Dink
diagram:
  players:
    - { id: e5, team: A, x: 0.252, y: 0.308, label: A1 }
    - { id: e6, team: A, x: 0.808, y: 0.31, label: A2 }
    - { id: e7, team: B, x: 0.242, y: 1.027, label: B1 }
    - { id: e8, team: B, x: 0.765, y: 1.027, label: B2 }
  arrows:
    - { id: e9, x1: 0.252, y1: 0.352, x2: 0.688, y2: 0.987, type: ball }
    - { id: e10, x1: 0.798, y1: 0.358, x2: 0.282, y2: 0.587, type: ball, cx: 0.768, cy: 0.505, midTouched: true }
    - { id: e12, x1: 0.771, y1: 0.98, x2: 0.842, y2: 0.369, type: ball }
  markers:
  zones:
---

## Aufbau
- `2v2`
- Team {A1} beginnt an der $Kitchen$
- Team {B1} beginnt an der Grundlinie
- Angabe hat immer das Team am Netz

## Ablauf
Die Angabe muss fair zugespielt werden, danach ist alles frei.

Das Team an der Grundlinie ({B1}) darf spielen was sie wollen, gewinnen sie den Punkt gibt es einen Punkt für das Team, und rücken an die Kitchen vor, mit Angabe für den nächsten Punkt.

Das Kitchen-Team ({A1}) kann erst Punkten nachdem sie einen erfolgreichen $Dink$ / $Stopp$ in die Kitchen gespielt haben. Alle Punkte die vorher von Team {A1} gewonnen wurden, geben keine Punkte.

## Ziel
Gespielt wird bis `11`.

Fokus sollte sein den Gegner zuerst mit langen Volleys nach hinten zu drängen und dann den kurzen Ball in die Kitchen zu spielen.

## Variationen
Auch als `1v1` im halben Feld möglich
