// sport.js — shared logic for all sport pages.
// Requires these globals defined inline before this script:
//   TC, courtBase, renderBall, courtBaseByStage, renderBallByStage,
//   SPORT_STAGES, SPORT_ID, SPORT_NAME_LABEL

// ── Court renderer ─────────────────────────────────────────────────────────────
const AC = { ball:"#f5e642", move:"#7ab3f5", screen:"#c084f5", line:"#b8c8b4" };
const CMX=30, CMY=50;

function courtDefs(sfx) {
  return `<defs>
    <marker id="ab${sfx}"  markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M0,0 L0,4 L4,2 z" fill="${AC.ball}"/></marker>
    <marker id="am${sfx}"  markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M0,0 L0,4 L4,2 z" fill="${AC.move}"/></marker>
    <marker id="as${sfx}"  markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M0,0 L0,4 L4,2 z" fill="${AC.screen}"/></marker>
    <marker id="al${sfx}"  markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M0,0 L0,4 L4,2 z" fill="${AC.line}"/></marker>
    <marker id="abr${sfx}" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto-start-reverse"><path d="M0,0 L0,4 L4,2 z" fill="${AC.ball}"/></marker>
    <marker id="amr${sfx}" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto-start-reverse"><path d="M0,0 L0,4 L4,2 z" fill="${AC.move}"/></marker>
    <marker id="asr${sfx}" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto-start-reverse"><path d="M0,0 L0,4 L4,2 z" fill="${AC.screen}"/></marker>
    <marker id="alr${sfx}" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto-start-reverse"><path d="M0,0 L0,4 L4,2 z" fill="${AC.line}"/></marker>
  </defs>`;
}

