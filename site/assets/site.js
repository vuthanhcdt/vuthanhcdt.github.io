/* RASL site — shared behaviour for every page */
(() => {
const PUBS = window.PUBS || [];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* ---------- language: pages under /vi/ are Vietnamese ---------- */
const VI = document.documentElement.lang === "vi";
const t = (en, vi) => VI ? vi : en;
const CAT = {Journal: t("Journal", "Tạp chí"), Conference: t("Conference", "Hội nghị"), Preprint: t("Preprint", "Bản thảo")};
/* remember the visitor's choice and keep them on it */
document.querySelectorAll(".lang-sw a[data-lang]").forEach(a => a.addEventListener("click", () => {
  try { localStorage.setItem("lang", a.dataset.lang); } catch(e){}
}));
try {
  const want = localStorage.getItem("lang"), sw = document.querySelector(`.lang-sw a[data-lang="${want}"]:not(.on)`);
  if (want && sw && !sessionStorage.getItem("langHop")){ sessionStorage.setItem("langHop", "1"); location.replace(sw.href + location.search + location.hash); }
} catch(e){}
const $ = id => document.getElementById(id);

/* ---------- publication card ---------- */
function pubCard(p, i, opts = {}){
  const title = p.u ? `<a class="t" href="${esc(p.u)}" target="_blank" rel="noopener">${esc(p.t)}</a>` : `<span class="t">${esc(p.t)}</span>`;
  const links = opts.compact ? "" : [
    p.u ? `<a class="chip" href="${esc(p.u)}" target="_blank" rel="noopener">${t("Paper", "Bài báo")}</a>` : "",
    p.ax ? `<a class="chip ax" href="https://arxiv.org/abs/${esc(p.ax)}" target="_blank" rel="noopener">arXiv</a>` : "",
    p.b ? `<button class="chip" type="button" data-bib="${i}" aria-expanded="false">BibTeX</button>` : ""
  ].join("");
  const fig = p.f && !opts.compact;
  return `<article class="pub${fig ? " fig" : ""}">
    <div class="venue ${p.c}">${esc(p.s)}<small>${CAT[p.c] || p.c}</small></div>
    ${fig ? `<figure><img src="${esc(p.f)}" alt=""></figure>` : ""}
    <div>${title}
      <div class="a">${esc(p.a).replace("Cong-Thanh Vu", "<b>Cong-Thanh Vu</b>")}</div>
      <div class="v">${esc(p.v)}${p.i ? ", " + esc(p.i) : ""}</div>
      ${links ? `<div class="pub-links">${links}</div>` : ""}
      ${p.b && !opts.compact ? `<div class="bibbox" id="bib${i}"><pre class="bib">${esc(p.b)}</pre><button class="chip copy" type="button" data-copy="${i}">${t("Copy BibTeX", "Sao chép BibTeX")}</button></div>` : ""}
    </div></article>`;
}

/* ---------- publications page ---------- */
const list = $("pubList");
if (list){
  let filter = "all", query = "";
  const params = new URLSearchParams(location.search);
  if (params.get("q")){ query = params.get("q"); $("q").value = query; }
  const render = () => {
    const q = query.trim().toLowerCase();
    const shown = PUBS.map((p, i) => [p, i]).filter(([p]) => (filter === "all" || p.c === filter) &&
      (!q || [p.t, p.a, p.v, p.s, p.y].join(" ").toLowerCase().includes(q)));
    $("count").textContent = t(`${shown.length} of ${PUBS.length}`, `${shown.length}/${PUBS.length} bài báo`);
    let html = "", year = null;
    shown.forEach(([p, i]) => {
      if (p.y !== year){ year = p.y; html += `<div class="year">${year}</div>`; }
      html += pubCard(p, i);
    });
    list.innerHTML = html || `<div class="empty">${t("No publications match", "Không có bài báo nào khớp với")} “${esc(query)}”.</div>`;
  };
  list.addEventListener("click", e => {
    const b = e.target.closest("[data-bib]"), c = e.target.closest("[data-copy]");
    if (b) b.setAttribute("aria-expanded", $("bib" + b.dataset.bib).classList.toggle("open"));
    if (c) navigator.clipboard?.writeText(PUBS[+c.dataset.copy].b).then(() => {
      c.textContent = t("Copied ✓", "Đã sao chép ✓"); setTimeout(() => c.textContent = t("Copy BibTeX", "Sao chép BibTeX"), 1400);
    }).catch(() => {});
  });
  document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b));
    filter = b.dataset.f; render();
  }));
  $("q").addEventListener("input", e => { query = e.target.value; render(); });
  /* example chips under the search box fill it in (click again to clear) */
  document.querySelectorAll("#qhint [data-q]").forEach(b => b.addEventListener("click", () => {
    const q = $("q"), on = q.value === b.dataset.q;
    q.value = on ? "" : b.dataset.q; query = q.value; render();
    document.querySelectorAll("#qhint [data-q]").forEach(x => x.classList.toggle("on", !on && x === b));
  }));
  $("q").addEventListener("input", () => document.querySelectorAll("#qhint [data-q]").forEach(x => x.classList.toggle("on", x.dataset.q === $("q").value)));
  render();
}

