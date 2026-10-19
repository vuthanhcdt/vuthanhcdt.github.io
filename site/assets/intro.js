/* RASL opening animation (home page only, once per visit).
   Particles fly in and assemble into the RASL logo, the crisp logo and lab name fade in,
   then the overlay zooms out to reveal the page. Skippable with a click, a key or the Skip button.
   The page's <head> adds html.intro-on only when the intro should play (see build.py). */
(() => {
const root = document.documentElement;
const box = document.querySelector(".intro");
if (!box) return;
if (!root.classList.contains("intro-on")) { box.remove(); return; }

const cv = box.querySelector("canvas"), ctx = cv.getContext("2d");
const mark = box.querySelector(".intro-mark");
const dpr = Math.min(devicePixelRatio || 1, 2);
let W, H, pts = [], start = 0, raf = 0, ended = false;
const T_GATHER = 1500, T_HOLD = 900, T_OUT = 650;          // ms

function finish(){
  if (ended) return; ended = true;
  cancelAnimationFrame(raf);
  try { sessionStorage.setItem("raslIntro", "seen"); } catch(e){}
  box.classList.add("out");
  setTimeout(() => { root.classList.remove("intro-on"); box.remove(); }, T_OUT);
}

/* sample the logo's opaque pixels into target points */
function targets(img){
  const r = mark.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
  const off = document.createElement("canvas"); off.width = w; off.height = h;
  const o = off.getContext("2d"); o.drawImage(img, 0, 0, w, h);
  const data = o.getImageData(0, 0, w, h).data;
  const step = Math.max(3, Math.round(w / 150));            // ~150 columns of particles across the logo
  const out = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
    if (data[(y * w + x) * 4 + 3] > 140) out.push([r.left + x, r.top + y]);
  }
  return out;
}

function setup(img){
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const tg = targets(img);
  pts = tg.map(([tx, ty]) => {
    const a = Math.random() * Math.PI * 2, d = Math.max(W, H) * (0.55 + Math.random() * 0.5);
    return {sx: W / 2 + Math.cos(a) * d, sy: H / 2 + Math.sin(a) * d, tx, ty,
            delay: Math.random() * 0.35, r: 1 + Math.random() * 1.2};
  });
}

const ease = t => 1 - Math.pow(1 - t, 3);
function frame(now){
  if (!start) start = now;
  const el = now - start;
  ctx.clearRect(0, 0, W, H);
  const g = Math.min(1, el / T_GATHER);
  /* faint links between neighbours while they converge */
  ctx.lineWidth = 0.6;
  const P = pts.map(p => {
    const k = ease(Math.min(1, Math.max(0, (g - p.delay) / (1 - p.delay))));
    return [p.sx + (p.tx - p.sx) * k, p.sy + (p.ty - p.sy) * k, k, p.r];
  });
  if (g < 1){
    ctx.strokeStyle = "rgba(120,180,255,.18)";
    for (let i = 0; i < P.length; i += 7){
      const a = P[i], b = P[(i * 13 + 5) % P.length];
      if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) < 160){ ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    }
  }
  /* particles: cyan while travelling, white when they land */
  for (const [x, y, k, r] of P){
    ctx.fillStyle = k < 1 ? `rgba(${Math.round(110 + 145 * k)},${Math.round(210 + 45 * k)},255,${0.55 + 0.45 * k})` : "rgba(255,255,255,.95)";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  if (el > T_GATHER * 0.85) box.classList.add("show");      // crisp logo + lab name fade in over the dots
  if (el > T_GATHER + T_HOLD) { finish(); return; }
  raf = requestAnimationFrame(frame);
}

box.querySelector(".intro-skip").addEventListener("click", finish);
box.addEventListener("click", finish);
addEventListener("keydown", finish, {once: true});
setTimeout(finish, 6000);                                   // safety net

const img = new Image();
img.onload = () => { if (ended) return; setup(img); raf = requestAnimationFrame(frame); };
img.onerror = finish;
img.src = mark.getAttribute("src");
})();