function renderDiagram(d, W, H, sfx, rb) {
  if (!d) return "";
  rb = rb || renderBall;
  let s = "";

  (d.zones||[]).forEach(z => {
    const zx=z.x*W, zy=z.y*H, zw=(z.width||.15)*W, zh=(z.height||.15)*H;
    const c=z.color||"#f5e642";
    s+=`<rect x="${zx}" y="${zy}" width="${zw}" height="${zh}" fill="${c}" fill-opacity="0.18" stroke="${c}" stroke-width="1.5" stroke-dasharray="5,3"/>`;
    if(z.label){const lx=zx+zw/2,ly=zy+zh/2,rot=z.rotation||0;s+=`<text x="${lx}" y="${ly}" ${rot?`transform="rotate(${rot},${lx},${ly})"`:""} text-anchor="middle" dominant-baseline="middle" fill="${c}" font-size="${W*.04}" font-family="DM Mono,monospace" opacity="0.9">${z.label}</text>`;}
  });

  (d.arrows||[]).forEach(a => {
    const col=AC[a.type]||AC.ball, isLine=a.type==="line";
    const headEnd   = isLine ? (a.headEnd??false)  : (a.headEnd??true);
    const headStart = a.headStart||a.bidir||false;
    const pfx=a.type==="move"?"am":a.type==="screen"?"as":a.type==="line"?"al":"ab";
    const mEnd  = headEnd   ? `marker-end="url(#${pfx})"`    : "";
    const mStart= headStart ? `marker-start="url(#${pfx}r)"` : "";
    const dash=isLine?"8,5":a.type==="move"?"6,4":"";
    const x1=a.x1*W,y1=a.y1*H,x2=a.x2*W,y2=a.y2*H;
    let d;
    if (!a.midTouched) { d=`M ${x1} ${y1} L ${x2} ${y2}`; }
    else { const cx=a.cx*W,cy=a.cy*H; d=a.mode==="angled"?`M ${x1} ${y1} L ${cx} ${cy} L ${x2} ${y2}`:`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`; }
    s+=`<path d="${d}" stroke="${col}" stroke-width="${W*.012}" fill="none" ${dash?`stroke-dasharray="${dash}"`:""}
      ${mEnd} ${mStart} opacity="0.9"/>`;
  });

  (d.markers||[]).forEach(m => {
    const mx=m.x*W, my=m.y*H, r=W*.04;
    if(m.image){
      s+=`<image href="${m.image}" x="${mx-r}" y="${my-r}" width="${r*2}" height="${r*2}" preserveAspectRatio="xMidYMid meet"/>`;
    } else if(m.type==="cone"){
      const cc=m.color||"#f5a542";
      s+=`<polygon points="${mx},${my-r} ${mx-r*.8},${my+r*.6} ${mx+r*.8},${my+r*.6}" fill="${cc}" stroke="rgba(0,0,0,0.35)" stroke-width="1.2" opacity="0.9"/>`;
    } else if(m.type==="ball"){
      const maskId=`bm${m.id||mx}${sfx}`;
      s+=rb(mx, my, r, maskId);
    } else if(m.type==="text"){
      const fs=(m.size||11)/11/16*W, col=m.color||"#e8ede4", rot=m.rotation||0;
      const tf=rot?`rotate(${rot},${mx},${my})`:"";
      const fw=m.bold?"600":"300", fi=m.italic?"italic":"normal";
      s+=`<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="middle" fill="${col}" font-size="${fs}" font-family="Fraunces,Georgia,serif" font-weight="${fw}" font-style="${fi}" transform="${tf}">${m.text||"Text"}</text>`;
    } else if(m.type==="basket"){
      const bc=m.color||"#d4a843", sw=r*0.16;
      s+=`<path d="M ${mx-r} ${my-r*0.3} L ${mx+r} ${my-r*0.3} L ${mx+r*0.72} ${my+r*0.72} L ${mx-r*0.72} ${my+r*0.72} Z" fill="${bc}" fill-opacity="0.18" stroke="${bc}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      s+=`<ellipse cx="${mx}" cy="${my-r*0.3}" rx="${r}" ry="${r*0.27}" fill="${bc}" fill-opacity="0.12" stroke="${bc}" stroke-width="${sw}"/>`;
      s+=`<line x1="${mx}" y1="${my+r*0.72}" x2="${mx}" y2="${my+r*1.3}" stroke="${bc}" stroke-width="${sw*1.3}" stroke-linecap="round"/>`;
      s+=`<line x1="${mx-r*0.52}" y1="${my+r*1.3}" x2="${mx+r*0.52}" y2="${my+r*1.3}" stroke="${bc}" stroke-width="${sw*1.3}" stroke-linecap="round"/>`;
      s+=`<circle cx="${mx-r*0.38}" cy="${my+r*0.22}" r="${r*0.22}" fill="${bc}" opacity="0.88"/>`;
      s+=`<circle cx="${mx}" cy="${my+r*0.1}" r="${r*0.22}" fill="${bc}" opacity="0.88"/>`;
      s+=`<circle cx="${mx+r*0.38}" cy="${my+r*0.22}" r="${r*0.22}" fill="${bc}" opacity="0.88"/>`;
    } else {
      s+=`<rect x="${mx-r}" y="${my-r}" width="${r*2}" height="${r*2}" fill="#9a7af5" stroke="#6a4ac5" stroke-width="1" opacity="0.9"/>`;
    }
  });

  (d.players||[]).forEach(p => {
    const px=p.x*W, py=p.y*H, r=W*.055;
    const col=p.team==='P'?(p.color||'#888'):(TC[p.team]||TC.A);
    if(p.image){
      s+=`<clipPath id="cp${p.id}${sfx}"><circle cx="${px}" cy="${py}" r="${r}"/></clipPath>`;
      s+=`<image href="${p.image}" x="${px-r}" y="${py-r}" width="${r*2}" height="${r*2}" clip-path="url(#cp${p.id}${sfx})" preserveAspectRatio="xMidYMid slice"/>`;
      s+=`<circle cx="${px}" cy="${py}" r="${r}" fill="none" stroke="${col}" stroke-width="2.5"/>`;
    } else {
      s+=`<circle cx="${px}" cy="${py}" r="${r}" fill="${col}" stroke="#111" stroke-width="1.5" opacity="0.95"/>`;
      s+=`<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="${r*.85}" font-family="DM Mono,monospace" font-weight="500">${p.label||p.team}</text>`;
    }
  });

  return s;
}

function courtSvg(diagram, sfx, stage) {
  const W=200, H=440;
  const hasDiagram = diagram && ((diagram.players||[]).length+(diagram.arrows||[]).length+(diagram.markers||[]).length+(diagram.zones||[]).length>0);
  const stageHtml = (stage && stage!=="yellow") ? courtBaseByStage(stage,W,H) : null;
  const cb = stageHtml || courtBase(W,H);
  const rb = (stage && stage!=="yellow") ? (mx,my,r,mid)=>{const r2=renderBallByStage(stage,mx,my,r,mid);return r2!==null?r2:renderBall(mx,my,r,mid);} : renderBall;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-CMX} ${-CMY} ${W+2*CMX} ${H+2*CMY}" style="width:100%;height:100%">${courtDefs(sfx)}${cb}${hasDiagram?renderDiagram(diagram,W,H,sfx,rb):""}</svg>`;
}

// ── Badge helpers ──────────────────────────────────────────────────────────────
const STAR_SVG=`<svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8,1 L9.59,5.82 L14.66,5.84 L10.57,8.83 L12.11,13.66 L8,10.7 L3.89,13.66 L5.43,8.83 L1.34,5.84 L6.41,5.82 Z"/></svg>`;
const CAT_LABEL = { Exercise:"Übung", Drill:"Korb-Übung", Game:"Spiel" };
const SKILL_LABEL = { Beginner:"Beginner", Intermediate:"Fortgeschrittene", Advanced:"Experten", "All Levels":"Alle Niveaus" };
const STAGE_LABEL = { red:"Rot", orange:"Orange", green:"Grün", yellow:"Gelb" };
const STAGE_META  = Object.fromEntries(SPORT_STAGES.map(s=>[s.id,s]));
const STAGE_ORDER = SPORT_STAGES.map(s=>s.id);
function sortStages(stages) { return (stages||[]).slice().sort((a,b)=>STAGE_ORDER.indexOf(a)-STAGE_ORDER.indexOf(b)); }
function stageDots(stages) {
  return sortStages(stages).map(id=>{const m=STAGE_META[id];return m?`<span title="${m.label}" style="width:8px;height:8px;border-radius:50%;background:${m.color};display:inline-block;flex-shrink:0"></span>`:""}).join("");
}
function stageColoredText(stages) {
  return sortStages(stages).map(id=>{const m=STAGE_META[id];return m?`<span style="color:${m.color}">${m.label}</span>`:id}).join(" ");
}

function catBadge(c) {
  if(!c) return "";
  return `<span class="badge badge-${c.toLowerCase()}">${CAT_LABEL[c]||c}</span>`;
}
function skillBadge(s) {
  if(!s) return "";
  const n={Beginner:1,Intermediate:2,Advanced:3}[s]??3;
  const col=s==="Beginner"?"#4caf6e":s==="Intermediate"?"#d4a843":s==="Advanced"?"#d45c43":"#4385d4";
  const label=SKILL_LABEL[s]||s;
  const b=(x,y,h,on)=>`<rect x="${x}" y="${y}" width="2.8" height="${h}" rx="0.6" fill-opacity="${on?1:0.2}"/>`;
  return `<span class="badge" title="${label}" style="background:color-mix(in srgb,${col} 15%,transparent);color:${col};padding:4px 6px;display:inline-flex;align-items:center"><svg width="12" height="10" viewBox="0 0 12 10" fill="currentColor" aria-hidden="true">${b(0,5,5,n>=1)}${b(4.6,2.5,7.5,n>=2)}${b(9.2,0,10,n>=3)}</svg></span>`;
}
function stageBadge(s) {
  if(!s) return "";
  return `<span class="badge badge-stage-${s}">${STAGE_LABEL[s]||s}</span>`;
}

// ── State ──────────────────────────────────────────────────────────────────────
const LS_KEY=`rally_filters_${SPORT_ID}`;
const FAV_KEY=`rally_favs_${SPORT_ID}`;
let allEntries=[], activeCat="", activeSkill="", activeTrains=new Set();
let durationMin=null, durationMax=null;
let materialStates={}, allMaterials=[], filterNoMaterials=false;
let filterHalfCourt=false;
let activeStage="";
let favourites=new Set(), filterFavs=false;

function fmtDuration(d) {
  if(!d||typeof d!=="object") return "";
  // 0 means unset (older editor versions wrote 0 instead of null)
  const min=d.min||null, max=d.max||null;
  if(min!=null&&max!=null) return min===max ? `${min} min` : `${min}-${max} min`;
  if(min!=null) return `${min}+ min`;
  if(max!=null) return `≤${max} min`;
  return "";
}

function getFiltered() {
  const q=document.getElementById("search").value.toLowerCase().trim();
  return allEntries.filter(e => {
    if(filterFavs  && !favourites.has(e.slug)) return false;
    if(activeCat   && e.category!==activeCat) return false;
    if(activeSkill && e.skill_requirement!==activeSkill && e.skill_requirement!=="All Levels") return false;
    if(activeTrains.size>0 && ![...activeTrains].every(s=>(e.skills_trained||[]).includes(s))) return false;
    {const mats=Array.isArray(e.materials)?e.materials.filter(Boolean):Object.keys(e.materials||{});
    if(filterNoMaterials){if(mats.length>0)return false;}
    else if(mats.some(m=>materialStates[m]==="unavailable"))return false;}
    if(filterHalfCourt && !e.half_court) return false;
    if(activeStage && (e.stages||[]).length && !(e.stages||[]).includes(activeStage)) return false;
    if(durationMin!==null||durationMax!==null){
      const d=e.duration;
      if(!d||typeof d!=="object") return false;
      if(durationMin!==null&&(d.max||Infinity)<durationMin) return false;
      if(durationMax!==null&&(d.min??0)>durationMax) return false;
    }
    if(q){
      const hay=[e.title,e.summary,...(e.skills_trained||[])].join(" ").toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
}

// ── Filters ────────────────────────────────────────────────────────────────────
function setCat(cat) {
  activeCat=cat;
  document.querySelectorAll("[data-cat]").forEach(b=>b.classList.toggle("active",b.dataset.cat===cat));
  filterEntries(); saveFilters();
  if(document.getElementById("view-entry").classList.contains("active")) showView("list",true);
  else closeSidebar();
}
function setSkill(sk) {
  activeSkill=sk;
  document.querySelectorAll("[data-skill]").forEach(b=>b.classList.toggle("active",b.dataset.skill===sk));
  filterEntries(); saveFilters();
}
function toggleHalfCourt(btn) {
  filterHalfCourt=!filterHalfCourt;
  btn.classList.toggle("active",filterHalfCourt);
  filterEntries(); saveFilters();
}
function setStage(stg) {
  activeStage=stg;
  document.querySelectorAll("#stage-chips .chip").forEach(b=>b.classList.toggle("active",b.dataset.stage===stg));
  filterEntries(); saveFilters();
  if(document.getElementById("view-entry").classList.contains("active")) showView("list",true);
  else closeSidebar();
}
function toggleTrain(skill,btn) {
  activeTrains.has(skill)?activeTrains.delete(skill):activeTrains.add(skill);
  btn.classList.toggle("active",activeTrains.has(skill));
  filterEntries(); saveFilters();
}
function setDuration() {
  const mn=document.getElementById("dur-min").value;
  const mx=document.getElementById("dur-max").value;
  durationMin=mn!==""?+mn:null;
  durationMax=mx!==""?+mx:null;
  filterEntries(); saveFilters();
}

function buildSkillsList() {
  const all=new Set();
  allEntries.forEach(e=>(e.skills_trained||[]).forEach(s=>all.add(s)));
  const sec =document.getElementById("skills-list").parentElement;
  if(!all.size){sec.style.display="none";return;}
  document.getElementById("skills-list").innerHTML=[...all].sort().map(s=>
    `<button class="chip ${activeTrains.has(s)?"active":""}" onclick="toggleTrain('${s.replace(/'/g,"\\'")}',this)">${s}</button>`).join("");
}

function buildMaterialsList() {
  const all=new Set();
  allEntries.forEach(e=>{
    const mats=Array.isArray(e.materials)?e.materials:Object.keys(e.materials||{});
    mats.filter(Boolean).forEach(m=>all.add(m));
  });
  const sec=document.getElementById("materials-section");
  if(!all.size){sec.style.display="none";return;}
  sec.style.display="";
  allMaterials=[...all].sort();
}

function openMaterialsModal() {
  renderMaterialsModal();
  document.getElementById("materials-modal").classList.add("open");
  document.body.style.overflow="hidden";
}
function closeMaterialsModal() {
  document.getElementById("materials-modal").classList.remove("open");
  document.body.style.overflow="";
}
function renderMaterialsModal() {
  document.getElementById("mat-modal-grid").innerHTML=allMaterials.map(mat=>{
    const state=materialStates[mat];
    const cls=!state?"mat-unspecified":state==="available"?"mat-available":"mat-unavailable";
    const badge=!state?'<span class="mat-new-badge">NEU</span>':"";
    return `<div class="mat-card ${cls}" onclick="toggleMaterialState('${mat.replace(/'/g,"\\'")}')"><span>${mat}</span>${badge}</div>`;
  }).join("");
}
function toggleMaterialState(mat) {
  materialStates[mat]=materialStates[mat]==="available"?"unavailable":"available";
  renderMaterialsModal();
  filterEntries();
  saveFilters();
}
function setAllMaterials(state) {
  allMaterials.forEach(m=>{ materialStates[m]=state; });
  renderMaterialsModal();
  filterEntries();
  saveFilters();
}
function toggleNoMaterials(btn) {
  filterNoMaterials=!filterNoMaterials;
  btn.classList.toggle("active",filterNoMaterials);
  filterEntries();
  saveFilters();
}

// ── Favourites ─────────────────────────────────────────────────────────────────
function loadFavs() {
  try { favourites=new Set(JSON.parse(localStorage.getItem(FAV_KEY)||"[]")); } catch {}
}
function saveFavs() {
  try { localStorage.setItem(FAV_KEY,JSON.stringify([...favourites])); } catch {}
}
function toggleFav(slug, btn, event) {
  if(event){event.preventDefault();event.stopPropagation();}
  if(favourites.has(slug)) favourites.delete(slug);
  else favourites.add(slug);
  const active=favourites.has(slug);
  btn.classList.toggle("active",active);
  btn.closest(".entry-card")?.classList.toggle("is-fav",active);
  const entryBtn=document.getElementById("entry-fav-btn");
  if(entryBtn && entryBtn!==btn) entryBtn.classList.toggle("active",active);
  const cardBtn=document.querySelector(`.entry-card[href="#${CSS.escape(slug)}"] .fav-btn`);
  if(cardBtn && cardBtn!==btn){
    cardBtn.classList.toggle("active",active);
    cardBtn.closest(".entry-card")?.classList.toggle("is-fav",active);
  }
  saveFavs();
  updateFavSection();
  if(filterFavs) filterEntries();
}
function toggleFavFilter(btn) {
  filterFavs=!filterFavs;
  btn.classList.toggle("active",filterFavs);
  filterEntries();
}
function updateFavSection() {
  const sec=document.getElementById("fav-section");
  if(sec) sec.style.display=favourites.size>0?"":"none";
  if(!favourites.size && filterFavs) {
    filterFavs=false;
    const chip=document.getElementById("fav-filter-chip");
    if(chip) chip.classList.remove("active");
  }
}

// ── Persistence ────────────────────────────────────────────────────────────────
function saveFilters() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      activeCat, activeSkill, activeTrains:[...activeTrains],
      durationMin, durationMax, filterHalfCourt, activeStage,
      materialStates, filterNoMaterials,
    }));
  } catch {}
}
function loadFilters() {
  try {
    const raw=localStorage.getItem(LS_KEY);
    if(!raw) return;
    const d=JSON.parse(raw);
    activeCat       = d.activeCat||"";
    activeSkill     = d.activeSkill||"";
    activeTrains    = new Set(d.activeTrains||[]);
    durationMin     = d.durationMin??null;
    durationMax     = d.durationMax??null;
    filterHalfCourt = !!d.filterHalfCourt;
    activeStage     = d.activeStage||"";
    materialStates  = d.materialStates||{};
    filterNoMaterials=!!d.filterNoMaterials;
  } catch {}
}
function applyFilterStateToUI() {
  document.querySelectorAll("[data-cat]").forEach(b=>b.classList.toggle("active",b.dataset.cat===activeCat));
  document.querySelectorAll("[data-skill]").forEach(b=>b.classList.toggle("active",b.dataset.skill===activeSkill));
  document.querySelectorAll("#stage-chips .chip").forEach(b=>b.classList.toggle("active",b.dataset.stage===activeStage));
  const hcBtn=document.querySelector(".chips button[onclick='toggleHalfCourt(this)']");
  if(hcBtn)hcBtn.classList.toggle("active",filterHalfCourt);
  if(durationMin!==null)document.getElementById("dur-min").value=durationMin;
  if(durationMax!==null)document.getElementById("dur-max").value=durationMax;
  const noBtn=document.getElementById("mat-no-materials");
  if(noBtn)noBtn.classList.toggle("active",filterNoMaterials);
}

function countWith(ov) {
  const q=document.getElementById("search").value.toLowerCase().trim();
  const cat   =ov.cat   !==undefined?ov.cat   :activeCat;
  const skill =ov.skill !==undefined?ov.skill :activeSkill;
  const stage =ov.stage !==undefined?ov.stage :activeStage;
  const trains=ov.trains!==undefined?ov.trains:activeTrains;
  const hc    =ov.hc    !==undefined?ov.hc    :filterHalfCourt;
  const noMats=ov.noMats!==undefined?ov.noMats:filterNoMaterials;
  return allEntries.filter(e=>{
    if(cat   &&e.category!==cat)            return false;
    if(skill &&e.skill_requirement!==skill&&e.skill_requirement!=="All Levels") return false;
    if(trains.size>0&&![...trains].every(s=>(e.skills_trained||[]).includes(s))) return false;
    if(hc&&!e.half_court)                   return false;
    if(stage&&(e.stages||[]).length&&!(e.stages||[]).includes(stage)) return false;
    {const mats=Array.isArray(e.materials)?e.materials.filter(Boolean):Object.keys(e.materials||{});
    if(noMats){if(mats.length>0)return false;}
    else if(mats.some(m=>materialStates[m]==="unavailable"))return false;}
    if(durationMin!==null||durationMax!==null){
      const d=e.duration;
      if(!d||typeof d!=="object") return false;
      if(durationMin!==null&&(d.max||Infinity)<durationMin) return false;
      if(durationMax!==null&&(d.min??0)>durationMax) return false;
    }
    if(q){const hay=[e.title,e.summary,...(e.skills_trained||[])].join(" ").toLowerCase();if(!hay.includes(q))return false;}
    return true;
  }).length;
}

function updateChipVisibility() {
  let visCat=0;
  document.querySelectorAll("#cat-chips .chip").forEach(btn=>{
    const active=btn.classList.contains("active");
    if(active){btn.style.display="";visCat++;return;}
    const n=countWith({cat:btn.dataset.cat});
    btn.style.display=n>0?"":"none";
    if(n>0)visCat++;
  });
  const catSec=document.getElementById("cat-chips").closest(".sb-section");
  if(catSec)catSec.style.display=visCat>0?"":"none";

  let visSkill=0;
  document.querySelectorAll("#skill-chips .chip").forEach(btn=>{
    const active=btn.classList.contains("active");
    if(active){btn.style.display="";visSkill++;return;}
    const n=countWith({skill:btn.dataset.skill});
    btn.style.display=n>0?"":"none";
    if(n>0)visSkill++;
  });
  const skillSec=document.getElementById("skill-chips").closest(".sb-section");
  if(skillSec)skillSec.style.display=visSkill>0?"":"none";

  {
    const hcBtn=document.querySelector(".chips button[onclick='toggleHalfCourt(this)']");
    if(hcBtn){
      const visible=filterHalfCourt||countWith({hc:true})>0;
      hcBtn.style.display=visible?"":"none";
      const sec=hcBtn.closest(".sb-section");
      if(sec)sec.style.display=visible?"":"none";
    }
  }

  if(SPORT_STAGES.length){
    document.querySelectorAll("#stage-chips .chip").forEach(btn=>{
      if(btn.classList.contains("active")||!btn.dataset.stage){btn.style.display="";return;}
      const n=countWith({stage:btn.dataset.stage});
      btn.style.display=n>0?"":"none";
    });
  }

  {
    let visAny=false;
    document.querySelectorAll("#skills-list .chip").forEach(btn=>{
      const skill=btn.textContent.trim();
      if(btn.classList.contains("active")){btn.style.display="";visAny=true;return;}
      const newT=new Set([...activeTrains,skill]);
      const n=countWith({trains:newT});
      btn.style.display=n>0?"":"none";
      if(n>0)visAny=true;
    });
    const sec=document.getElementById("skills-list").parentElement;
    if(sec)sec.style.display=visAny?"":"none";
  }

  {
    const noBtn=document.getElementById("mat-no-materials");
    if(noBtn){
      const visible=filterNoMaterials||countWith({noMats:true})>0;
      noBtn.style.display=visible?"":"none";
    }
  }
}

function filterEntries() {
  const f=getFiltered();
  document.getElementById("entry-count").textContent=`${f.length} / ${allEntries.length}`;
  renderList(f);
  updateChipVisibility();
}

// ── List view ──────────────────────────────────────────────────────────────────
function renderList(entries) {
  const grid=document.getElementById("entry-grid");
  const empty=document.getElementById("empty-state");
  if(!entries.length){grid.innerHTML="";empty.style.display="block";return;}
  empty.style.display="none";
  _cycleTimers.forEach(t=>clearInterval(t)); _cycleTimers=[];
  grid.innerHTML=entries.map(e=>{
    const frames=(e.frames&&e.frames.length)?e.frames:(e.diagram?[e.diagram]:[]);
    const sfxBase="t"+e.slug.replace(/-/g,"");
    let thumb="";
    if(frames.length===1){
      thumb=`<div class="court-thumb">${courtSvg(frames[0],sfxBase,e.diagram_stage)}</div>`;
    }else if(frames.length>1){
      const slides=frames.map((f,i)=>`<div class="frame-slide${i===0?" active":""}">${courtSvg(f,sfxBase+i,e.diagram_stage)}</div>`).join("");
      thumb=`<div class="court-thumb frame-cycle">${slides}</div>`;
    }
    const skills=(e.skills_trained||[]).map(s=>`<span class="skill-tag">${s}</span>`).join("");
    const hasPlayers = typeof(e.players) !== "object";
    const playerIcon=`<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.029 10 8 10c-2.03 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/></svg>`;
    const clockIcon=`<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>`;
    const isFav=favourites.has(e.slug);
    const dur=fmtDuration(e.duration);
    const favBtn=`<button class="fav-btn${isFav?' active':''}" onclick="toggleFav('${e.slug.replace(/'/g,"\\'")}',this,event)" aria-label="Favorit" title="Favorit">${STAR_SVG}</button>`;
    return `<a class="entry-card${isFav?' is-fav':''}" href="#${e.slug}">
      <div class="card-top">
        <div style="flex:1;min-width:0">
          <div class="card-badges">${favBtn}${catBadge(e.category)}${skillBadge(e.skill_requirement)}</div>
          <div class="card-title">${e.title}</div>
          ${e.summary?`<div class="card-summary" style="margin-top:5px">${e.summary}</div>`:""}
        </div>
        ${thumb}
      </div>
      ${skills?`<div class="card-skills">${skills}</div>`:""}
      <div class="card-meta">
        ${hasPlayers?`<span style="display:inline-flex;align-items:center;gap:4px">${playerIcon}${e.players}</span>`:""}
        ${dur?`<span style="display:inline-flex;align-items:center;gap:4px">${clockIcon}${dur}</span>`:""}
        ${(e.stages||[]).length?`<span style="display:inline-flex;align-items:center;gap:3px;margin-left:2px">${stageDots(e.stages)}</span>`:""}
      </div>
    </a>`;
  }).join("");
  startFrameCycling();
}

// ── Detail view ────────────────────────────────────────────────────────────────
let _modalFrames=[], _modalFrameIdx=0, _modalStage=null;

// ── Frame cycling (list thumbnails) ────────────────────────────────────────────
let _cycleTimers=[];
function startFrameCycling() {
  _cycleTimers.forEach(t=>clearInterval(t));
  _cycleTimers=[];
  document.querySelectorAll(".frame-cycle").forEach(el=>{
    const slides=el.querySelectorAll(".frame-slide");
    if(slides.length<2) return;
    let idx=0;
    const t=setInterval(()=>{
      const out=slides[idx];
      out.classList.remove("active");
      out.classList.add("leaving");
      setTimeout(()=>out.classList.remove("leaving"),650);
      idx=(idx+1)%slides.length;
      slides[idx].classList.add("active");
    },2000);
    _cycleTimers.push(t);
  });
}

function entryCycleHtml(frames, sfx, stage) {
  if(frames.length<=1) return courtSvg(frames[0]||null,sfx,stage);
  const slides=frames.map((f,i)=>`<div class="frame-slide${i===0?" active":""}">${courtSvg(f,sfx+i,stage)}</div>`).join("");
  return `<div class="frame-cycle" style="width:100%;height:100%">${slides}</div>`;
}

function openEntry(slug, pushState=true) {
  const e=allEntries.find(x=>x.slug===slug);
  if(!e) return;
  _modalFrames=(e.frames&&e.frames.length)?e.frames:(e.diagram?[e.diagram]:[null]);
  _modalFrameIdx=0;
  _modalStage=e.diagram_stage||null;
  const _firstFrame=_modalFrames[0]||null;
  const date=e.date?new Date(e.date+"T12:00:00").toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"";
  const skills=(e.skills_trained||[]).map(s=>`<span class="skill-tag">${s}</span>`).join("");
  const hasPlayers = typeof(e.players) !== "object";
  const courtInfoHtml=`
    ${hasPlayers?`<div class="info-row"><span class="info-label">Spieler</span><span class="info-value">${e.players}</span></div>`:""}
    ${fmtDuration(e.duration)?`<div class="info-row"><span class="info-label">Dauer</span><span class="info-value">${fmtDuration(e.duration)}</span></div>`:""}
    ${e.skill_requirement?`<div class="info-row"><span class="info-label">Skill</span><span class="info-value">${SKILL_LABEL[e.skill_requirement]||e.skill_requirement}</span></div>`:""}
    <div class="info-row"><span class="info-label">Court-Hälfte</span><span class="info-value ${e.half_court?"":"danger"}">${e.half_court?"Ja":"Nein"}</span></div>
    ${(e.stages||[]).length?`<div class="info-row"><span class="info-label">Stufen</span><span class="info-value" style="display:inline-flex;gap:8px;flex-wrap:wrap">${sortStages(e.stages).map(stageBadge).join("")}</span></div>`:""}` ;
  document.getElementById("entry-content").innerHTML=`
    <div class="entry-layout">
      <div>
        <div class="entry-byline"><button id="entry-fav-btn" class="fav-btn${favourites.has(e.slug)?' active':''}" onclick="toggleFav('${e.slug.replace(/'/g,"\\'")}',this,null)" aria-label="Favorit" title="Favorit" style="margin-right:4px"><svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8,1 L9.59,5.82 L14.66,5.84 L10.57,8.83 L12.11,13.66 L8,10.7 L3.89,13.66 L5.43,8.83 L1.34,5.84 L6.41,5.82 Z"/></svg></button>${catBadge(e.category)}${skillBadge(e.skill_requirement)}${date?`<span style="color:var(--ink-faint);font-size:0.75rem;font-family:var(--mono)">${date}</span>`:""}</div>
        <div class="entry-heading">${e.title}</div>
        ${skills?`<div class="entry-trained">${skills}</div>`:""}
        ${(e.materials||[]).length?`<div style="margin-bottom:20px"><span style="font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink-faint);font-weight:500;display:block;margin-bottom:6px">Materialien</span><ul style="margin:0 0 0 1.2em;font-size:0.85rem;color:var(--ink-muted);line-height:1.8">${e.materials.map(m=>`<li>${m}</li>`).join("")}</ul></div>`:""}
        <div class="court-inline">
          <div class="court-wrap" onclick="openCourtModal()" title="Full screen">${entryCycleHtml(_modalFrames,"di",e.diagram_stage)}</div>
          <div class="court-info">${courtInfoHtml}</div>
        </div>
        <div class="entry-body">${e.html}</div>
      </div>
      <div class="court-panel">
        <div class="court-panel-label">Court Diagramm</div>
        <div class="court-wrap" onclick="openCourtModal()" title="Full screen">${entryCycleHtml(_modalFrames,"d",e.diagram_stage)}</div>
        <div class="court-info">${courtInfoHtml}</div>
      </div>
    </div>`;
  if(pushState) history.pushState({ slug }, "", "#" + slug);
  document.title = e.title + " • Rally Room";
  const editBtn=document.getElementById("edit-btn");
  if(editBtn) editBtn.href=`../editor/?sport=${SPORT_ID}&slug=${slug}`;
  showView("entry");
  startFrameCycling();
}

function openCourtModal() {
  _modalFrameIdx=0;
  renderModalFrame();
  document.getElementById("court-modal").classList.add("open");
  document.body.style.overflow="hidden";
}
function renderModalFrame() {
  document.getElementById("court-modal-svg").innerHTML=courtSvg(_modalFrames[_modalFrameIdx]||null,"modal",_modalStage);
  const nav=document.getElementById("court-modal-nav");
  if(!nav) return;
  if(_modalFrames.length>1){
    nav.style.display="";
    document.getElementById("frame-nav-counter").textContent=`${_modalFrameIdx+1} / ${_modalFrames.length}`;
  } else {
    nav.style.display="none";
  }
}
function prevModalFrame() {
  if(_modalFrameIdx>0){_modalFrameIdx--;renderModalFrame();}
}
function nextModalFrame() {
  if(_modalFrameIdx<_modalFrames.length-1){_modalFrameIdx++;renderModalFrame();}
}
function closeCourtModal() {
  document.getElementById("court-modal").classList.remove("open");
  document.body.style.overflow="";
}

function showView(name, pushState=false) {
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+name).classList.add("active");
  document.body.classList.toggle("entry-view", name==="entry"||name==="sportabzeichen");
  window.scrollTo(0,0);
  closeSidebar();
  if(pushState && name==="list") { history.pushState(null, "", location.pathname); document.title = SPORT_NAME_LABEL + " • Rally Room"; }
}

