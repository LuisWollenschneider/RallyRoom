#!/usr/bin/env node
// build.js — Compiles content/{sport}/*.md → site/{sport}/data.json + index.html
// Usage: node build.js [--watch]

const fs = require("fs");
const path = require("path");

const COURTS_FILE = path.join(__dirname, "site", "courts.js");
const CONTENT_DIR = path.join(__dirname, "content");
const SITE_DIR = path.join(__dirname, "site");
const TEMPLATE = path.join(__dirname, "templates", "sport.html");

// ── Markdown → HTML ───────────────────────────────────────────────────────────
function buildNestedList(items) {
    let pos = 0;
    function parseAt(minIndent) {
        let html = "<ul>";
        while (pos < items.length && items[pos].indent >= minIndent) {
            const { indent, text } = items[pos++];
            html += "<li>" + text;
            if (pos < items.length && items[pos].indent > indent)
                html += parseAt(items[pos].indent);
            html += "</li>";
        }
        return html + "</ul>";
    }
    return parseAt(items[0].indent);
}

function renderLists(text) {
    const lines = text.split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
        const m = lines[i].match(/^( *)[-*] (.+)$/);
        if (m) {
            const items = [];
            while (i < lines.length) {
                const lm = lines[i].match(/^( *)[-*] (.+)$/);
                if (!lm) break;
                items.push({ indent: lm[1].length, text: lm[2] });
                i++;
            }
            out.push(buildNestedList(items));
        } else {
            out.push(lines[i]);
            i++;
        }
    }
    return out.join("\n");
}