/* ---------- home: featured papers ---------- */
const featured = $("featured");
if (featured) featured.innerHTML = PUBS.filter(p => p.c !== "Preprint").slice(0, 4).map(p =>
  `<a class="prow" href="${esc(p.u)}" target="_blank" rel="noopener">
     <span class="ptag ${p.c}">${esc(p.s)} ${esc(p.y)}</span>
     <b>${esc(p.t)}</b>
     <small>${esc(p.a).replace("Cong-Thanh Vu", "<u>Cong-Thanh Vu</u>")}</small>
   </a>`).join("");

/* ---------- research: related papers per area ---------- */
document.querySelectorAll("[data-papers]").forEach(el => {
  const ids = el.dataset.papers.split(",").map(Number);
  el.innerHTML = ids.map(i => PUBS[i]).filter(Boolean).map(p =>
    `<li><span class="mini ${p.c}">${esc(p.s)} ${esc(p.y)}</span>${p.u ? `<a href="${esc(p.u)}" target="_blank" rel="noopener">${esc(p.t)}</a>` : esc(p.t)}</li>`).join("");
});

/* ---------- stats ---------- */
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
/* numbers tick up from 0 once the stats bar is on screen */
const countUp = (el, n, delay) => {
  if (still){ el.textContent = n; return; }
  setTimeout(() => {
    const t0 = performance.now(), dur = 2000;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step); else el.classList.add("pop");
    };
    requestAnimationFrame(step);
  }, delay);
};
const statsBar = document.querySelector(".stats");
if (statsBar){
  const run = () => {
    countUp($("sPubs"), PUBS.filter(p => p.c !== "Preprint").length, 300);
    countUp($("sJour"), PUBS.filter(p => p.c === "Journal").length, 450);
    countUp($("sConf"), PUBS.filter(p => p.c === "Conference").length, 600);
  };
  const so = new IntersectionObserver(es => { if (es[0].isIntersecting){ so.disconnect(); run(); } });
  so.observe(statsBar);
}

/* director card stats follow the publication data */
if ($("dPubs")){
  $("dPubs").textContent = PUBS.filter(p => p.c !== "Preprint").length;
  $("dJour").textContent = PUBS.filter(p => p.c === "Journal").length;
  $("dConf").textContent = PUBS.filter(p => p.c === "Conference").length;
  $("dJourBar").style.setProperty("--n", $("dJour").textContent);   // bar segments in proportion
  $("dConfBar").style.setProperty("--n", $("dConf").textContent);
}

/* ---------- cursor spotlight on cards ---------- */
document.querySelectorAll(".card, .spot, .lead-card, .dir, .dcard").forEach(el => el.addEventListener("pointermove", e => {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", (e.clientX - r.left) + "px");
  el.style.setProperty("--my", (e.clientY - r.top) + "px");
}));

/* ---------- nav ---------- */
const nav = $("nav"), links = $("links"), menuBtn = $("menuBtn");
const onScroll = () => nav.classList.toggle("solid", scrollY > 40 || links.classList.contains("open"));
addEventListener("scroll", onScroll, {passive:true}); onScroll();
menuBtn.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open); onScroll();
});

/* ---------- site-wide search (⌘K / Ctrl K / "/") ---------- */
const GROUP = {Publication: t("Publications", "Công bố khoa học"), News: t("News", "Tin tức"), Research: t("Research", "Nghiên cứu"), People: t("People", "Thành viên"), Page: t("Pages", "Trang")};
const TYPE = {Publication: t("Publication", "Bài báo"), News: t("News", "Tin tức"), Research: t("Research", "Nghiên cứu"), People: t("People", "Thành viên"), Page: t("Page", "Trang")};
const DOCS = [
  ...PUBS.map(p => ({type:"Publication", title:p.t, text:p.a, meta:`${p.s} ${p.y} · ${CAT[p.c] || p.c}`, extra:`${p.v} ${p.i} ${p.doi} ${p.ax}`,
    url:`publications.html?q=${encodeURIComponent(p.t)}`})),
  ...(window.SEARCH_INDEX || [])
];
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const ALIAS = [["national cheng kung university","ncku"],["hanoi university of industry","haui"],["reinforcement learning","rl drl"],["vision–language","vlm vla vision-language"],["human–robot","hri human-robot"]];
DOCS.forEach(d => {
  d._t = norm(d.title);
  d._all = norm([d.title, d.text, d.meta, d.type, d.extra || ""].join(" "));
  ALIAS.forEach(([long, short]) => { if (d._all.includes(long)) d._all += " " + short; });
});