function toggleSidebar(){document.body.classList.toggle("sidebar-open")}
function closeSidebar(){document.body.classList.remove("sidebar-open")}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeCourtModal();closeMaterialsModal();closeSidebar();}
  if(document.getElementById("court-modal").classList.contains("open")){
    if(e.key==="ArrowLeft"){e.preventDefault();prevModalFrame();}
    if(e.key==="ArrowRight"){e.preventDefault();nextModalFrame();}
  }
});
{
  let _swipeX=null;
  const _modal=document.getElementById("court-modal");
  _modal.addEventListener("touchstart",e=>{_swipeX=e.touches[0].clientX;},{passive:true});
  _modal.addEventListener("touchend",e=>{
    if(_swipeX===null)return;
    const dx=e.changedTouches[0].clientX-_swipeX;
    _swipeX=null;
    if(Math.abs(dx)<50)return;
    if(dx<0)nextModalFrame();else prevModalFrame();
  },{passive:true});
}

window.addEventListener("popstate", e => {
  if(e.state?.slug) openEntry(e.state.slug, false);
  else if(e.state && "sa" in e.state) showSportabzeichen(e.state.sa||null, false);
  else { history.replaceState(null, "", location.pathname); document.title = SPORT_NAME_LABEL + " • Rally Room"; showView("list"); }
});

