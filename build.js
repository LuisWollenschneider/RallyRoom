#!/usr/bin/env node
// build.js — Compiles content/{sport}/*.md → site/{sport}/data.json + index.html
// Usage: node build.js [--watch]

const fs = require("fs");
const path = require("path");

const COURTS_FILE = path.join(__dirname, "sports", "courts.js");
const CONTENT_DIR = path.join(__dirname, "content");
const SITE_DIR = path.join(__dirname, "site");
const TEMPLATE = path.join(__dirname, "templates", "sport.html");

// ── Markdown → HTML ───────────────────────────────────────────────────────────
function mdToHtml(md) {
    const esc = (s) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return md
        .replace(
            /```[\w]*\n([\s\S]*?)```/g,
            (_, c) => `<pre><code>${esc(c.trim())}</code></pre>`,
        )
        .replace(/`([^`]+)`/g, (_, c) => `<code>${esc(c)}</code>`)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\_(.+?)\_/g, "<em>$1</em>")
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        .replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>[\s\S]*?<\/li>)\n(?!<li>)/g, (m) => `<ul>${m}</ul>`)
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
        `const TC = { A:"${sport.teamA}", B:"${sport.teamB}", W:"${sport.teamW}" };`,
        sport.courtBase.toString(),
        sport.renderBall.toString(),
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
            .sort();
        for (const file of files) {
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
                half_court: meta.half_court === true || meta.half_court === "true",
                diagram: meta.diagram || null,
                html: mdToHtml(body),
            });
        }
    }

    entries.sort((a, b) => (b.date > a.date ? 1 : -1));
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
    // courts.js is loaded by site/index.html as a script tag
    fs.copyFileSync(COURTS_FILE, path.join(SITE_DIR, "courts.js"));
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
