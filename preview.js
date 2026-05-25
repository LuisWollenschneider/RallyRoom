#!/usr/bin/env node
// preview.js — Local dev server. Serves site/ with auto-rebuild on content changes.
// Usage: node preview.js

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PORT = 3000;
const SITE_DIR = path.join(__dirname, "site");
const CONTENT_DIR = path.join(__dirname, "content");
const SPORTS_DIR = path.join(__dirname, "sports");
const TMPL_DIR = path.join(__dirname, "templates");

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
};

function rebuild() {
    try {
        execSync("node build.js", { cwd: __dirname, stdio: "inherit" });
    } catch (e) {
        console.error("Build failed:", e.message);
    }
}

console.log("\nSports Coach Notebook — Preview Server\n");
console.log("Building…");
rebuild();

let debounce;
const watchDirs = [CONTENT_DIR, SPORTS_DIR, TMPL_DIR];
watchDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    fs.watch(dir, { recursive: true }, (_, f) => {
        if (!f) return;
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            console.log(`\nRebuilding (${f})…`);
            rebuild();
        }, 200);
    });
});

const SPORT_IDS = ["pickleball", "tennis", "beachtennis", "padel"];

http.createServer((req, res) => {
    // ── POST /api/save — write .md to content/{sport}/ ──
    if (req.method === "POST" && req.url === "/api/save") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            try {
                const { sport, filename, content, overwrite } = JSON.parse(body);
                if (!SPORT_IDS.includes(sport) || !filename || !/^[\w-]+\.md$/.test(filename)) {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    res.end("Invalid sport or filename");
                    return;
                }
                const sportDir = path.join(CONTENT_DIR, sport);
                const filePath = path.join(sportDir, filename);
                if (!overwrite && fs.existsSync(filePath)) {
                    res.writeHead(409, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ conflict: true, filename }));
                    return;
                }
                fs.mkdirSync(sportDir, { recursive: true });
                fs.writeFileSync(filePath, content);
                console.log(`\nSaved: content/${sport}/${filename}`);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: true }));
            } catch (e) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end(e.message);
            }
        });
        return;
    }

    // ── GET /api/load — read raw .md from content/{sport}/ ──
    if (req.method === "GET" && req.url.startsWith("/api/load")) {
        const params = new URL(req.url, "http://localhost").searchParams;
        const sport = params.get("sport");
        const file  = params.get("file");
        if (!SPORT_IDS.includes(sport) || !/^[\w-]+\.md$/.test(file)) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Invalid sport or filename");
            return;
        }
        const filePath = path.join(CONTENT_DIR, sport, file);
        try {
            const data = fs.readFileSync(filePath, "utf8");
            res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
            res.end(data);
        } catch {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not found");
        }
        return;
    }

    let urlPath = req.url.split("?")[0];

    // Directory index → serve index.html
    if (urlPath.endsWith("/") || urlPath === "") urlPath += "index.html";

    const filePath = path.join(SITE_DIR, urlPath);
    const ext = path.extname(filePath);
    try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, {
            "Content-Type": MIME[ext] || "application/octet-stream",
        });
        res.end(data);
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found: " + urlPath);
    }
}).listen(PORT, () => {
    console.log(`\nSite:         http://localhost:${PORT}`);
    console.log(`Pickleball:   http://localhost:${PORT}/pickleball/`);
    console.log(`Tennis:       http://localhost:${PORT}/tennis/`);
    console.log(`Beach Tennis: http://localhost:${PORT}/beachtennis/`);
    console.log(`Padel:        http://localhost:${PORT}/padel/`);
    console.log(`Entry Editor: http://localhost:${PORT}/editor/`);
    console.log(
        "\nWatching content/, sports/, templates/ for changes. Ctrl+C to stop.\n",
    );
});
