#!/usr/bin/env node
// build.js — Compiles content/{sport}/*.md → site/{sport}/data.json + index.html
// Usage: node build.js [--watch]

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const COURTS_FILE = path.join(__dirname, "site", "courts.js");
const CONTENT_DIR = path.join(__dirname, "content");
const SITE_DIR = path.join(__dirname, "site");
const TEMPLATE = path.join(__dirname, "templates", "sport.html");
const TEX_DIR = path.join(__dirname, "templates");
const BUILD_PDFS = process.argv.includes("--pdfs");
const IS_WATCH = process.argv.includes("--watch");

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

    const saData = buildSportabzeichen(sport, outDir);
    if (saData) {
        const nEx = saData.variants.reduce((n, v) => n + v.exercises.length, 0);
        console.log(`  ↳ sportabzeichen: ${saData.variants.length} variant(s), ${nEx} exercise(s)`);
        if (saData.generated && (BUILD_PDFS || !IS_WATCH)) {
            generateSportabzeichenPdfs(sport, saData, outDir);
        }
    }

    console.log(`✓ ${sport.id}: ${entries.length} entries → site/${sport.id}/`);
}

// ── Sportabzeichen ────────────────────────────────────────────────────────────
const SA_PALETTE = [
    "#d4763a", "#4385d4", "#4caf6e", "#9b59b6",
    "#d4a843", "#43b5c8", "#d45c43", "#7a8ca0",
];
// Normalise a `scores:` list. Accepts "VH: 12", {VH: 12}, or {key:"VH", max:12}.
function normalizeScores(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const item of raw) {
        if (typeof item === "string") {
            const ci = item.indexOf(":");
            if (ci === -1) {
                out.push({ key: item.trim(), max: null });
            } else {
                const key = item.slice(0, ci).trim();
                const n = Number(item.slice(ci + 1).trim());
                out.push({ key, max: isNaN(n) ? null : n });
            }
        } else if (item && typeof item === "object") {
            if ("key" in item) {
                out.push({ key: String(item.key), max: item.max != null ? Number(item.max) : null });
            } else {
                const k = Object.keys(item)[0];
                if (k) out.push({ key: k, max: item[k] != null ? Number(item[k]) : null });
            }
        }
    }
    return out;
}

// Read + parse one exercise file into the same shape the frontend already knows.
function parseExercise(raw, num, sport) {
    const { meta, body } = parseFrontmatter(raw);
    return {
        num,
        title: meta.title || `Übung ${num}`,
        summary: meta.summary || "",
        stage: meta.stage || "",
        color: meta.color || "",
        scores: normalizeScores(meta.scores),
        diagram_stage: meta.diagram_stage || meta.stage || "",
        diagram: meta.diagram || null,
        frames: (() => {
            const f = [];
            if (meta.diagram) f.push(meta.diagram);
            let fi = 2;
            while (meta[`diagram${fi}`]) { f.push(meta[`diagram${fi}`]); fi++; }
            return f;
        })(),
        html: mdToHtml(body, meta.diagram, sport),
    };
}

function sumMax(exercises) {
    return exercises.reduce(
        (t, e) => t + e.scores.reduce((s, sc) => s + (sc.max || 0), 0), 0,
    );
}

// Medal thresholds are always derived from the (dynamic) total: 75/50/25% floored.
function deriveThresholds(maxTotal) {
    if (!maxTotal) return null;
    return {
        gold: Math.floor(maxTotal * 0.75),
        silver: Math.floor(maxTotal * 0.5),
        bronze: Math.floor(maxTotal * 0.25),
        max: maxTotal,
    };
}

