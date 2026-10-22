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
  const tt = opts.hl ? opts.hl(p.t) : esc(p.t);
  const title = p.u ? `<a class="t" href="${esc(p.u)}" target="_blank" rel="noopener">${tt}</a>` : `<span class="t">${tt}</span>`;
  const links = opts.compact ? "" : [
    p.u ? `<a class="chip" href="${esc(p.u)}" target="_blank" rel="noopener">${t("Paper", "Bài báo")}</a>` : "",
    p.ax ? `<a class="chip ax" href="https://arxiv.org/abs/${esc(p.ax)}" target="_blank" rel="noopener">arXiv</a>` : "",
    p.b ? `<button class="chip" type="button" data-bib="${i}" aria-expanded="false">BibTeX</button>` : ""
  ].join("");
  const fig = p.f && !opts.compact;
  return `<article class="pub${fig ? " fig" : ""}" data-key="${esc((p.s + "-" + p.y).toLowerCase())}">
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
  /* smarter search: every query word must match (any order); word forms count (agriculture ≈ agricultural),
     related topics and abbreviations expand, Vietnamese works without accents; matches are highlighted in titles */
  const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase()
    .replace(/[\u2010-\u2015\-\/:,.;()'"“”’]+/g, " ").replace(/\s+/g, " ").trim();
  const VI_EN = [["robot dong hanh", "companion robot"], ["nong nghiep", "agricultural"], ["dong hanh", "companion"], ["dieu huong", "navigation"],
    ["di theo nguoi", "human following"], ["theo nguoi", "human following"], ["di theo nhom", "group following"], ["hoc tang cuong", "reinforcement learning"],
    ["nguoi cao tuoi", "elderly"], ["hinh nguoi", "humanoid"], ["tranh vat can", "obstacle avoidance"], ["thi giac", "vision"], ["ngon ngu", "language"],
    ["di bo", "walking"], ["phun thuoc", "spraying"], ["hoc lien tuc", "continual learning"]];
  const ABBR = {rl: "reinforcement learning", drl: "deep reinforcement learning", vlm: "vision language model", llm: "language model",
    lmm: "multimodal language model", hri: "human robot interaction", agv: "guided vehicle"};
  const GROUPS = [["agricult", "orchard", "farm", "crop", "pesticide", "spray"], ["companion", "service robot", "elderly"],
    ["navig", "path plann", "obstacle avoid"], ["humanoid", "legged", "walk"], ["follow", "track"]];
  const SUF = ["ational", "ation", "ments", "ment", "ings", "ing", "ural", "ure", "ally", "al", "ies", "es", "ed", "s"];
  const stem = w => { for (const s of SUF) if (w.length - s.length >= 4 && w.endsWith(s)) return w.slice(0, -s.length); return w; };
  const parse = q => {
    q = " " + norm(q) + " ";
    VI_EN.forEach(([vi, en]) => { q = q.split(" " + vi + " ").join(" " + en + " "); });
    return q.trim().split(" ").filter(Boolean).flatMap(w => (ABBR[w] || w).split(" ")).map(w => {
      const s = stem(w), g = GROUPS.find(g => g.some(x => !x.includes(" ") && s.startsWith(x)));
      return g ? [s, ...g] : [s];                             // alternatives for this word
    });
  };
  const DOCS = PUBS.map(p => { const t = norm([p.t, p.a, p.v, p.s, p.y].join(" ")); return {t, w: t.split(" ")}; });
  const hit = (d, alts) => alts.some(a => a.includes(" ") ? d.t.includes(a) : d.w.some(w => w.startsWith(a)));
  let words = [];
  const hl = text => esc(text).replace(/[A-Za-z0-9]+/g, w => {
    const n = norm(w); return words.flat().some(a => !a.includes(" ") && n.startsWith(a)) ? `<mark>${w}</mark>` : w;
  });
  const render = () => {
    words = parse(query);
    const shown = PUBS.map((p, i) => [p, i]).filter(([p, i]) => (filter === "all" || p.c === filter) &&
      words.every(alts => hit(DOCS[i], alts)));
    $("count").textContent = t(`${shown.length} of ${PUBS.length}`, `${shown.length}/${PUBS.length} bài báo`);
    let html = "", year = null;
    shown.forEach(([p, i]) => {
      if (p.y !== year){ year = p.y; html += `<div class="year">${year}</div>`; }
      html += pubCard(p, i, words.length ? {hl} : {});
    });
    list.innerHTML = html || `<div class="empty">${t("No publications match", "Không có bài báo nào khớp với")} “${esc(query)}”.</div>`;
    suggest(shown.map(([, i]) => i));
  };
  /* suggestions under the search box: topics that also appear in the papers found, or a spelling fix when nothing matches */
  const TOPICS = ["companion robot", "human-following", "group following", "elderly care", "service robot", "tracking", "agricultural",
    "orchard", "pesticide spraying", "navigation", "obstacle avoidance", "path planning", "reinforcement learning", "continual learning",
    "vision–language", "multimodal language model", "humanoid", "walking", "multi-robot", "fuzzy logic"];
  const VOCAB = [...new Set(DOCS.flatMap(d => d.w).filter(w => w.length >= 4 && !/\d/.test(w)))];
  const dist = (a, b) => { const d = Array.from({length: b.length + 1}, (_, i) => i);
    for (let i = 1; i <= a.length; i++){ let p = d[0]; d[0] = i;
      for (let k = 1; k <= b.length; k++){ const tmp = d[k]; d[k] = Math.min(d[k] + 1, d[k - 1] + 1, p + (a[i - 1] === b[k - 1] ? 0 : 1)); p = tmp; } }
    return d[b.length]; };
  const relBox = $("qrel");
  const suggest = found => {
    const q = query.trim();
    if (!relBox) return;
    if (!q){ relBox.hidden = true; return; }
    let label, items = [];
    if (found.length){
      const qa = words.flat();
      items = TOPICS.filter(tp => !parse(tp).every(alts => alts.some(a => qa.includes(a))))          // not what was searched
        .map(tp => [tp, found.filter(i => parse(tp).every(alts => hit(DOCS[i], alts))).length])
        .filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tp]) => tp);
      label = t("Related:", "Liên quan:");
    } else {
      const fix = norm(q).split(" ").map(w => { if (w.length < 4 || VOCAB.includes(w)) return w;
        let best = w, bd = Math.max(2, Math.floor(w.length / 3)) + 1;
        VOCAB.forEach(v => { const d = dist(w, v); if (d < bd){ bd = d; best = v; } }); return best; }).join(" ");
      if (fix !== norm(q)) items = [fix];
      label = t("Did you mean:", "Có phải bạn muốn tìm:");
    }
    relBox.hidden = !items.length;
    relBox.innerHTML = items.length ? `<span>${label}</span>` + items.map(x => `<button type="button" data-q="${esc(x)}">${esc(x)}</button>`).join("") : "";
  };
  relBox?.addEventListener("click", e => {
    const b = e.target.closest("[data-q]"); if (!b) return;
    $("q").value = b.dataset.q; $("q").dispatchEvent(new Event("input"));
  });
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

  /* publications.html#p=tsmc-2026[,aim-2026] (from News): show everything, scroll to those papers and highlight them */
  const showLinked = () => {
    const m = location.hash.match(/^#p=([\w,-]+)/); if (!m) return;
    const keys = m[1].split(",");
    if (filter !== "all") document.querySelector('.seg button[data-f="all"]')?.click();
    if (query){ $("q").value = ""; $("q").dispatchEvent(new Event("input")); }
    const cards = [...list.querySelectorAll(".pub")].filter(c => keys.includes(c.dataset.key));
    if (!cards.length) return;
    cards[0].scrollIntoView({behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block: "center"});
    cards.forEach(c => { c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); });
  };
  setTimeout(showLinked, 350); addEventListener("hashchange", showLinked);

  /* papers per year: one column per year (journals at the bottom, conferences on top, one smooth gradient).
     Hover a part to see its count; click it to list that year's journals or conferences; click the year for all of it. */
  const chart = $("yrChart");
  if (chart){
    const by = {};
    PUBS.filter(p => p.c !== "Preprint").forEach(p => { const y = by[p.y] ||= {j: 0, c: 0}; p.c === "Journal" ? y.j++ : y.c++; });
    const years = Object.keys(by).sort(), max = Math.max(...years.map(y => by[y].j + by[y].c));
    const part = (y, type, n) => n ? `<i data-y="${y}" data-t="${type}" style="--k:${n}" title="${y}: ${n} ${type === "Journal" ? t(n > 1 ? "journal articles" : "journal article", "bài tạp chí") : t(n > 1 ? "conference papers" : "conference paper", "bài hội nghị")}"></i>` : "";
    chart.innerHTML = years.map(y => { const {j, c} = by[y], n = j + c;
      return `<div class="yr" data-y="${y}" style="--h:${(n / max).toFixed(3)};--jp:${Math.round(100 * j / n)}">
        <span class="n">${n}</span><span class="col">${part(y, "Journal", j)}${part(y, "Conference", c)}</span>
        <button type="button" class="y" data-y="${y}">${y}</button></div>`; }).join("");
    const setType = f => document.querySelector(`.seg button[data-f="${f}"]`)?.click();
    const mark = () => {
      const q = $("q").value.trim();
      chart.querySelectorAll(".yr").forEach(b => b.classList.toggle("on", b.dataset.y === q && filter === "all"));
      chart.querySelectorAll(".col i").forEach(i => i.classList.toggle("on", i.dataset.y === q && i.dataset.t === filter));
    };
    chart.addEventListener("click", e => {
      const seg = e.target.closest(".col i"), yr = e.target.closest(".yr"); if (!yr) return;
      const y = yr.dataset.y, type = seg ? seg.dataset.t : "all", q = $("q");
      const again = q.value.trim() === y && filter === type;      // same choice twice = clear
      setType(again ? "all" : type);
      q.value = again ? "" : y; q.dispatchEvent(new Event("input"));
      picked = again ? null : {y, type};
    });
    /* a click on empty space outside the chart clears the chart's choice (clicks in the list, search or filters keep it) */
    let picked = null;
    document.addEventListener("click", e => {
      if (!picked || e.target.closest("#yrChart, .toolbar, #pubList, #qhint, #qrel, .nav, .ap-fab, .ap-hint, .ap-modal")) return;
      if ($("q").value.trim() === picked.y && filter === picked.type){
        setType("all"); $("q").value = ""; $("q").dispatchEvent(new Event("input"));
      }
      picked = null;
    });
    $("q").addEventListener("input", mark);
    document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", mark));
    mark();
  }
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

/* paper stats cards (People, Publications) follow the publication data */
if (document.querySelector(".pstat") && window.PUBS){
  const n = {total: PUBS.filter(p => p.c !== "Preprint").length,
             j: PUBS.filter(p => p.c === "Journal").length,
             c: PUBS.filter(p => p.c === "Conference").length};
  document.querySelectorAll(".pstat [data-n]").forEach(el => { el.textContent = n[el.dataset.n]; });
  document.querySelectorAll(".pstat [data-bar]").forEach(el => el.style.setProperty("--n", n[el.dataset.bar]));

  /* the journal / conference bar and its legend are interactive: hover shows the count; on Publications a click filters
     the list by type (click again or on empty space to clear); elsewhere it opens Publications with that filter */
  const TYPE = {j: "Journal", c: "Conference"}, onPubs = !!$("pubList");
  const key = el => el.dataset.bar || (el.classList.contains("j") ? "j" : "c");
  const seg = f => document.querySelector(`.seg button[data-f="${f}"]`);
  const current = () => document.querySelector('.seg button[aria-pressed="true"]')?.dataset.f || "all";
  const parts = [...document.querySelectorAll(".pstat [data-bar], .pstat-legend > div")];
  const markType = () => { const f = onPubs ? current() : "all";
    document.querySelectorAll(".pstat").forEach(c => c.classList.toggle("has-type", f !== "all"));
    parts.forEach(el => el.classList.toggle("on", TYPE[key(el)] === f)); };
  let typePicked = false;
  parts.forEach(el => {
    const k = key(el);
    el.title = k === "j" ? t(`${n.j} journal articles`, `${n.j} bài tạp chí`) : t(`${n.c} conference papers`, `${n.c} bài hội nghị`);
    if (!el.dataset.bar){ el.setAttribute("role", "button"); el.tabIndex = 0; }
    const go = () => {
      if (!onPubs){ location.href = "publications.html?type=" + TYPE[k]; return; }
      const again = current() === TYPE[k]; seg(again ? "all" : TYPE[k]).click(); typePicked = !again; markType();
    };
    el.addEventListener("click", go);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); go(); } });
  });
  if (onPubs){
    document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", markType));
    document.addEventListener("click", e => {
      if (!typePicked || e.target.closest(".pstat-bar, .pstat-legend, .toolbar, #pubList, #qhint, #qrel, #yrChart, .nav, .ap-fab, .ap-hint, .ap-modal")) return;
      typePicked = false; if (current() !== "all") seg("all").click();
    });
    const tp = new URLSearchParams(location.search).get("type");      // ?type=Journal|Conference from the People page
    if (tp === TYPE.j || tp === TYPE.c){                              // behaves like a choice made on the bar here:
      seg(tp).click(); typePicked = true;                               // a click on empty space clears it
      history.replaceState(null, "", location.pathname + location.hash); // and a reload shows everything again
    }
    markType();
  }
}

/* ---------- cursor spotlight on cards ---------- */
document.querySelectorAll(".card, .spot, .lead-card, .dir, .dcard").forEach(el => el.addEventListener("pointermove", e => {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", (e.clientX - r.left) + "px");
  el.style.setProperty("--my", (e.clientY - r.top) + "px");
}));

/* ---------- nav ---------- */
const nav = $("nav"), links = $("links"), menuBtn = $("menuBtn");
const onScroll = () => {
  nav.classList.toggle("solid", scrollY > 40 || links.classList.contains("open"));
  const max = document.documentElement.scrollHeight - innerHeight;                 // reading progress line
  nav.style.setProperty("--prog", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
};
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
    html += `<a class="sk-item${i === sel ? " on" : ""}" role="option" aria-selected="${i === sel}" href="${esc(d.url)}" data-i="${i}" style="--i:${i}">
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
/* the panel grows out of the Search button (or drops from the top when opened with ⌘K / Ctrl K), the backdrop
   fades and blurs in, the first results cascade in; closing shrinks it back. Driven by the Web Animations API so it
   also plays on the very first frame after the overlay is un-hidden. */