document.getElementById("main").addEventListener("click", e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
  const a = e.target.closest("a");
  if (!a) return;
  const href = a.getAttribute("href") || "";
  if (!href.startsWith("#")) return;
  const slug = href.slice(1);
  if (!slug || !allEntries.find(x => x.slug === slug)) return;
  e.preventDefault();
  openEntry(slug);
});

// ── Sportabzeichen ─────────────────────────────────────────────────────────────
let SA=null, _saVariant=null, _saRows=[];
const SA_LOCAL=["localhost","127.0.0.1"].includes(location.hostname); // edit affordance only in local preview
const MEDAL_LABEL={gold:"Gold",silver:"Silber",bronze:"Bronze"};
const MEDAL_COLOR={gold:"#c9a227",silver:"#9fa6ad",bronze:"#b07a48"};

async function loadSportabzeichen() {
  try {
    const r=await fetch("sportabzeichen.json");
    if(!r.ok) return;
    SA=await r.json();
    if(!SA.variants||!SA.variants.length){SA=null;return;}
    const sec=document.getElementById("sportabzeichen-link-section");
    if(sec) sec.style.display="";
  } catch {}
}

function saLSKey(vid){return `rally_sportabzeichen_${SPORT_ID}_${vid||"single"}`;}
function saLoadRows(vid){try{return JSON.parse(localStorage.getItem(saLSKey(vid))||"[]");}catch{return[];}}
function saSaveRows(){try{localStorage.setItem(saLSKey(_saVariant.id),JSON.stringify(_saRows));}catch{}}