// Build site/{sport}/sportabzeichen.json (returns the data, or null if no folder).
function buildSportabzeichen(sport, outDir) {
    const saDir = path.join(CONTENT_DIR, sport.id, "sportabzeichen");
    if (!fs.existsSync(saDir)) return null;

    const files = fs.readdirSync(saDir);
    const cfgFile = path.join(saDir, "_config.md");
    const cfg = fs.existsSync(cfgFile)
        ? parseFrontmatter(fs.readFileSync(cfgFile, "utf8")).meta
        : {};

    const exercises = files
        .filter((f) => /^\d+\.md$/.test(f))
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((f) => parseExercise(fs.readFileSync(path.join(saDir, f), "utf8"), parseInt(f), sport));
    if (!exercises.length) return null;

    // Assign a stable theme colour to every exercise (explicit, or from palette).
    exercises.forEach((e, i) => { e.color = e.color || SA_PALETTE[i % SA_PALETTE.length]; });

    const official = cfg.official_url || "";
    const generated = !official; // non-official sports get generated PDFs

    // Group into variants. Tennis-style: one variant per stage that has exercises.
    const stages = sport.stages || [];
    const usesStages = stages.length > 0 && exercises.some((e) => e.stage);
    let variants;
    if (usesStages) {
        variants = stages
            .filter((st) => exercises.some((e) => e.stage === st.id))
            .map((st) => {
                const ex = exercises.filter((e) => e.stage === st.id);
                const maxTotal = sumMax(ex);
                return {
                    id: st.id, label: st.label, color: st.color,
                    thresholds: deriveThresholds(maxTotal), maxTotal,
                    exercises: ex,
                };
            });
    } else {
        const maxTotal = sumMax(exercises);
        variants = [{
            id: null, label: cfg.title || "", color: sport.accent,
            thresholds: deriveThresholds(maxTotal), maxTotal,
            exercises,
        }];
    }

    // Attach downloadable PDF paths (generated sports only; official sports link out).
    const saOut = path.join(outDir, "sportabzeichen");
    for (const v of variants) {
        const suffix = v.id ? `_${v.id}` : "";
        if (generated) {
            v.scoreSheet = `sportabzeichen/scoresheet${suffix}.pdf`;
            v.groupScoreSheet = `sportabzeichen/scoresheet_group${suffix}.pdf`;
            v.certificate = `sportabzeichen/certificate${suffix}.pdf`;
        }
    }

    const data = {
        sport: sport.id,
        name: sport.name,
        officialUrl: official,
        title: cfg.title || "Sportabzeichen",
        intro: cfg.intro || "",
        generated,
        variants,
    };

    fs.mkdirSync(saOut, { recursive: true });
    fs.writeFileSync(
        path.join(outDir, "sportabzeichen.json"),
        JSON.stringify(data, null, 2),
    );

    return data;
}

// ── LaTeX PDF generation (non-official sports) ────────────────────────────────
let _pdflatexBin = undefined; // undefined = not probed, null = unavailable
function pdflatexBin() {
    if (_pdflatexBin !== undefined) return _pdflatexBin;
    for (const c of ["pdflatex", "/Library/TeX/texbin/pdflatex", "/usr/bin/pdflatex", "/usr/local/bin/pdflatex"]) {
        try { execFileSync(c, ["--version"], { stdio: "ignore" }); _pdflatexBin = c; return c; } catch {}
    }
    _pdflatexBin = null;
    return null;
}

const texEsc = (s) => String(s == null ? "" : s)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");

function compileTex(tex, outPdf) {
    const bin = pdflatexBin();
    if (!bin) return false;
    const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "sa-tex-"));
    try {
        fs.writeFileSync(path.join(tmp, "doc.tex"), tex);
        // two passes so TikZ `remember picture` overlay (certificate border) positions correctly
        execFileSync(bin, ["-interaction=nonstopmode", "-halt-on-error", "doc.tex"], { cwd: tmp, stdio: "ignore" });
        execFileSync(bin, ["-interaction=nonstopmode", "-halt-on-error", "doc.tex"], { cwd: tmp, stdio: "ignore" });
        fs.mkdirSync(path.dirname(outPdf), { recursive: true });
        fs.copyFileSync(path.join(tmp, "doc.pdf"), outPdf);
        return true;
    } catch (e) {
        console.error(`  ✗ pdflatex failed for ${path.basename(outPdf)}`);
        return false;
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}

