#!/usr/bin/env node
// new-entry.js — Scaffold a new coaching entry for any sport.

const fs = require("fs");
const path = require("path");
const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});
const ask = (q) => new Promise((r) => rl.question(q, r));

const CONTENT_DIR = path.join(__dirname, "content");
const SPORT_IDS = ["pickleball", "tennis", "beachtennis", "padel"];

const slugify = (s) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

async function pickOne(label, options) {
    console.log(`\n${label}`);
    options.forEach((o, i) => console.log(`  ${i + 1}) ${o}`));
    while (true) {
        const raw = (await ask(`Pick 1–${options.length}: `)).trim();
        const n = parseInt(raw, 10);
        if (n >= 1 && n <= options.length) return options[n - 1];
        console.log(`  Enter a number between 1 and ${options.length}.`);
    }
}

async function main() {
    console.log("\n── New Coaching Entry ────────────────────\n");

    const sport = await pickOne("Sport:", SPORT_IDS);

    const title = (await ask("Title: ")).trim();
    if (!title) {
        console.error("Title required.");
        process.exit(1);
    }

    const category = await pickOne("Category:", ["Drill", "Exercise", "Game"]);

    const skillReq = await pickOne("Skill requirement:", [
        "Beginner",
        "Intermediate",
        "Advanced",
        "All Levels",
    ]);

    const skillsTrained = (
        await ask("Skills trained (comma-separated): ")
    ).trim();
    const players = (await ask("Players needed (e.g. 2–4): ")).trim();
    const durMin = (await ask("Duration min (minutes, e.g. 5): ")).trim();
    const durMax = (await ask("Duration max (minutes, e.g. 15): ")).trim();
    const halfCourt = (await ask("Half court? (y/N): ")).trim().toLowerCase();
    let halfCourtAvailable = false;
    if (halfCourt === "y") {
        halfCourtAvailable = true;
    }
    const materials = (
        await ask("Materials needed (comma-separated, leave empty if none): ")
    ).trim();
    const summary = (await ask("One-line summary: ")).trim();
    rl.close();

    const trainList = skillsTrained
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    const trainYaml = trainList.length
        ? trainList.map((t) => `  - ${t}`).join("\n")
        : "";
    const matList = materials
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    const matYaml = matList.length
        ? matList.map((t) => `  - ${t}`).join("\n")
        : "";

    const filename = `${slugify(title)}.md`;
    const sportDir = path.join(CONTENT_DIR, sport);
    const filepath = path.join(sportDir, filename);

    if (fs.existsSync(filepath)) {
        console.error(`\n✗ Already exists: content/${sport}/${filename}`);
        process.exit(1);
    }

    const template = `---
title: ${title}
category: ${category}
skill_requirement: ${skillReq}
skills_trained:
${trainYaml}
half_court: ${halfCourtAvailable}
players: ${players}
duration: {min: ${durMin || 0}, max: ${durMax || durMin || 0}}
materials:
${matYaml}
summary: ${summary}
diagram:
  players:
    - { id: p1, team: A, x: 0.25, y: 0.88, label: A1 }
    - { id: p2, team: B, x: 0.75, y: 0.12, label: B1 }
  arrows:
  markers:
  zones:
---

Describe the drill or game mode here.

## Setup

## Goal

## Coaching Cues

## Progression
`;

    fs.mkdirSync(sportDir, { recursive: true });
    fs.writeFileSync(filepath, template);

    console.log(`\n✓ Created: content/${sport}/${filename}`);
    console.log(
        "  1. Edit the file — fill in description and adjust the diagram YAML",
    );
    console.log(
        "  2. Open editor/index.html and select the sport to design the court diagram",
    );
    console.log("  3. Run: node build.js");
    console.log("  4. Run: node preview.js  (for live preview)\n");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
