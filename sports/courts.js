// sports/courts.js — Single source of truth for all sport configs.
// UMD: works as Node.js require() and browser <script src>.
// Exposes SPORT_COURTS (array) and SPORT_MAP (keyed by id).
(function (global, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else {
        const result = factory();
        global.SPORT_COURTS = result.list;
        global.SPORT_MAP = result.map;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    const CMX = 30,
        CMY = 50;

    const list = [
        {
            id: "tennis",
            name: "Tennis",
            icon: "🎾",
            description: "",
            accent: "#d4763a",
            accentDim: "#6b3010",
            teamA: "#d4763a",
            teamB: "#4385d4",
            teamW: "#d4a843",

            // Optic-yellow felt ball with white seam curves
            renderBall: function renderBall(mx, my, r, maskId) {
                const br = r * 0.7;
                const sw = br * 0.14;
                const clipId = maskId + '_btclip';
                // S-curve seam from top to bottom, dividing orange (left) from yellow-green (right)
                const seam = `M ${mx - br * 0.2} ${my - br} C ${mx + br * 0.6} ${my - br * 0.3} ${mx - br * 0.6} ${my + br * 0.3} ${mx + br * 0.2} ${my + br}`;
                // Orange region: left of seam extended far left, then clipped to circle
                const orangeRegion = `${seam} L ${mx - br * 0.2} ${my + br} L ${mx - br * 2} ${my + br} L ${mx - br * 2} ${my - br} Z`;
                return (
                    `<defs><clipPath id="${clipId}"><circle cx="${mx}" cy="${my}" r="${br}"/></clipPath></defs>` +
                    `<circle cx="${mx}" cy="${my}" r="${br}" fill="#ccdf20" opacity="0.95"/>` +
                    `<path d="${orangeRegion}" fill="#ccdf20" clip-path="url(#${clipId})"/>` +
                    `<path d="${seam}" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="${sw}" stroke-linecap="round" clip-path="url(#${clipId})"/>`
                );
            },

            // Doubles court: 36ft wide × 78ft long
            courtBase: function courtBase(W, H) {
                const net = 0.5,
                    svc = 18 / 39,
                    sl = 4.5 / 36;
                const sly1 = (net - svc * net) * H,
                    sly2 = (net + svc * net) * H;
                return `
    <rect x="${-CMX}" y="${-CMY}" width="${W + 2 * CMX}" height="${H + 2 * CMY}" fill="#1a110a"/>
    <rect width="${W}" height="${H}" fill="#9b4828" stroke="#c8704a" stroke-width="2"/>
    <line x1="${sl * W}" y1="0" x2="${sl * W}" y2="${H}" stroke="#c8704a" stroke-width="1.5"/>
    <line x1="${(1 - sl) * W}" y1="0" x2="${(1 - sl) * W}" y2="${H}" stroke="#c8704a" stroke-width="1.5"/>
    <line x1="${sl * W}" y1="${sly1}" x2="${(1 - sl) * W}" y2="${sly1}" stroke="#c8704a" stroke-width="1.5"/>
    <line x1="${sl * W}" y1="${sly2}" x2="${(1 - sl) * W}" y2="${sly2}" stroke="#c8704a" stroke-width="1.5"/>
    <line x1="${W / 2}" y1="${sly1}" x2="${W / 2}" y2="${sly2}" stroke="#c8704a" stroke-width="1"/>
    <line x1="-10" y1="${net * H}" x2="${W + 10}" y2="${net * H}" stroke="#e8e0c8" stroke-width="2.5" stroke-dasharray="5,4"/>
    <text x="${W / 2}" y="${H * 0.97}" text-anchor="middle" fill="#b0603a" font-size="${W * 0.042}" font-family="DM Mono,monospace"></text>
    <text x="${W / 2}" y="${H * 0.034}" text-anchor="middle" fill="#b0603a" font-size="${W * 0.042}" font-family="DM Mono,monospace"></text>
    <text x="${sl * W + W * 0.04}" y="${(net - svc * net * 0.5) * H}" fill="#b0603a" font-size="${W * 0.038}" font-family="DM Mono,monospace" dominant-baseline="middle"></text>
    <text x="${sl * W + W * 0.04}" y="${(net + svc * net * 0.5) * H}" fill="#b0603a" font-size="${W * 0.038}" font-family="DM Mono,monospace" dominant-baseline="middle"></text>`;
            },
        },

        {
            id: "beachtennis",
            name: "Beach Tennis",
            icon: "🏖️",
            description:
                "",
            accent: "#e8a830",
            accentDim: "#7a5010",
            teamA: "#e8a830",
            teamB: "#d45c43",
            teamW: "#4385d4",

            // Orange + yellow-green bicolor ball with S-curve seam
            renderBall: function renderBall(mx, my, r, maskId) {
                const br = r * 0.7;
                const sw = br * 0.14;
                const clipId = maskId + '_btclip';
                // S-curve seam from top to bottom, dividing orange (left) from yellow-green (right)
                const seam = `M ${mx - br * 0.2} ${my - br} C ${mx + br * 0.6} ${my - br * 0.3} ${mx - br * 0.6} ${my + br * 0.3} ${mx + br * 0.2} ${my + br}`;
                // Orange region: left of seam extended far left, then clipped to circle
                const orangeRegion = `${seam} L ${mx - br * 0.2} ${my + br} L ${mx - br * 2} ${my + br} L ${mx - br * 2} ${my - br} Z`;
                return (
                    `<defs><clipPath id="${clipId}"><circle cx="${mx}" cy="${my}" r="${br}"/></clipPath></defs>` +
                    `<circle cx="${mx}" cy="${my}" r="${br}" fill="#ccdf20" opacity="0.95"/>` +
                    `<path d="${orangeRegion}" fill="#e85520" clip-path="url(#${clipId})"/>` +
                    `<path d="${seam}" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="${sw}" stroke-linecap="round" clip-path="url(#${clipId})"/>`
                );
            },

            // 8m × 16m sand court, no service lines, 3m from net for serve
            courtBase: function courtBase(W, H) {
                const net = 0.5;
                const svc = 3 / 16;
                return `
    <rect x="${-CMX}" y="${-CMY}" width="${W + 2 * CMX}" height="${H + 2 * CMY}" fill="#8a6432"/>

    <rect width="${W}" height="${H}" fill="#c8924a"/>

    <line x1="0" y1="${(net - svc) * H}" x2="${W}" y2="${(net - svc) * H}" stroke="#e8e0c8" stroke-width="1"/>
    <line x1="0" y1="${(net + svc) * H}" x2="${W}" y2="${(net + svc) * H}" stroke="#e8e0c8" stroke-width="1"/>

    <rect width="${W}" height="${H}" fill="none" stroke="#5759c5" stroke-width="2"/>
    
    <line x1="-10" y1="${net * H}" x2="${W + 10}" y2="${net * H}" stroke="#e8e0c8" stroke-width="2.5" stroke-dasharray="5,4"/>
    
    <text x="${W / 2}" y="${H * 0.97}" text-anchor="middle" fill="#a87030" font-size="${W * 0.042}" font-family="DM Mono,monospace"></text>
    <text x="${W / 2}" y="${H * 0.034}" text-anchor="middle" fill="#a87030" font-size="${W * 0.042}" font-family="DM Mono,monospace"></text>
    <text x="${W / 2}" y="${net * H - W * 0.06}" text-anchor="middle" fill="#a87030" font-size="${W * 0.038}" font-family="DM Mono,monospace" dominant-baseline="middle"></text>`;
            },
        },
        {
            id: "pickleball",
            name: "Pickleball",
            icon: "🥒",
            description: "",
            accent: "#4caf6e",
            accentDim: "#2d5c3e",
            teamA: "#4caf6e",
            teamB: "#d45c43",
            teamW: "#d4a843",

            // Plastic ball with 26 holes
            renderBall: function renderBall(mx, my, r, maskId) {
                const br = r * 0.7,
                    hr = br * 0.24;
                const holePos = [
                    [0, -0.9],
                    [0.85, -0.27],
                    [-0.85, -0.27],
                    [-0.53, 0.73],
                    [0.53, 0.73],
                    [0, 0],
                ];
                return (
                    `<defs><mask id="${maskId}"><circle cx="${mx}" cy="${my}" r="${br}" fill="white"/>${holePos.map(([hx, hy]) => `<circle cx="${mx + hx * br}" cy="${my + hy * br}" r="${hr}" fill="black"/>`).join("")}</mask></defs>` +
                    `<circle cx="${mx}" cy="${my}" r="${br}" fill="#f5e642" stroke="#c0b020" stroke-width="1" mask="url(#${maskId})" opacity="0.9"/>`
                );
            },

            // 20ft wide × 44ft long court, non-volley zone 7ft from net
            courtBase: function courtBase(W, H) {
                const net = 0.5,
                    k = 7 / 44;
                return `
    <rect x="${-CMX}" y="${-CMY}" width="${W + 2 * CMX}" height="${H + 2 * CMY}" fill="#1e2d1e"/>
    <rect width="${W}" height="${H}" fill="#2a4a2a" stroke="#4a7a4a" stroke-width="2"/>
    <line x1="0" y1="${(net - k) * H}" x2="${W}" y2="${(net - k) * H}" stroke="#7aaa7a" stroke-width="1.5"/>
    <line x1="0" y1="${(net + k) * H}" x2="${W}" y2="${(net + k) * H}" stroke="#7aaa7a" stroke-width="1.5"/>
    <line x1="${W / 2}" y1="${(net + k) * H}" x2="${W / 2}" y2="${H}" stroke="#4a7a4a" stroke-width="1"/>
    <line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${(net - k) * H}" stroke="#4a7a4a" stroke-width="1"/>
    <!-- Net -->
    <line x1="-10" y1="${net * H}" x2="${W + 10}" y2="${net * H}" stroke="#e8e0c8" stroke-width="2.5" stroke-dasharray="5,4"/>
    <text x="${W / 2}" y="${H * 0.97}" text-anchor="middle" fill="#4a7a4a" font-size="${W * 0.042}" font-family="DM Mono,monospace"></text>
    <text x="${W / 2}" y="${H * 0.034}" text-anchor="middle" fill="#4a7a4a" font-size="${W * 0.042}" font-family="DM Mono,monospace"></text>
    <text x="${W * 0.5}" y="${(net - k / 2) * H + 4}" fill="#4a9a4a" font-size="${W * 0.038}" font-family="DM Mono,monospace" dominant-baseline="middle" text-anchor="middle">Kitchen</text>
    <text x="${W * 0.5}" y="${(net + k / 2) * H + 4}" fill="#4a9a4a" font-size="${W * 0.038}" font-family="DM Mono,monospace" dominant-baseline="middle" text-anchor="middle">Kitchen</text>`;
            },
        },
        {
            id: "padel",
            name: "Padel",
            icon: "🏓",
            description: "",
            accent: "#43b5c8",
            accentDim: "#1a5a6a",
            teamA: "#43b5c8",
            teamB: "#d45c43",
            teamW: "#d4a843",

            // Depressurized tennis ball — same seam, slightly muted yellow
            renderBall: function renderBall(mx, my, r, maskId) {
                const br = r * 0.7;
                const sw = br * 0.14;
                const clipId = maskId + '_btclip';
                // S-curve seam from top to bottom, dividing orange (left) from yellow-green (right)
                const seam = `M ${mx - br * 0.2} ${my - br} C ${mx + br * 0.6} ${my - br * 0.3} ${mx - br * 0.6} ${my + br * 0.3} ${mx + br * 0.2} ${my + br}`;
                // Orange region: left of seam extended far left, then clipped to circle
                const orangeRegion = `${seam} L ${mx - br * 0.2} ${my + br} L ${mx - br * 2} ${my + br} L ${mx - br * 2} ${my - br} Z`;
                return (
                    `<defs><clipPath id="${clipId}"><circle cx="${mx}" cy="${my}" r="${br}"/></clipPath></defs>` +
                    `<circle cx="${mx}" cy="${my}" r="${br}" fill="#ccdf20" opacity="0.95"/>` +
                    `<path d="${orangeRegion}" fill="#ccdf20" clip-path="url(#${clipId})"/>` +
                    `<path d="${seam}" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="${sw}" stroke-linecap="round" clip-path="url(#${clipId})"/>`
                );
            },

            // 10m × 20m enclosed court, service line 7m from net
            courtBase: function courtBase(W, H) {
                const net = 0.5,
                    svc = 7 / 10;
                const sly1 = (net - svc * net) * H,
                    sly2 = (net + svc * net) * H;
                const glassEnd = 6 / 10;
                const gridEnd = 1 / 10;
                return `
    <!-- background -->
    <rect x="${-CMX}" y="${-CMY}" width="${W + 2 * CMX}" height="${H + 2 * CMY}" fill="#0e1820"/>

    <!-- court -->
    <rect width="${W}" height="${H}" fill="#1a3050"/>

    <!-- Glass walls and metal grid -->
    <path 
      d="M -4 ${H + 4} 
        L ${W + 4} ${H + 4} 
        L ${W + 4} ${((1 + glassEnd) * H) / 2}
        M ${W + 4} ${((1 - glassEnd) * H) / 2}
        L ${W + 4} -4 
        L -4 -4 
        L -4 ${((1 - glassEnd) * H) / 2} 
        M -4 ${((1 + glassEnd) * H) / 2}
        L -4 ${H + 4}" 
      fill="none" 
      stroke="#506080" 
      stroke-width="6" 
      opacity="0.7"
    />
    <path 
      d="M ${W + 2} ${((1 - glassEnd) * H) / 2}
        L ${W + 2} ${((1 - gridEnd) * H) / 2}
        M ${W + 2} ${((1 + glassEnd) * H) / 2}
        L ${W + 2} ${((1 + gridEnd) * H) / 2}
        M -2 ${((1 - glassEnd) * H) / 2}
        L -2 ${((1 - gridEnd) * H) / 2}
        M -2 ${((1 + glassEnd) * H) / 2}
        L -2 ${((1 + gridEnd) * H) / 2}" 
      fill="none" 
      stroke="rgb(29, 44, 59)" 
      stroke-width="6" 
      opacity="0.7"
    />

    <!-- border -->
    <rect width="${W}" height="${H}" fill="none" stroke="#2a5080" stroke-width="2"/>

    <!--<rect x="-4" y="-4" width="${W + 8}" height="${H + 8}" fill="none" stroke="#7090b0" stroke-width="1.5"/>-->

    <!-- Service lines -->
    <line x1="0" y1="${sly1}" x2="${W}" y2="${sly1}" stroke="#3a6090" stroke-width="1.5"/>
    <line x1="0" y1="${sly2}" x2="${W}" y2="${sly2}" stroke="#3a6090" stroke-width="1.5"/>
    <line x1="${W / 2}" y1="${sly1}" x2="${W / 2}" y2="${sly2}" stroke="#3a6090" stroke-width="1"/>

    <!-- Net -->
    <line x1="-5" y1="${net * H}" x2="${W + 5}" y2="${net * H}" stroke="#e8e0c8" stroke-width="2.5" stroke-dasharray="5,4"/>`;
            },
        },
    ];

    const map = {};
    list.forEach((s) => (map[s.id] = s));

    return { list, map };
});