const modal = document.createElement("div");
modal.className = "sk"; modal.hidden = true;
modal.innerHTML = `<div class="sk-back" data-close></div>
  <div class="sk-panel" role="dialog" aria-modal="true" aria-label="Search">
    <div class="sk-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="skq" type="search" placeholder="${t("Search papers, authors, venues, news, awards…", "Tìm bài báo, tác giả, hội nghị, tin tức, giải thưởng…")}" autocomplete="off" aria-label="${t("Search the site", "Tìm kiếm trên trang")}" aria-controls="skr">
      <button type="button" class="sk-esc" data-close>Esc</button>
    </div>
    <div class="sk-res" id="skr" role="listbox"></div>
    <div class="sk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> ${t("navigate", "di chuyển")}</span><span><kbd>↵</kbd> ${t("open", "mở")}</span><span><kbd>esc</kbd> ${t("close", "đóng")}</span></div>
  </div>`;
document.body.appendChild(modal);
const skq = modal.querySelector("#skq"), skr = modal.querySelector("#skr");
let hits = [], sel = 0, lastFocus = null;

const hl = (s, terms) => {
  let out = esc(s);
  terms.forEach(t => { if (t.length > 1) out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark>$1</mark>"); });
  return out;
};
const ORDER = ["Publication", "News", "Research", "People", "Page"];
function search(){
  const q = norm(skq.value.trim()), terms = q.split(/\s+/).filter(Boolean);
  if (!terms.length){
    hits = DOCS.filter(d => d.type === "Page" || d.type === "News").slice(0, 8);
  } else {
    hits = DOCS.map(d => {
      if (!terms.every(t => d._all.includes(t))) return null;
      let score = 0; terms.forEach(t => { if (d._t.includes(t)) score += 3; if (d._t.startsWith(t)) score += 2; });
      return [score, d];
    }).filter(Boolean).sort((a, b) => b[0] - a[0] || ORDER.indexOf(a[1].type) - ORDER.indexOf(b[1].type)).map(x => x[1]).slice(0, 30);
  }
  sel = 0; draw(terms);
}
function draw(terms){
  if (!hits.length){ skr.innerHTML = `<div class="sk-empty">${t("No results for", "Không tìm thấy kết quả cho")} “${esc(skq.value)}”</div>`; return; }
  let html = "", group = null;
  const groups = terms.length ? [...hits].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type)) : hits;
  hits = groups;
  hits.forEach((d, i) => {
    if (d.type !== group){ group = d.type; html += `<div class="sk-group">${terms.length ? GROUP[group] || group : t("Suggested", "Gợi ý")}</div>`; if (!terms.length) group = "_"; }
    html += `<a class="sk-item${i === sel ? " on" : ""}" role="option" aria-selected="${i === sel}" href="${esc(d.url)}" data-i="${i}">
      <span class="sk-type ${d.type}">${TYPE[d.type] || d.type}</span>
      <span class="sk-main"><b>${hl(d.title, terms)}</b><small>${hl(d.text, terms)}</small></span>
      <span class="sk-meta">${esc(d.meta)}</span></a>`;
  });
  skr.innerHTML = html;
}
const move = k => {
  if (!hits.length) return;
  sel = (sel + k + hits.length) % hits.length;
  skr.querySelectorAll(".sk-item").forEach((el, i) => { el.classList.toggle("on", i === sel); el.setAttribute("aria-selected", i === sel); });
  skr.querySelector(".sk-item.on")?.scrollIntoView({block:"nearest"});
};
function openSearch(){
  lastFocus = document.activeElement; modal.hidden = false; document.documentElement.classList.add("sk-open");
  requestAnimationFrame(() => modal.classList.add("show")); skq.value = ""; search(); skq.focus();
}
function closeSearch(){
  modal.classList.remove("show"); document.documentElement.classList.remove("sk-open");
  setTimeout(() => { modal.hidden = true; }, 160); lastFocus?.focus?.();
}
$("searchBtn").addEventListener("click", openSearch);
skq.addEventListener("input", search);
modal.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeSearch(); });
skr.addEventListener("mousemove", e => { const a = e.target.closest(".sk-item"); if (a && +a.dataset.i !== sel){ sel = +a.dataset.i; move(0); } });
addEventListener("keydown", e => {
  const typing = /input|textarea/i.test(document.activeElement?.tagName) && document.activeElement !== skq;
  const isK = e.code === "KeyK" || (e.key || "").toLowerCase() === "k";   // works with Caps Lock and Vietnamese IMEs
  if ((isK && (e.metaKey || e.ctrlKey) && !e.altKey) || (e.key === "/" && !typing && modal.hidden)){ e.preventDefault(); modal.hidden ? openSearch() : closeSearch(); return; }
  if (modal.hidden) return;
  if (e.key === "Escape"){ e.preventDefault(); closeSearch(); }
  else if (e.key === "ArrowDown"){ e.preventDefault(); move(1); }
  else if (e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
  else if (e.key === "Enter" && hits[sel]){ e.preventDefault(); location.href = hits[sel].url; }
});
/* show the right shortcut: ⌘K on Apple devices, Ctrl K on Windows / Linux */
const isApple = /mac|iphone|ipad|ipod/i.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);
document.querySelectorAll(".search-btn kbd").forEach(k => k.textContent = isApple ? "⌘K" : "Ctrl K");
$("searchBtn").title = t(`Search (${isApple ? "⌘K" : "Ctrl+K"} or /)`, `Tìm kiếm (${isApple ? "⌘K" : "Ctrl+K"} hoặc /)`);