function saCols(v){
  const cols=[];
  v.exercises.forEach(e=>e.scores.forEach((s,si)=>cols.push({
    ex:e, key:s.key, max:s.max, colId:e.num+"_"+s.key, first:si===0,
  })));
  return cols;
}
function saRowTotal(row){return Object.values(row.cells||{}).reduce((t,x)=>t+(+x||0),0);}
function saMedal(total,thr){
  if(!thr) return null;
  if(thr.gold!=null && total>=thr.gold) return "gold";
  if(thr.silver!=null && total>=thr.silver) return "silver";
  if(thr.bronze!=null && total>=thr.bronze) return "bronze";
  return null;
}
function medalChip(m){
  if(!m) return `<span class="sa-medal sa-medal-none">–</span>`;
  return `<span class="sa-medal" style="--mc:${MEDAL_COLOR[m]}">● ${MEDAL_LABEL[m]}</span>`;
}

function saOpenCourt(num){
  const e=_saVariant.exercises.find(x=>x.num===num);
  if(!e) return;
  const frames=(e.frames&&e.frames.length)?e.frames:(e.diagram?[e.diagram]:[null]);
  _modalFrames=frames; _modalFrameIdx=0; _modalStage=e.diagram_stage||null;
  openCourtModal();
}

function showSportabzeichen(vid, push=true){
  if(!SA) return;
  if(vid===undefined||vid===null){
    // default to first variant, or a remembered hash target
    vid = SA.variants[0].id;
  }
  const variant = SA.variants.find(v=>String(v.id)===String(vid)) || SA.variants[0];
  _saVariant = variant;
  _saRows = saLoadRows(variant.id);
  renderSportabzeichen(variant);
  showView("sportabzeichen");
  document.title = (SA.title||"Sportabzeichen") + " • " + SPORT_NAME_LABEL;
  if(push){
    const h = "#sportabzeichen" + (variant.id?("-"+variant.id):"");
    history.pushState({sa:variant.id??""}, "", h);
  }
}

