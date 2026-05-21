# Rally Room

A collection of Tennis, Beach Tennis, Pickleball and Padel drills, games and strategies.

---

## Workflow

```bash
# 1. Create a new entry
node new-entry.js "My Drill Name"

# 2. Edit the generated file in content/
#    Write the description, adjust diagram YAML

# 3. Open the site → "Court Editor" tab to design your diagram visually
#    Copy the generated YAML and paste it into the file's frontmatter

# 4. Rebuild
node build.js

# 5. Commit & push
git add content/ site/data.json
git commit -m "add: My Drill Name"
git push
```

---

## Entry Format

```markdown
---
title: Cross-Court Dinking Drill
date: 2025-04-10
category: Exercise          # Exercise | Game | Strategy | Notes
tags: [dinking, kitchen]
players: 2–4
duration: 10 min
summary: One-line description shown on the card.
diagram:
  players:
    - { id: p1, team: A, x: 0.25, y: 0.88, label: A1 }
    - { id: p2, team: B, x: 0.75, y: 0.12, label: B1 }
  arrows:
    - { id: a1, x1: 0.25, y1: 0.86, x2: 0.75, y2: 0.14, type: ball }
    - { id: a2, x1: 0.25, y1: 0.95, x2: 0.25, y2: 0.75, type: move }
  markers:
    - { id: m1, type: cone, x: 0.18, y: 0.82 }
---

Your notes here in markdown.
```

### Court coordinates

`x` = 0 (left sideline) → 1 (right sideline)  
`y` = 0 (top baseline) → 1 (bottom baseline)  
Net = y 0.5. Kitchen lines = y 0.34 and y 0.66.

### Arrow types
- `ball` — solid yellow, for ball trajectory
- `move` — dashed blue, for player movement
- `screen` — dashed purple, for screens / other

### Marker types
- `cone` — orange triangle
- `ball` — yellow circle

### Team colors
- `A` — green
- `B` — red / orange
- `W` — yellow (waiting / neutral)

---

## Court Editor

Use the **Court Editor** tab on the site to build diagrams interactively:
- Select a tool (player, arrow, marker)
- Click/drag on the court
- Use Select mode to reposition or delete elements
- Copy the generated YAML from the panel and paste into your `.md` file's frontmatter

When viewing an entry, click **Edit** on the court panel to open the editor pre-loaded with that entry's diagram.

---

## GitHub Pages Setup

1. Push this repo to GitHub
2. **Settings → Pages → Source:** `main` branch, `/site` folder
3. Your site is live at `https://<username>.github.io/<repo>/`

The included GitHub Action auto-runs `node build.js` when you push content files,
so `site/data.json` stays up to date automatically.
