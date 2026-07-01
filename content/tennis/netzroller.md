---
sport: tennis
title: Netzroller
category: Game
skill_requirement: Intermediate
skills_trained:
  - Punkte
  - Volley
  - Ballkontrolle
half_court: false
stages: [orange, green, yellow]
diagram_stage: yellow
players: 3-4
duration: {min: null, max: 10}
materials:

summary: T-Feld Spiel mit Focus auf Platzabdeckung und Genauigkeit.
diagram:
  players:
    - { id: e18, team: A, x: 0.43, y: 0.461, label: A }
    - { id: e19, team: B, x: 0.685, y: 0.365, label: B }
    - { id: e20, team: P, x: 0.377, y: 0.551, label: C, color: '#d357fe' }
    - { id: e21, team: P, x: 0.701, y: 0.599, label: D, color: '#ff8647' }
  arrows:
  markers:
    - { id: e22, type: ball, x: 0.453, y: 0.495 }
  zones:
---

## Aufbau
- Jeder Spieler spielt in einer T-Feld Hälfte.
- Jeder Spieler beginnt mit **5 Leben**

## Regeln
- Jeder Punkt beginnt am Netz. Der Ball wird vom Spieler, der den letzten Ballwechsel verloren hat, $eingerollt$. D.h. auf die Netzkante gelegt, und ins Feld eines anderen Spielers rollen gelassen. _Eine starke Richtung oder Länge dem ersten Ball zu geben ist nicht zugelassen. Es handelt sich um ein "einrollen"._ 
- Der erste Ball muss über das Netz gespielt werden. Danach darf der Ball auch auf der gleichen Seite zu einem Gegner gespielt werden. Z.B. {C} zu {D}.
- Bälle dürfen nur mit **aufsteigender Flugkurve** gespielt werden.
- Wenn ein Ball von z.B. {C} zu {D} gespielt wird, und der Ball (ohne {D}'s Einmischung) vor dem 2ten mal Aufkommen ins Netz geht, ist es ein Fehler von Spieler {C}.
- Wer einen Fehler macht, verliert ein Leben.
- Bei 0 Leben scheidet der Spieler aus, und das zugehörige Feld ist nicht länger im Spiel.

Wenn nur noch 2 Spieler übrig sind, wird im ganzen T-Feld, mit normalen Tennis-Regeln, über das Netz, das Finale ausgespielt. Erster mit 3 Punkten gewinnt.

## Variationen
- Die Anzahl an Leben kann beliebig variiert werden um die Dauer zu kontrollieren.
- Die benötigte Punktzahl im Finale kann beliebig geändert werden. Auch 1 einzelner Entscheidungspunkt ist möglich.