function renderSportabzeichen(v){
  const multi = SA.variants.length>1;
  const selector = multi ? `<div class="sa-switch">
      <span class="sa-switch-label">Stufe</span>
      <div class="sa-switch-track">${
        SA.variants.map(x=>`<button class="sa-switch-btn stage-${x.id}${x===v?" active":""}" style="--sc:${x.color}" onclick="showSportabzeichen('${x.id}')">${x.label}</button>`).join("")
      }</div>
    </div>` : "";

  const thr=v.thresholds||{};
  const hasMedals = thr.gold!=null||thr.silver!=null||thr.bronze!=null;
  const legend = `<div class="sa-medals">
      ${hasMedals?["gold","silver","bronze"].filter(k=>thr[k]!=null).map(k=>
        `<div class="sa-medal-card" style="--mc:${MEDAL_COLOR[k]}">
           <span class="sa-medal-dot"></span>
           <span class="sa-medal-name">${MEDAL_LABEL[k]}</span>
           <span class="sa-medal-req">ab <b>${thr[k]}</b></span>
         </div>`).join(""):""}
      <div class="sa-medal-card sa-medal-max">
        <span class="sa-medal-name">Maximal</span>
        <span class="sa-medal-req"><b>${v.maxTotal}</b> Pkt.</span>
      </div>
    </div>`;

  // exercises — rendered like the individual entry detail view
  const exHtml = v.exercises.map((e,i)=>{
    const frames=(e.frames&&e.frames.length)?e.frames:(e.diagram?[e.diagram]:[]);
    const scoreItems=e.scores.map(s=>`<li><span class="sa-score-key">${s.key}</span>${s.max!=null?`<span class="sa-score-max"><b>${s.max}</b> Punkte</span>`:""}</li>`).join("");
    const scores=e.scores.length?`<div class="sa-scores"><span class="sa-scores-label">Maximalpunkte</span><ul class="sa-score-list">${scoreItems}</ul></div>`:"";
    const courtWrap=(sfx)=>`<div class="court-wrap" onclick="saOpenCourt(${e.num})" title="Full screen">${entryCycleHtml(frames,sfx+e.num,e.diagram_stage)}</div>`;
    const inline=frames.length?`<div class="court-inline sa-court-inline">${courtWrap("sai")}</div>`:"";
    const panel=frames.length?`<div class="court-panel sa-court-panel"><div class="court-panel-label">Court Diagramm</div>${courtWrap("sa")}</div>`:"";
    return `<div class="sa-ex${frames.length?"":" sa-ex-nocourt"}" style="--ec:${e.color}">
      <div class="sa-ex-head"><span class="sa-ex-num">${i+1}</span><span class="sa-ex-title">${e.title}</span>${SA_LOCAL?`<a class="sa-ex-edit" href="../editor/?sport=${SPORT_ID}&sa=${e.num}" target="_blank" rel="noopener" title="Lokal bearbeiten">✎ Bearbeiten</a>`:""}</div>
      ${e.summary?`<div class="sa-ex-summary">${e.summary}</div>`:""}
      <div class="entry-layout sa-ex-layout">
        <div>
          ${inline}
          <div class="entry-body">${e.html}</div>
          ${scores}
        </div>
        ${panel}
      </div>
    </div>`;
  }).join("");

  // downloads / links — official sports link out only; others offer generated PDFs
  let actions="";
  if(SA.officialUrl) actions+=`<a class="sa-btn sa-btn-primary sa-btn-ext" href="${SA.officialUrl}" target="_blank" rel="noopener">Zur offiziellen Seite</a>`;
  if(v.scoreSheet) actions+=`<a class="sa-btn" href="${v.scoreSheet}" download>⬇ Prüfkarte (PDF)</a>`;
  if(v.groupScoreSheet) actions+=`<a class="sa-btn" href="${v.groupScoreSheet}" download>⬇ Gruppen-Prüfkarte (PDF)</a>`;
  if(v.certificate) actions+=`<a class="sa-btn" href="${v.certificate}" download>⬇ Urkunde (PDF)</a>`;

  document.getElementById("sportabzeichen-content").innerHTML=`
    <div class="sa-header">
      <h1 class="sa-title">${SA.title||"Sportabzeichen"}</h1>
      ${SA.intro?`<p class="sa-intro">${SA.intro}</p>`:""}
      ${selector}
      ${legend}
    </div>
    <div class="sa-exercises">${exHtml}</div>
    <div class="sa-table-section">
      <div class="sa-table-head">
        <h2 class="sa-subtitle">Teilnehmer*innen${multi?` — ${v.label}`:""}</h2>
        <button class="sa-btn sa-btn-add" onclick="saAddParticipant()">+ Teilnehmer*in</button>
      </div>
      <div class="sa-table-wrap">${saTableHtml(v)}</div>
    </div>
    ${actions?`<div class="sa-actions">${actions}</div>`:""}
  `;
}