// Fill a .tex template with {{PLACEHOLDER}} tokens.
function fillTex(templateName, tokens) {
    let tex = fs.readFileSync(path.join(TEX_DIR, templateName), "utf8");
    for (const [k, v] of Object.entries(tokens)) {
        tex = tex.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
    }
    return tex;
}

// Strip leading "#" from a hex colour (LaTeX HTML model wants bare RRGGBB).
const hex6 = (c, fallback) => {
    const h = String(c || fallback || "999999").replace(/^#/, "");
    return /^[0-9a-fA-F]{6}$/.test(h) ? h.toUpperCase() : "999999";
};

// Sanitise a string into a valid, unique AcroForm field name fragment.
const fieldFrag = (s) => String(s).replace(/[^A-Za-z0-9]/g, "_");

// One fillable score-entry cell (big input to write a number in) for a score key.
function scoreCellTex(sc, fieldName) {
    const label = texEsc(sc.key);
    const max = sc.max != null ? `~{\\footnotesize\\color{soft}/ ${sc.max}}` : "";
    return `\\begin{minipage}[t]{34mm}\\centering
  \\finput{${fieldName}}{30mm}{7mm}\\\\[0.8mm]
  {\\small\\textbf{${label}}}${max}
\\end{minipage}`;
}

// Full body: one styled card per exercise, spread down the page with \vfill.
// Single participant per sheet — lots of room to write.
function scoreSheetBody(variant) {
    const cards = [];
    variant.exercises.forEach((ex, idx) => {
        const num = idx + 1;
        const col = hex6(ex.color, "999999");
        const exMax = ex.scores.reduce((s, sc) => s + (sc.max || 0), 0);
        const cells = ex.scores
            .map((sc) => scoreCellTex(sc, `score_${ex.num}_${fieldFrag(sc.key)}`))
            .join("\\hspace{6mm}%\n");
        const maxBlock = exMax
            ? `{\\footnotesize\\color{soft}max }{\\Large\\bfseries\\color[HTML]{${col}} ${exMax}}{\\footnotesize\\color{soft} Pkt.}`
            : "";
        cards.push(`{%
\\noindent
{\\setlength{\\fboxsep}{0pt}\\colorbox[HTML]{${col}}{\\parbox[c][10mm][c]{9mm}{\\centering\\color{white}\\Large\\bfseries ${num}}}}%
\\hspace{2.5mm}%
\\begin{minipage}[c]{0.66\\linewidth}
  {\\large\\bfseries ${texEsc(ex.title)}}
\\end{minipage}\\hfill
\\begin{minipage}[c]{22mm}\\raggedleft ${maxBlock}\\end{minipage}\\\\[1mm]
{\\color[HTML]{${col}}\\rule{\\linewidth}{1.1pt}}\\\\[1.2mm]
${cells || "{\\footnotesize\\color{soft}(keine Wertung)}"}
}`);
    });
    // Fixed hairline dividers between cards (deterministic height — robust to
    // content edits); the single \vfill before the result anchors it to the
    // page bottom without cards ever pushing it onto a second page.
    return cards.join("\n\n\\vspace{2mm}\n{\\color{rule}\\rule{\\linewidth}{0.3pt}}\n\\vspace{2mm}\n\n");
}

// Group score sheet: a fillable grid — one row per participant, one column per
// score option (grouped under its exercise), plus Gesamt and Auszeichnung.
function groupScoreSheetTable(variant, rows = 12) {
    const ex = variant.exercises;
    // Flatten every score option, remembering its parent exercise.
    const opts = [];
    ex.forEach((e) => e.scores.forEach((sc) => opts.push({ e, sc })));
    const N = opts.length;
    const cols = 2 + N + 2; // Nr, Name, options…, Gesamt, Auszeichnung

    // tabularx: Name column (X) stretches; everything else fixed-width. All
    // columns are top-aligned p-type so \multirow centres the 2-row header
    // labels correctly (it mis-centres inside m-columns).
    const colSpec =
        "|>{\\centering\\arraybackslash}p{7mm}|X|" +
        opts.map(() => ">{\\centering\\arraybackslash}p{11mm}|").join("") +
        ">{\\centering\\arraybackslash}p{14mm}|>{\\centering\\arraybackslash}p{28mm}|";

    // Two-row header (no \multirow — it mis-centres unpredictably). Row 1 holds
    // the exercise colour bands AND the corner labels (Nr/Name/Gesamt/…), so
    // every label sits at the top with \extrarowheight padding rather than
    // dropping to the bottom of the block. Row 2 holds the score keys with the
    // max points stacked faint underneath (a tight second line, like the HTML
    // table). A \cline is drawn only under the bands; the corner columns stay
    // one continuous accent block, label on top.
    // Corner labels: \cellcolor sets the fill, but \color{white} must go INSIDE
    // the \shortstack — a \color before the box shifts the cell's baseline down
    // (the content sinks to the bottom of the tall band row).
    const head1 =
        `\\cellcolor{accent}\\shortstack{\\color{white}\\textbf{Nr.}} & ` +
        `\\cellcolor{accent}\\shortstack[l]{\\color{white}\\textbf{Name}} & ` +
        ex
            .map((e) => {
                const col = hex6(e.color, "999999");
                return `\\multicolumn{${e.scores.length}}{c|}{\\cellcolor[HTML]{${col}}\\shortstack{\\color{white}\\textbf{${texEsc(e.title)}}}}`;
            })
            .join(" & ") +
        ` & \\cellcolor{accent}\\shortstack{\\color{white}{\\small\\textbf{Gesamt}}} & ` +
        `\\cellcolor{accent}\\shortstack{\\color{white}\\footnotesize\\textbf{Auszeichnung}}`;
    const head2 =
        `\\cellcolor{accent} & \\cellcolor{accent} & ` +
        opts
            .map(({ sc }) => {
                const max = sc.max != null ? `\\\\[0.2mm]{\\scriptsize\\color{soft} ${sc.max}}` : "";
                return `\\cellcolor{paper}\\shortstack{{\\small\\textbf{${texEsc(sc.key)}}}${max}}`;
            })
            .join(" & ") +
        ` & \\cellcolor{accent} & \\cellcolor{accent}`;

    // \cline only under the score-option columns (3 … 2+N); corners stay open.
    const clineOpts = `\\cline{3-${2 + N}}`;

    // Body: fillable fields. Field names are unique per (row, exercise, key).
    const body = [];
    for (let r = 1; r <= rows; r++) {
        const cells = opts
            .map(({ e, sc }) => `\\gfield{grp_${r}_${e.num}_${fieldFrag(sc.key)}}{9mm}{5mm}`)
            .join(" & ");
        body.push(
            `${r} & \\gfieldl{grp_${r}_name}{55mm}{5mm} & ${cells} & ` +
            `\\gfield{grp_${r}_total}{11mm}{5mm} & \\gfieldl{grp_${r}_medaille}{22mm}{5mm} \\\\`
        );
    }

    return (
        `{\\renewcommand{\\arraystretch}{1.5}\\setlength{\\extrarowheight}{2.6mm}%\n` +
        `\\begin{tabularx}{\\linewidth}{${colSpec}}\n` +
        `\\hline\n\\noalign{\\vskip -1.2mm}\n${head1} \\\\\n\\hline\n${head2} \\\\\n\\hline\n` +
        body.join("\n\\hline\n") +
        `\n\\hline\n\\end{tabularx}}`
    );
}

// Coloured medal chips (Gold/Silber/Bronze) stacked, right-aligned.
function medalsTex(thr) {
    thr = thr || {};
    const rows = [
        ["gold", "Gold", thr.gold],
        ["silver", "Silber", thr.silver],
        ["bronze", "Bronze", thr.bronze],
    ].filter(([, , v]) => v != null);
    if (!rows.length) return "{\\footnotesize\\color{soft}—}";
    // Each row: an empty checkbox (tick the level reached) + the coloured chip.
    return rows
        .map(([c, name, v]) =>
            `\\fcheckbox{medal_${c}}\\hspace{2mm}` +
            `\\colorbox{${c}}{\\makebox[34mm][l]{\\rule[-1.4mm]{0pt}{5mm}\\hspace{2mm}\\color{white}\\textbf{${name}}\\hfill{\\small ab ${v} Pkt.}\\hspace{2mm}}}`)
        .join("\\\\[1.5mm]\n");
}

function generateSportabzeichenPdfs(sport, data, outDir) {
    if (!data || !data.generated) return;
    if (!pdflatexBin()) {
        console.warn(`  ⚠ ${sport.id}: pdflatex not found — skipping Sportabzeichen PDFs`);
        return;
    }
    const cacheDir = path.join(outDir, "sportabzeichen", ".cache");
    fs.mkdirSync(cacheDir, { recursive: true });
    const cached = (name, tex, outPdf) => {
        const hash = crypto.createHash("md5").update(tex).digest("hex");
        const stamp = path.join(cacheDir, name + ".md5");
        if (fs.existsSync(outPdf) && fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8") === hash) return;
        if (compileTex(tex, outPdf)) fs.writeFileSync(stamp, hash);
    };

    // Sport logo → absolute path for \includegraphics (guarded; empty if absent).
    const logoPath = path.join(__dirname, "logos", `${sport.id}.png`);
    const logoTex = fs.existsSync(logoPath)
        ? `\\includegraphics[width=18mm,height=18mm,keepaspectratio]{${logoPath}}`
        : "";

    for (const v of data.variants) {
        const suffix = v.id ? `_${v.id}` : "";
        const label = data.title + (v.id && v.label ? ` — ${v.label}` : "");
        const thr = v.thresholds || {};
        const thrLine = ["gold", "silver", "bronze"]
            .filter((k) => thr[k] != null)
            .map((k) => `${{ gold: "Gold", silver: "Silber", bronze: "Bronze" }[k]}: ab ${thr[k]} Punkte`)
            .join(" \\quad ");
        const scoreTex = fillTex("scoresheet.tex", {
            TITLE: texEsc(label),
            SPORT: texEsc(sport.name.toUpperCase()),
            INTRO: texEsc(data.intro || ""),
            LOGO: logoTex,
            ACCENT: hex6(v.color || sport.accent, sport.accent),
            BODY: scoreSheetBody(v),
            MEDALS: medalsTex(v.thresholds),
            MAXTOTAL: v.maxTotal || "",
        });
        cached(`scoresheet${suffix}`, scoreTex, path.join(outDir, "sportabzeichen", `scoresheet${suffix}.pdf`));

        const groupTex = fillTex("scoresheet_group.tex", {
            TITLE: texEsc(label),
            LOGO: logoTex,
            ACCENT: hex6(v.color || sport.accent, sport.accent),
            TABLE: groupScoreSheetTable(v),
            THRESHOLDS: thrLine || "—",
            MAXTOTAL: v.maxTotal || "",
        });
        cached(`scoresheet_group${suffix}`, groupTex, path.join(outDir, "sportabzeichen", `scoresheet_group${suffix}.pdf`));

        const certTex = fillTex("certificate.tex", {
            TITLE: texEsc(label),
            THRESHOLDS: thrLine || "—",
            ACCENT: hex6(v.color || sport.accent, sport.accent),
            LOGO: logoTex,
        });
        cached(`certificate${suffix}`, certTex, path.join(outDir, "sportabzeichen", `certificate${suffix}.pdf`));
    }
}

// ── Copy static assets ────────────────────────────────────────────────────────
function copyAssets() {
    for (const asset of ["favicon.ico", "logo.png"]) {
        const src = path.join(__dirname, asset);
        const dst = path.join(SITE_DIR, asset);
        if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    }
    // Copy sport logos + downscaled favicons
    for (const dir of ["logos", "favicons"]) {
        const srcDir = path.join(__dirname, dir);
        const dstDir = path.join(SITE_DIR, dir);
        if (fs.existsSync(srcDir)) {
            fs.mkdirSync(dstDir, { recursive: true });
            for (const f of fs.readdirSync(srcDir)) {
                fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, f));
            }
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