function mdToHtml(md, diagram, sport) {
    const esc = (s) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const players = (diagram && diagram.players) || [];
    const zones = (diagram && diagram.zones) || [];
    const TC = sport
        ? { A: sport.teamA, B: sport.teamB, W: sport.teamW, T: sport.teamT }
        : {};
    let s = md;
    s = s.replace(/^(#{1,3} .+)$/gm, "$1\n");
    s = s.replace(
        /```[\w]*\n([\s\S]*?)```/g,
        (_, c) => `<pre><code>${esc(c.trim())}</code></pre>`,
    );
    s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${esc(c)}</code>`);
    s = s.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_, t, url) =>
            `<a href="${url}"${/^https?:\/\//.test(url) ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`,
    );
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    s = s.replace(/\_(.+?)\_/g, "<em>$1</em>");
    s = s.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    s = s.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    s = s.replace(/^# (.+)$/gm, "<h1>$1</h1>");
    s = renderLists(s);
    s = s.replace(/\$([^$\n]+)\$/g, '<em class="md-accent">$1</em>');
    s = s.replace(/\{([^}\n]+)\}/g, (_, label) => {
        const p = players.find((pl) => (pl.label || pl.team) === label);
        const col = p
            ? p.team === "P"
                ? p.color || "#888"
                : TC[p.team] || "#888"
            : "#888";
        return `<span class="md-player" style="background:${col}">${esc(label)}</span>`;
    });
    s = s.replace(
        /<#([0-9a-fA-F]{3,6})>/g,
        (_, hex) => `<span class="md-cone" style="color:#${hex}">▲</span>`,
    );
    s = s.replace(
        /\(#([0-9a-fA-F]{3,6})\)/g,
        (_, hex) => `<span class="md-dot" style="background:#${hex}"></span>`,
    );
    s = s.replace(/\[([^\]\n]+)\](?!\()/g, (_, label) => {
        const z = zones.find((zn) => zn.label === label);
        const col = z ? z.color || "#f5e642" : "#f5e642";
        return `<span class="md-zone" style="color:${col}">${esc(label)}</span>`;
    });
    return s
        .split(/\n{2,}/)
        .map((b) => {
            b = b.trim();
            if (!b || /^<[huop]/.test(b)) return b;
            return `<p>${b.replace(/\n/g, " ")}</p>`;
        })
        .join("\n");
}

// ── YAML parser ───────────────────────────────────────────────────────────────
function parseYaml(text) {
    const lines = text.split("\n");

    function parseValue(val) {
        val = val.trim();
        if (val.startsWith("{")) return parseInlineObj(val);
        if (val === "true") return true;
        if (val === "false") return false;
        if (val === "null" || val === "~") return null;
        if (val !== "" && !isNaN(val)) return Number(val);
        return val.replace(/^['"]|['"]$/g, "");
    }

    function parseInlineObj(str) {
        str = str.trim();
        if (str.startsWith("{")) str = str.slice(1);
        if (str.endsWith("}")) str = str.slice(0, -1);
        const obj = {};
        const pairs = str.split(/,(?![^{]*})/);
        for (const pair of pairs) {
            const colon = pair.indexOf(":");
            if (colon === -1) continue;
            const k = pair.slice(0, colon).trim();
            const v = pair.slice(colon + 1).trim();
            obj[k] = parseValue(v);
        }
        return obj;
    }

    function parseInlineArray(str) {
        str = str.trim();
        if (str.startsWith("[")) str = str.slice(1);
        if (str.endsWith("]")) str = str.slice(0, -1);
        str = str.trim();
        if (!str) return [];
        if (str.startsWith("{")) {
            const items = [];
            let depth = 0,
                start = 0;
            for (let j = 0; j < str.length; j++) {
                if (str[j] === "{") depth++;
                if (str[j] === "}") {
                    depth--;
                    if (depth === 0) {
                        items.push(str.slice(start, j + 1).trim());
                        start = j + 1;
                        while (
                            start < str.length &&
                            (str[start] === "," || str[start] === " ")
                        )
                            start++;
                        j = start - 1;
                    }
                }
            }
            return items.map(parseInlineObj);
        }
        return str.split(",").map(parseValue);
    }

    function parseBlockList(lines) {
        const arr = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("-")) continue;
            const rest = trimmed.slice(1).trim();
            if (rest.startsWith("{")) arr.push(parseInlineObj(rest));
            else arr.push(parseValue(rest));
        }
        return arr;
    }

    const root = {};
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) {
            i++;
            continue;
        }
        const indent = line.search(/\S/);
        const colon = line.indexOf(":");
        if (colon === -1) {
            i++;
            continue;
        }

        const key = line.slice(indent, colon).trim();
        const rest = line.slice(colon + 1).trim();

        if (rest.startsWith("[")) {
            root[key] = parseInlineArray(rest);
            i++;
        } else if (rest.startsWith("{")) {
            root[key] = parseInlineObj(rest);
            i++;
        } else if (rest === "") {
            const childLines = [];
            i++;
            while (i < lines.length) {
                const sub = lines[i];
                const si = sub.search(/\S/);
                if (si === -1) {
                    i++;
                    continue;
                }
                if (si <= indent) break;
                childLines.push(sub);
                i++;
            }

            if (childLines.some((l) => l.trim().startsWith("-"))) {
                const firstReal = childLines.find(
                    (l) => l.trim() && !l.trim().startsWith("-"),
                );
                if (
                    firstReal &&
                    firstReal.includes(":") &&
                    !firstReal.trim().startsWith("-")
                ) {
                    const obj = {};
                    let j = 0;
                    while (j < childLines.length) {
                        const cl = childLines[j];
                        if (!cl.trim()) {
                            j++;
                            continue;
                        }
                        const ci = cl.search(/\S/);
                        const cc = cl.indexOf(":");
                        if (cc === -1) {
                            j++;
                            continue;
                        }
                        const ck = cl.slice(ci, cc).trim();
                        const cv = cl.slice(cc + 1).trim();
                        if (cv === "") {
                            const subLines = [];
                            j++;
                            while (j < childLines.length) {
                                const scl = childLines[j];
                                const sci = scl.search(/\S/);
                                if (sci === -1) {
                                    j++;
                                    continue;
                                }
                                if (sci <= ci) break;
                                subLines.push(scl);
                                j++;
                            }
                            obj[ck] = parseBlockList(subLines);
                        } else if (cv.startsWith("[")) {
                            obj[ck] = parseInlineArray(cv);
                            j++;
                        } else {
                            obj[ck] = parseValue(cv);
                            j++;
                        }
                    }
                    root[key] = obj;
                } else {
                    root[key] = parseBlockList(childLines);
                }
            } else {
                const obj = {};
                for (const cl of childLines) {
                    const ci = cl.search(/\S/);
                    if (ci === -1) continue;
                    const cc = cl.indexOf(":");
                    if (cc === -1) continue;
                    const ck = cl.slice(ci, cc).trim();
                    const cv = cl.slice(cc + 1).trim();
                    obj[ck] = cv.startsWith("[")
                        ? parseInlineArray(cv)
                        : parseValue(cv);
                }
                root[key] = obj;
            }
        } else {
            root[key] = parseValue(rest);
            i++;
        }
    }
    return root;
}

// ── Frontmatter ───────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { meta: {}, body: raw };
    return { meta: parseYaml(match[1]), body: match[2].trim() };
}

// ── Sport HTML generation ─────────────────────────────────────────────────────
function buildSportHtml(sport) {
    const template = fs.readFileSync(TEMPLATE, "utf8");

    const sportJs = [
        `const TC = { A:"${sport.teamA}", B:"${sport.teamB}", W:"${sport.teamW}", T:"${sport.teamT}" };`,
        sport.courtBase.toString(),
        sport.renderBall.toString(),
        sport.courtBaseByStage
            ? sport.courtBaseByStage.toString()
            : "function courtBaseByStage(stage,W,H){return null;}",
        sport.renderBallByStage
            ? sport.renderBallByStage.toString()
            : "function renderBallByStage(stage,mx,my,r,mid){return null;}",
        `const SPORT_STAGES=${JSON.stringify(sport.stages || [])};`,
    ].join("\n");

    const sportCss = `--accent:${sport.accent};--accent-dim:${sport.accentDim};`;

    return template
        .replace(/\{\{SPORT_NAME\}\}/g, sport.name)
        .replace(/\{\{SPORT_ID\}\}/g, sport.id)
        .replace(/\{\{SPORT_CSS\}\}/g, sportCss)
        .replace(/\{\{TEAM_A\}\}/g, sport.teamA)
        .replace(/\{\{TEAM_B\}\}/g, sport.teamB)
        .replace(/\{\{TEAM_W\}\}/g, sport.teamW)
        .replace(/\{\{SPORT_JS\}\}/g, sportJs);
}