/* arriving from search on the news page: flash the matching item */
if (location.hash.startsWith("#news-")) document.querySelector(location.hash)?.classList.add("in", "flash");

/* ---------- theme ---------- */
const root = document.documentElement;
$("themeBtn").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch(e){}
});

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
}), {rootMargin:"0px 0px -8% 0px"});
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ---------- hero network animation (reacts to the cursor) ---------- */
const cv = $("net");
if (cv){
  const ctx = cv.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const host = cv.parentElement;
  const mouse = {x:-9999, y:-9999, on:false};
  const R = 170;
  let W, H, pts = [], running = false;
  const size = () => {
    W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const n = Math.round(Math.min(90, W * H / 13000));
    pts = Array.from({length:n}, () => ({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, r:Math.random()*1.8+1}));
  };
  const frame = () => {
    ctx.clearRect(0,0,W,H);
    for (const p of pts){
      if (mouse.on){                         // nodes drift away from the cursor
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < R && d > 0){ const f = (1 - d / R) * .6; p.x += dx / d * f; p.y += dy / d * f; }
      }
      if (!still){ p.x += p.vx; p.y += p.vy; }
      if (p.x<0||p.x>W) p.vx*=-1; if (p.y<0||p.y>H) p.vy*=-1;
    }
    for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++){
      const a=pts[i], b=pts[j], d=Math.hypot(a.x-b.x, a.y-b.y);
      if (d<140){ ctx.strokeStyle=`rgba(120,180,255,${(1-d/140)*.35})`; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
    }
    if (mouse.on){                           // links from the cursor to nearby nodes
      for (const p of pts){
        const d = Math.hypot(p.x-mouse.x, p.y-mouse.y);
        if (d < R*1.4){ ctx.strokeStyle=`rgba(62,224,208,${(1-d/(R*1.4))*.8})`; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(mouse.x,mouse.y); ctx.lineTo(p.x,p.y); ctx.stroke(); }
      }
      ctx.fillStyle="rgba(62,224,208,.95)"; ctx.beginPath(); ctx.arc(mouse.x,mouse.y,3.2,0,Math.PI*2); ctx.fill();
    }
    for (const p of pts){
      const near = mouse.on && Math.hypot(p.x-mouse.x, p.y-mouse.y) < R*1.4;
      ctx.fillStyle = near ? "rgba(140,245,235,1)" : "rgba(150,200,255,.9)";
      ctx.beginPath(); ctx.arc(p.x,p.y,near ? p.r+1 : p.r,0,Math.PI*2); ctx.fill();
    }
    running = !still || mouse.on;
    if (running) requestAnimationFrame(frame);
  };
  host.addEventListener("pointermove", e => {
    const r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    mouse.on = e.pointerType === "mouse";
    host.style.setProperty("--gx", mouse.x + "px"); host.style.setProperty("--gy", mouse.y + "px");
    host.style.setProperty("--px", ((mouse.x / r.width - .5) * 2).toFixed(3));
    host.style.setProperty("--py", ((mouse.y / r.height - .5) * 2).toFixed(3));
    if (!running && mouse.on) frame();
  });
  host.addEventListener("pointerleave", () => {
    mouse.on = false; host.style.setProperty("--px", 0); host.style.setProperty("--py", 0);
  });
  size(); frame(); addEventListener("resize", () => { size(); if (!running) frame(); });
}

$("yr").textContent = new Date().getFullYear();
})();