let skT, skAnim = [];
const calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
function openSearch(e){
  clearTimeout(skT); skAnim.forEach(a => a.cancel()); skAnim = [];
  lastFocus = document.activeElement; modal.hidden = false; modal.classList.add("show"); document.documentElement.classList.add("sk-open");
  const panel = modal.querySelector(".sk-panel"), back = modal.querySelector(".sk-back"), btn = $("searchBtn");
  if (e && e.type === "click" && btn.offsetParent){
    const b = btn.getBoundingClientRect();
    panel.style.transformOrigin = `${b.left + b.width / 2 - panel.offsetLeft}px ${b.top + b.height / 2 - panel.offsetTop}px`;
  } else panel.style.transformOrigin = "50% -40px";
  skq.value = ""; search();
  if (!calm){
    modal.classList.add("sk-cascade"); skT = setTimeout(() => modal.classList.remove("sk-cascade"), 900);
    skAnim = [
      panel.animate([{transform: "scale(.3)", opacity: 0, filter: "blur(8px)"}, {transform: "scale(1.015)", opacity: 1, filter: "blur(0)", offset: .7}, {transform: "none", opacity: 1, filter: "blur(0)"}],
                    {duration: 520, easing: "cubic-bezier(.2,.8,.2,1)"}),
      back.animate([{opacity: 0, backdropFilter: "blur(0px)"}, {opacity: 1, backdropFilter: "blur(8px)"}], {duration: 320, easing: "ease-out"})
    ];
  }
  skq.focus({preventScroll: true});
}
function closeSearch(){
  clearTimeout(skT); skAnim.forEach(a => a.cancel());
  document.documentElement.classList.remove("sk-open"); modal.classList.remove("sk-cascade"); lastFocus?.focus?.();
  const done = () => { modal.hidden = true; modal.classList.remove("show"); skAnim = []; };
  if (calm){ done(); return; }
  const panel = modal.querySelector(".sk-panel"), back = modal.querySelector(".sk-back");
  skAnim = [
    panel.animate([{transform: "none", opacity: 1}, {transform: "scale(.35)", opacity: 0, filter: "blur(6px)"}], {duration: 240, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards"}),
    back.animate([{opacity: 1}, {opacity: 0}], {duration: 220, easing: "ease-in", fill: "forwards"})
  ];
  skAnim[0].onfinish = () => { skAnim.forEach(a => a.cancel()); done(); };
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

/* ---------- menu: sliding highlight under the hovered / current item (desktop only) ---------- */
(() => {
  const ul = document.getElementById("links");
  if (!ul || !matchMedia("(min-width:821px)").matches) return;
  const ind = document.createElement("span"); ind.className = "nav-ind"; ind.setAttribute("aria-hidden", "true");
  ul.prepend(ind); ul.classList.add("has-ind");
  const items = [...ul.querySelectorAll("a")];
  const move = a => {
    if (!a) { ind.style.opacity = 0; return; }
    ind.style.width = a.offsetWidth + "px";
    ind.style.transform = `translateX(${a.offsetLeft}px)`;
    ind.style.opacity = 1;
  };
  const home = () => move(ul.querySelector("a.active"));
  items.forEach(a => a.addEventListener("pointerenter", () => move(a)));
  ul.addEventListener("pointerleave", home);
  addEventListener("resize", home);
  ind.style.transition = "none"; home(); ind.offsetWidth; ind.style.transition = "";   // start in place, no slide on load
})();

/* ---------- magnetic buttons: lean a little towards the mouse ---------- */
(() => {
  if (!matchMedia("(pointer:fine)").matches || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const SEL = ".ap-fab, .btn, .socials a, .view-all, .pstat-link";
  document.addEventListener("pointerover", e => {
    const el = e.target.closest && e.target.closest(SEL);
    if (!el || el.dataset.magnet) return;
    el.dataset.magnet = "1"; el.classList.add("magnet");
    el.addEventListener("pointermove", ev => {
      const r = el.getBoundingClientRect();
      const x = (ev.clientX - r.left - r.width / 2) * 0.22, y = (ev.clientY - r.top - r.height / 2) * 0.3;
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    });
    el.addEventListener("pointerleave", () => { el.style.translate = ""; });
  });
})();

/* ---------- news about a paper: the card opens that paper on Publications ---------- */
document.querySelectorAll(".news .news-item[data-pub]").forEach(item => {
  const href = "publications.html#p=" + item.dataset.pub;
  item.querySelector("div:last-child").insertAdjacentHTML("beforeend",
    `<a class="news-link" href="${href}">${document.documentElement.lang === "vi" ? "Xem bài báo" : "View paper"} <span aria-hidden="true">→</span></a>`);
  item.classList.add("linked");
  item.addEventListener("click", e => { if (!e.target.closest("a")) location.href = href; });
});

/* ---------- home: the numbers under the hero open Publications (all / journals / conferences) ---------- */
document.querySelectorAll(".stats [data-href]").forEach(el => {
  el.setAttribute("role", "link"); el.tabIndex = 0;
  el.title = el.querySelector("span")?.textContent || "";
  const go = () => { location.href = el.dataset.href; };
  el.addEventListener("click", go);
  el.addEventListener("keydown", e => { if (e.key === "Enter"){ e.preventDefault(); go(); } });
});