// ── Build one sport ───────────────────────────────────────────────────────────
function buildSport(sport) {
    const contentDir = path.join(CONTENT_DIR, sport.id);
    const outDir = path.join(SITE_DIR, sport.id);

    fs.mkdirSync(outDir, { recursive: true });

    const entries = [];
    if (fs.existsSync(contentDir)) {
        const files = fs
            .readdirSync(contentDir)
            .filter((f) => f.endsWith(".md"))
            .sort()
            .reverse();
        const mdDir = path.join(outDir, "md");
        fs.mkdirSync(mdDir, { recursive: true });
        for (const file of files) {
            fs.copyFileSync(
                path.join(contentDir, file),
                path.join(mdDir, file),
            );
            const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
            const { meta, body } = parseFrontmatter(raw);
            const slug = file.replace(/\.md$/, "");
            entries.push({
                slug,
                title: meta.title || slug,
                date: meta.date || "",
                category: meta.category || "",
                skill_requirement: meta.skill_requirement || "",
                skills_trained: Array.isArray(meta.skills_trained)
                    ? meta.skills_trained
                    : [],
                players: meta.players || "",
                duration: meta.duration || null,
                materials: Object.keys(meta.materials || {}).length
                    ? meta.materials
                    : [],
                summary: meta.summary || "",
                half_court:
                    meta.half_court === true || meta.half_court === "true",
                stages: Array.isArray(meta.stages)
                    ? meta.stages
                    : meta.stage
                      ? [meta.stage]
                      : [],
                diagram_stage: meta.diagram_stage || meta.stage || "",
                diagram: meta.diagram || null,
                frames: (() => {
                    const fs = [];
                    if (meta.diagram) fs.push(meta.diagram);
                    let fi = 2;
                    while (meta[`diagram${fi}`]) {
                        fs.push(meta[`diagram${fi}`]);
                        fi++;
                    }
                    return fs;
                })(),
                html: mdToHtml(body, meta.diagram, sport),
            });
        }
    }

    entries.sort((a, b) => (b.date > a.date ? 1 : -1));

    const meta = {
        categories: [
            ...new Set(entries.map((e) => e.category).filter(Boolean)),
        ].sort(),
        skill_requirements: [
            ...new Set(entries.map((e) => e.skill_requirement).filter(Boolean)),
        ].sort(),
        skills_trained: [
            ...new Set(
                entries.flatMap((e) => e.skills_trained || []).filter(Boolean),
            ),
        ].sort(),
        stages: sport.stages || [],
        materials: [
            ...new Set(
                entries.flatMap((e) => {
                    const m = e.materials;
                    if (!m) return [];
                    if (Array.isArray(m))
                        return m.filter((x) => x != null && x !== "");
                    if (typeof m === "object") return Object.keys(m);
                    return [];
                }),
            ),
        ].sort(),
    };

    fs.writeFileSync(
        path.join(outDir, "meta.json"),
        JSON.stringify(meta, null, 2),
    );
    fs.writeFileSync(
        path.join(outDir, "data.json"),
        JSON.stringify(entries, null, 2),
    );
    fs.writeFileSync(path.join(outDir, "index.html"), buildSportHtml(sport));

    console.log(`✓ ${sport.id}: ${entries.length} entries → site/${sport.id}/`);
}

// ── Copy static assets ────────────────────────────────────────────────────────
function copyAssets() {
    for (const asset of ["favicon.ico", "logo.png"]) {
        const src = path.join(__dirname, asset);
        const dst = path.join(SITE_DIR, asset);
        if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    }
    // Copy sport logos
    const logosDir = path.join(__dirname, "logos");
    const logosDst = path.join(SITE_DIR, "logos");
    if (fs.existsSync(logosDir)) {
        fs.mkdirSync(logosDst, { recursive: true });
        for (const f of fs.readdirSync(logosDir)) {
            fs.copyFileSync(path.join(logosDir, f), path.join(logosDst, f));
        }
    }
}

// ── Build all ─────────────────────────────────────────────────────────────────
function build() {
    // Clear require cache so courts.js reloads on watch
    delete require.cache[require.resolve(COURTS_FILE)];
    const { list: sports } = require(COURTS_FILE);

    for (const sport of sports) {
        try {
            buildSport(sport);
        } catch (e) {
            console.error(`✗ ${sport.id}: ${e.message}`);
        }
    }
    copyAssets();
}

build();

if (process.argv.includes("--watch")) {
    console.log("Watching content/, sports/, templates/…");
    const watchDirs = [
        CONTENT_DIR,
        path.dirname(COURTS_FILE),
        path.dirname(TEMPLATE),
    ];
    let debounce;
    watchDirs.forEach((dir) => {
        if (!fs.existsSync(dir)) return;
        fs.watch(dir, { recursive: true }, (_, f) => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                try {
                    build();
                } catch (e) {
                    console.error(e.message);
                }
            }, 200);
        });
    });
}