function saTableHtml(v){
  const cols=saCols(v);
  const thr=v.thresholds;
  // single header row — key columns grouped by exercise colour + thick separators
  let head=`<th class="sa-th-name">Name</th>`;
  cols.forEach(c=>{head+=`<th class="sa-th-key ${c.first?"sa-th-first":""}" style="--ec:${c.ex.color}" title="${c.ex.title.replace(/"/g,"&quot;")}">${c.key}${c.max!=null?`<span class="sa-th-max">${c.max}</span>`:""}</th>`;});
  head+=`<th class="sa-th-total">Gesamt</th><th class="sa-th-medal">Medaille</th><th class="sa-th-act"></th>`;

  const body = _saRows.map((row,ri)=>{
    const cells=cols.map(c=>{
      const val=(row.cells&&row.cells[c.colId]!=null)?row.cells[c.colId]:"";
      const full=c.max!=null && val!=="" && +val>=c.max;
      return `<td class="sa-td-cell ${c.first?"sa-td-first":""}${full?" sa-cell-full":""}"><input type="number" min="0" ${c.max!=null?`max="${c.max}"`:""} value="${val}" oninput="saCellInput(${ri},'${c.colId}',this)"/></td>`;
    }).join("");
    const total=saRowTotal(row);
    const medal=saMedal(total,thr);
    const totalFull=v.maxTotal>0 && total>=v.maxTotal;
    return `<tr>
      <td class="sa-td-name"><input type="text" placeholder="Name" value="${(row.name||"").replace(/"/g,"&quot;")}" oninput="saNameInput(${ri},this)"/></td>
      ${cells}
      <td class="sa-td-total${totalFull?" sa-total-full":""}">${total}</td>
      <td class="sa-td-medal" id="sa-medal-${ri}">${medalChip(medal)}</td>
      <td class="sa-td-act"><button class="sa-del" onclick="saRemoveParticipant(${ri})" title="Entfernen">✕</button></td>
    </tr>`;
  }).join("");

  const colCount=cols.length+4;
  const empty=_saRows.length?"":`<tr><td class="sa-empty" colspan="${colCount}">Noch keine Teilnehmer*innen. Füge oben welche hinzu.</td></tr>`;

  return `<table class="sa-table"><thead><tr>${head}</tr></thead><tbody>${body}${empty}</tbody></table>`;
}

function saAddParticipant(){
  _saRows.push({name:"",cells:{}});
  saSaveRows();
  document.querySelector(".sa-table-wrap").innerHTML=saTableHtml(_saVariant);
}
function saRemoveParticipant(ri){
  _saRows.splice(ri,1);
  saSaveRows();
  document.querySelector(".sa-table-wrap").innerHTML=saTableHtml(_saVariant);
}
function saNameInput(ri,el){
  if(!_saRows[ri]) return;
  _saRows[ri].name=el.value;
  saSaveRows();
}
function saCellInput(ri,colId,el){
  const row=_saRows[ri]; if(!row) return;
  row.cells=row.cells||{};
  let val=el.value===""?null:Math.max(0,+el.value||0);
  const max=el.max?+el.max:null;
  if(val!=null && max!=null && val>max){val=max; el.value=max;}
  if(val==null) delete row.cells[colId]; else row.cells[colId]=val;
  saSaveRows();
  // live-update this cell's full-points highlight
  const td=el.closest("td");
  if(td) td.classList.toggle("sa-cell-full", max!=null && val!=null && val>=max);
  // live-update total + medal for this row
  const total=saRowTotal(row);
  const tr=el.closest("tr");
  const totalTd=tr.querySelector(".sa-td-total");
  totalTd.textContent=total;
  totalTd.classList.toggle("sa-total-full", _saVariant.maxTotal>0 && total>=_saVariant.maxTotal);
  const cell=document.getElementById("sa-medal-"+ri);
  if(cell) cell.innerHTML=medalChip(saMedal(total,_saVariant.thresholds));
}

// ── Background court lines ─────────────────────────────────────────────────────
(function(){
  const svg=document.getElementById("bg-court-svg");
  if(!svg) return;
  const line=(x1,y1,x2,y2,sw)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="${sw}"/>`;
  const rect=(W,H,sw)=>`<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="white" stroke-width="${sw}"/>`;
  const courts={
    pickleball:(W,H)=>rect(W,H,W*.006)+
      line(0,H*.341,W,H*.341,W*.004)+line(0,H*.659,W,H*.659,W*.004)+
      line(0,H*.5,W,H*.5,W*.007)+line(W*.5,H*.341,W*.5,H*.659,W*.004),
    tennis:(W,H)=>rect(W,H,W*.006)+
      line(W*.125,0,W*.125,H,W*.004)+line(W*.875,0,W*.875,H,W*.004)+
      line(0,H*.5,W,H*.5,W*.008)+
      line(W*.125,H*.269,W*.875,H*.269,W*.004)+line(W*.125,H*.731,W*.875,H*.731,W*.004)+
      line(W*.5,H*.269,W*.5,H*.731,W*.004),
    beachtennis:(W,H)=>rect(W,H,W*.006)+
      line(0,H*.5,W,H*.5,W*.008)+
      line(0,H*.3125,W,H*.3125,W*.004)+line(0,H*.6875,W,H*.6875,W*.004),
    padel:(W,H)=>rect(W,H,W*.006)+
      line(0,H*.5,W,H*.5,W*.008)+
      line(0,H*.15,W,H*.15,W*.004)+line(0,H*.85,W,H*.85,W*.004)+
      line(W*.5,H*.15,W*.5,H*.85,W*.004),
  };
  const draw=courts[SPORT_ID]||courts.tennis;
  svg.innerHTML=[
    `<g transform="translate(50,60) rotate(-9,140,308)" opacity="0.065">${draw(280,616)}</g>`,
    `<g transform="translate(580,-80) rotate(11,90,198)" opacity="0.045">${draw(180,396)}</g>`,
    `<g transform="translate(420,680) rotate(-5,160,352)" opacity="0.038">${draw(320,704)}</g>`,
  ].join("");
})();

// ── Init ───────────────────────────────────────────────────────────────────────
(function buildStageFilter() {
  if(!SPORT_STAGES.length) return;
  const sec=document.getElementById("stage-section");
  const chips=document.getElementById("stage-chips");
  sec.style.display="";
  chips.innerHTML=`<button class="chip active" data-stage="" onclick="setStage('')">Alle</button>`+
    SPORT_STAGES.map(s=>`<button class="chip stage-${s.id}" data-stage="${s.id}" onclick="setStage('${s.id}')" style="--sc:${s.color}">${s.label}</button>`).join("");
})();

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const r=await fetch("data.json");
    if(!r.ok) throw new Error();
    allEntries=await r.json();
    loadFavs();
    loadFilters();
    buildSkillsList();
    buildMaterialsList();
    applyFilterStateToUI();
    updateFavSection();
    filterEntries();
    await loadSportabzeichen();
    const hash=location.hash.slice(1);
    if(hash && allEntries.find(e=>e.slug===hash)) openEntry(hash);
    else if(hash.startsWith("sportabzeichen") && SA){
      const vid=hash.slice("sportabzeichen".length).replace(/^-/,"");
      showSportabzeichen(vid||null, false);
    }
    else if(hash) history.replaceState(null, "", location.pathname);
  } catch {
    document.getElementById("entry-grid").innerHTML=`<div class="empty">⚠ data.json not found — run: node build.js</div>`;
  }
});
