/* RASL — student application form.
   A floating "Apply" button (and any element with [data-apply]) opens a bilingual form.
   On submit it composes a ready-to-send email to the lab; the student attaches a CV and sends it.
   Static site: nothing is uploaded anywhere, the draft is kept only in the visitor's browser. */
(() => {
const VI = document.documentElement.lang === "vi";
const t = (en, vi) => VI ? vi : en;
const ROOT = VI ? "../" : "";
const TO = "vuthanh.cdt@gmail.com";
const DRAFT = "raslApplyDraft";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- form schema (one place for both languages) ---------- */
const AREAS = [
  ["Human–Robot Interaction", "Tương tác người – robot"],
  ["Human-Aware Navigation", "Điều hướng giữa con người"],
  ["Agricultural Robots", "Robot nông nghiệp"],
  ["Legged Locomotion", "Robot đi bằng chân"],
  ["Robot Learning", "Học máy cho robot"],
  ["Vision–Language–Action", "Vision–Language–Action"],
];
const SKILLS = ["Python", "C/C++", "ROS / ROS 2", "MATLAB / Simulink", "PyTorch", "Isaac Sim / Isaac Lab", "Gazebo / MuJoCo",
  ["Computer vision (OpenCV)", "Thị giác máy tính (OpenCV)"], ["Embedded (Arduino, STM32)", "Nhúng (Arduino, STM32)"],
  ["Mechanical design (SolidWorks)", "Thiết kế cơ khí (SolidWorks)"], ["Electronics / PCB", "Điện tử / PCB"], "Linux"];
const opt = o => Array.isArray(o) ? {v: o[0], l: t(o[0], o[1])} : {v: o, l: o};

const SECTIONS = [
  {title: t("About you", "Thông tin cá nhân"), fields: [
    {id: "name", type: "text", label: t("Full name", "Họ và tên"), req: true, auto: "name", half: true},
    {id: "email", type: "email", label: "Email", req: true, auto: "email", half: true},
    {id: "phone", type: "tel", label: t("Phone / Zalo", "Điện thoại / Zalo"), auto: "tel", half: true},
    {id: "uni", type: "text", label: t("University", "Trường"), req: true, half: true},
    {id: "major", type: "text", label: t("Major", "Ngành học"), req: true, half: true},
    {id: "year", type: "select", label: t("Current year", "Năm học hiện tại"), half: true, options: [
      ["1st year", "Năm 1"], ["2nd year", "Năm 2"], ["3rd year", "Năm 3"], ["4th year", "Năm 4"], ["5th year", "Năm 5"],
      ["M.S. student", "Đang học Thạc sĩ"], ["Graduated", "Đã tốt nghiệp"]]},
    {id: "gpa", type: "text", label: t("GPA (optional)", "Điểm trung bình (không bắt buộc)"), ph: t("e.g. 3.4/4.0", "VD: 3.4/4.0"), half: true},
  ]},
  {title: t("Position", "Vị trí ứng tuyển"), fields: [
    {id: "position", type: "radio", label: t("I am applying as", "Bạn ứng tuyển vị trí"), req: true, options: [
      ["Undergraduate researcher", "Sinh viên nghiên cứu"], ["M.S. student", "Học viên Thạc sĩ"], ["Ph.D. student", "Nghiên cứu sinh Tiến sĩ"],
      ["Visiting student", "Sinh viên trao đổi / thỉnh giảng"]]},
    {id: "start", type: "month", label: t("Earliest start", "Thời gian có thể bắt đầu"), half: true},
    {id: "hours", type: "select", label: t("Time you can commit", "Thời gian có thể tham gia"), half: true, options: [
      ["< 10 hours/week", "< 10 giờ/tuần"], ["10–20 hours/week", "10–20 giờ/tuần"], ["20+ hours/week", "Trên 20 giờ/tuần"], ["Full-time", "Toàn thời gian"]]},
  ]},
  {title: t("Research interests", "Hướng nghiên cứu quan tâm"), fields: [
    {id: "areas", type: "chips", label: t("Pick one or more topics you would like to work on", "Chọn một hoặc nhiều chủ đề bạn muốn tham gia"), req: true, options: AREAS},
    {id: "areasOther", type: "text", label: t("Other topic (optional)", "Chủ đề khác (không bắt buộc)"), ph: t("e.g. drone navigation, soft robotics…", "VD: điều hướng drone, robot mềm…")},
  ]},
  {title: t("Skills", "Kỹ năng"), fields: [
    {id: "skills", type: "chips", label: t("Tools and skills you have used", "Công cụ và kỹ năng bạn đã sử dụng"), options: SKILLS},
    {id: "skillsOther", type: "text", label: t("Other skills (optional)", "Kỹ năng khác (không bắt buộc)")},
  ]},
  {title: t("Languages (optional)", "Ngoại ngữ (không bắt buộc)"), fields: [
    {id: "english", type: "select", label: t("English level (optional)", "Trình độ tiếng Anh (không bắt buộc)"), half: true, options: [
      ["Basic", "Cơ bản"], ["Intermediate", "Trung bình"], ["Upper-intermediate", "Khá"], ["Advanced", "Tốt"], ["Fluent / native", "Thành thạo"]]},
    {id: "cert", type: "text", label: t("Certificate (optional)", "Chứng chỉ (không bắt buộc)"), ph: t("e.g. IELTS 6.5, TOEIC 750", "VD: IELTS 6.5, TOEIC 750"), half: true},
    {id: "langOther", type: "text", label: t("Other languages (optional)", "Ngoại ngữ khác (không bắt buộc)"), ph: t("e.g. Chinese HSK 4, Japanese N3", "VD: tiếng Trung HSK 4, tiếng Nhật N3")},
  ]},
  {title: t("About yourself", "Giới thiệu bản thân"), fields: [
    {id: "intro", type: "textarea", label: t("Introduce yourself", "Giới thiệu ngắn về bản thân"), req: true, min: 40, rows: 4,
      ph: t("Who you are, what you enjoy building, what you want to learn at RASL…", "Bạn là ai, thích làm gì với robot, muốn học được gì ở RASL…")},
    {id: "exp", type: "textarea", label: t("Projects, competitions or research experience (optional)", "Dự án, cuộc thi hoặc kinh nghiệm nghiên cứu (không bắt buộc)"), rows: 3,
      ph: t("e.g. Robocon team, a ROS project, a course project…", "VD: đội Robocon, dự án ROS, đồ án môn học…")},
  ]},
  {title: t("Links", "Liên kết"), fields: [
    {id: "cv", type: "url", label: t("CV link (Google Drive, etc.)", "Link CV (Google Drive…)"), ph: "https://", half: true},
    {id: "portfolio", type: "url", label: t("GitHub / portfolio (optional)", "GitHub / portfolio (không bắt buộc)"), ph: "https://", half: true},
    {id: "agree", type: "check", label: t("I will attach my CV (and transcript, if available) to the email.", "Mình sẽ đính kèm CV (và bảng điểm nếu có) vào email."), req: true},
  ]},
];
const FIELDS = SECTIONS.flatMap(s => s.fields);

/* ---------- markup ---------- */
const field = f => {
  const req = f.req ? `<i class="ap-req" aria-hidden="true">*</i>` : "";
  const err = `<small class="ap-err" id="e-${f.id}"></small>`;
  const cls = `ap-f${f.half ? " half" : ""}`;
  if (f.type === "textarea")
    return `<label class="${cls} full"><span>${esc(f.label)}${req}</span><textarea name="${f.id}" rows="${f.rows || 3}" placeholder="${esc(f.ph || "")}"${f.req ? " required" : ""} aria-describedby="e-${f.id}"></textarea>${err}</label>`;
  if (f.type === "select")
    return `<label class="${cls}"><span>${esc(f.label)}${req}</span><select name="${f.id}"${f.req ? " required" : ""} aria-describedby="e-${f.id}"><option value="">${t("Select…", "Chọn…")}</option>${f.options.map(o => { const x = opt(o); return `<option value="${esc(x.v)}">${esc(x.l)}</option>`; }).join("")}</select>${err}</label>`;
  if (f.type === "radio" || f.type === "chips")
    return `<fieldset class="ap-f full ap-${f.type}" aria-describedby="e-${f.id}"><legend>${esc(f.label)}${req}</legend><div class="ap-opts">${f.options.map(o => { const x = opt(o);
      return `<label class="ap-opt"><input type="${f.type === "radio" ? "radio" : "checkbox"}" name="${f.id}" value="${esc(x.v)}"><span>${esc(x.l)}</span></label>`; }).join("")}</div>${err}</fieldset>`;
  if (f.type === "check")
    return `<label class="ap-f full ap-check"><input type="checkbox" name="${f.id}"${f.req ? " required" : ""}><span>${esc(f.label)}${req}</span>${err}</label>`;
  return `<label class="${cls}"><span>${esc(f.label)}${req}</span><input type="${f.type}" name="${f.id}" placeholder="${esc(f.ph || "")}"${f.auto ? ` autocomplete="${f.auto}"` : ""}${f.req ? " required" : ""} aria-describedby="e-${f.id}">${err}</label>`;
};

const shell = document.createElement("div");
shell.className = "ap";
shell.innerHTML = `
  <div class="ap-hint" role="status" hidden>
    <button class="ap-hint-text" type="button"><b>${t("Join RASL — apply here", "Ứng tuyển vào RASL")}</b><span>${t("Students are welcome to join RASL", "Chào đón các bạn sinh viên tham gia RASL")}</span></button>
    <button class="ap-hint-x" type="button" aria-label="${t("Hide", "Ẩn")}">×</button>
  </div>
  <button class="ap-fab" type="button" aria-haspopup="dialog" aria-label="${t("Apply to join RASL", "Ứng tuyển vào RASL")}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/></svg>
    <span>${t("Apply", "Ứng tuyển")}</span>
  </button>
  <div class="ap-modal" role="dialog" aria-modal="true" aria-labelledby="apTitle" hidden>
    <div class="ap-back" data-close></div>
    <div class="ap-panel">
      <header class="ap-head">
        <img src="${ROOT}assets/rasl-logo.png" alt="">
        <div><h2 id="apTitle">${t("Apply to RASL", "Ứng tuyển vào RASL")}</h2>
          <p>${t("Fill in the form — we'll turn it into an email you can send in one click.", "Điền form bên dưới — website sẽ soạn sẵn email để bạn gửi chỉ với một lần bấm.")}</p></div>
        <button class="ap-x" type="button" data-close aria-label="${t("Close", "Đóng")}">×</button>
      </header>
      <form class="ap-form" novalidate>
        ${SECTIONS.map((s, i) => `<section class="ap-sec"><h3><em>${i + 1}</em>${esc(s.title)}</h3><div class="ap-grid">${s.fields.map(field).join("")}</div></section>`).join("")}
        <footer class="ap-foot">
          <span class="ap-saved" aria-live="polite"></span>
          <button type="button" class="ap-btn ghost" data-clear>${t("Clear", "Xoá form")}</button>
          <button type="submit" class="ap-btn primary">${t("Create my email", "Tạo email ứng tuyển")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </footer>
      </form>
      <div class="ap-done" hidden>
        <div class="ap-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg></div>
        <h3>${t("Your email is ready", "Email của bạn đã sẵn sàng")}</h3>
        <p>${t(`Open it in your email app, <b>attach your CV</b>, and send it to <b>${TO}</b>.`, `Mở email trong ứng dụng thư, <b>đính kèm CV</b> rồi gửi tới <b>${TO}</b>.`)}</p>
        <div class="ap-actions">
          <a class="ap-btn primary" data-mailto href="#">${t("Open email app", "Mở ứng dụng email")}</a>
          <a class="ap-btn" data-gmail href="#" target="_blank" rel="noopener">${t("Open in Gmail", "Mở bằng Gmail")}</a>
          <button class="ap-btn" type="button" data-copy>${t("Copy email text", "Sao chép nội dung")}</button>
        </div>
        <details class="ap-preview"><summary>${t("Preview", "Xem trước nội dung")}</summary><pre></pre></details>
        <button type="button" class="ap-link" data-edit>← ${t("Edit my answers", "Sửa lại thông tin")}</button>
      </div>
    </div>
  </div>`;
document.body.appendChild(shell);

const $ = s => shell.querySelector(s);
const modal = $(".ap-modal"), form = $(".ap-form"), done = $(".ap-done"), fab = $(".ap-fab"), hint = $(".ap-hint");
let lastFocus = null;

/* ---------- values, draft ---------- */
const values = () => {
  const v = {};
  FIELDS.forEach(f => {
    if (f.type === "chips") v[f.id] = [...form.querySelectorAll(`[name="${f.id}"]:checked`)].map(x => x.value);
    else if (f.type === "radio") v[f.id] = form.querySelector(`[name="${f.id}"]:checked`)?.value || "";
    else if (f.type === "check") v[f.id] = form.querySelector(`[name="${f.id}"]`).checked;
    else v[f.id] = form.querySelector(`[name="${f.id}"]`).value.trim();
  });
  return v;
};
const fill = v => FIELDS.forEach(f => {
  if (!(f.id in v)) return;
  if (f.type === "chips") form.querySelectorAll(`[name="${f.id}"]`).forEach(x => x.checked = v[f.id].includes(x.value));
  else if (f.type === "radio") form.querySelectorAll(`[name="${f.id}"]`).forEach(x => x.checked = x.value === v[f.id]);
  else if (f.type === "check") form.querySelector(`[name="${f.id}"]`).checked = !!v[f.id];
  else form.querySelector(`[name="${f.id}"]`).value = v[f.id];
});
try { const d = JSON.parse(localStorage.getItem(DRAFT) || "null"); if (d) fill(d); } catch(e){}
let saveT;
form.addEventListener("input", () => {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    try { localStorage.setItem(DRAFT, JSON.stringify(values())); $(".ap-saved").textContent = t("Draft saved on this device", "Đã lưu nháp trên máy này"); } catch(e){}
  }, 400);
});
form.querySelector("[data-clear]").addEventListener("click", () => {
  form.reset(); form.querySelectorAll(".bad").forEach(x => x.classList.remove("bad")); form.querySelectorAll(".ap-err").forEach(x => x.textContent = "");
  try { localStorage.removeItem(DRAFT); } catch(e){}
  $(".ap-saved").textContent = "";
});

/* ---------- validation ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validate(v){
  let first = null;
  FIELDS.forEach(f => {
    const box = form.querySelector(`#e-${f.id}`), wrapEl = box.closest(".ap-f");
    let msg = "";
    const val = v[f.id];
    if (f.req && (val === "" || val === false || (Array.isArray(val) && !val.length))) msg = f.type === "chips" ? t("Please pick at least one.", "Vui lòng chọn ít nhất một mục.") : f.type === "check" ? t("Please confirm.", "Vui lòng xác nhận.") : t("Required.", "Bắt buộc.");
    else if (f.type === "email" && val && !EMAIL_RE.test(val)) msg = t("Please enter a valid email.", "Email chưa đúng định dạng.");
    else if (f.type === "url" && val && !/^https?:\/\/\S+\.\S+/.test(val)) msg = t("Please enter a full link starting with https://", "Vui lòng nhập link đầy đủ, bắt đầu bằng https://");
    else if (f.min && val && val.length < f.min) msg = t(`Please write at least ${f.min} characters.`, `Vui lòng viết ít nhất ${f.min} ký tự.`);
    box.textContent = msg; wrapEl.classList.toggle("bad", !!msg);
    if (msg && !first) first = wrapEl;
  });
  if (first){ first.scrollIntoView({block: "center", behavior: "smooth"}); first.querySelector("input,select,textarea")?.focus({preventScroll: true}); }
  return !first;
}

/* ---------- compose the email ---------- */
const label = (f, val) => { const o = (f.options || []).map(opt).find(x => x.v === val); return o ? o.l : val; };
function compose(v){
  const F = id => FIELDS.find(f => f.id === id);
  const line = (k, val) => val ? `${k}: ${val}` : null;
  const areas = v.areas.map(a => label(F("areas"), a)).concat(v.areasOther ? [v.areasOther] : []);
  const skills = v.skills.map(s => label(F("skills"), s)).concat(v.skillsOther ? [v.skillsOther] : []);
  const subject = `[RASL Application] ${label(F("position"), v.position)} – ${v.name}`;
  const body = [
    t(`Dear Dr. Cong-Thanh Vu,`, `Kính gửi TS. Cong-Thanh Vu,`),
    "",
    t(`I would like to apply to RASL as a ${label(F("position"), v.position).toLowerCase()}. My details are below.`,
      `Em xin ứng tuyển vào RASL ở vị trí ${label(F("position"), v.position).toLowerCase()}. Thông tin của em như sau.`),
    "",
    `— ${t("ABOUT ME", "THÔNG TIN CÁ NHÂN")} —`,
    line(t("Name", "Họ tên"), v.name), line("Email", v.email), line(t("Phone", "Điện thoại"), v.phone),
    line(t("University", "Trường"), v.uni), line(t("Major", "Ngành"), v.major), line(t("Year", "Năm học"), label(F("year"), v.year)), line("GPA", v.gpa),
    "",
    `— ${t("POSITION", "VỊ TRÍ")} —`,
    line(t("Applying as", "Vị trí"), label(F("position"), v.position)), line(t("Earliest start", "Có thể bắt đầu"), v.start), line(t("Time commitment", "Thời gian tham gia"), label(F("hours"), v.hours)),
    "",
    `— ${t("RESEARCH INTERESTS", "HƯỚNG NGHIÊN CỨU QUAN TÂM")} —`,
    ...areas.map(a => `• ${a}`),
    "",
    `— ${t("SKILLS", "KỸ NĂNG")} —`,
    skills.length ? skills.join(", ") : t("(not specified)", "(chưa điền)"),
    "",
    ...((v.english || v.cert || v.langOther) ? [
      `— ${t("LANGUAGES", "NGOẠI NGỮ")} —`,
      line(t("English", "Tiếng Anh"), [label(F("english"), v.english), v.cert].filter(Boolean).join(" · ")), line(t("Other", "Khác"), v.langOther),
      ""] : []),
    `— ${t("INTRODUCTION", "GIỚI THIỆU BẢN THÂN")} —`,
    v.intro,
    ...(v.exp ? ["", `— ${t("PROJECTS & EXPERIENCE", "DỰ ÁN & KINH NGHIỆM")} —`, v.exp] : []),
    "",
    `— ${t("LINKS", "LIÊN KẾT")} —`,
    line("CV", v.cv || t("attached", "đính kèm trong email")), line(t("GitHub / portfolio", "GitHub / portfolio"), v.portfolio),
    "",
    t("I have attached my CV to this email. Thank you for your time and consideration.", "Em xin gửi kèm CV trong email này. Em cảm ơn thầy đã dành thời gian xem xét."),
    "",
    t("Best regards,", "Trân trọng,"),
    v.name,
  ].filter(x => x !== null).join("\n");
  return {subject, body};
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const v = values();
  if (!validate(v)) return;
  const {subject, body} = compose(v);
  const enc = encodeURIComponent;
  done.querySelector("[data-mailto]").href = `mailto:${TO}?subject=${enc(subject)}&body=${enc(body)}`;
  done.querySelector("[data-gmail]").href = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(TO)}&su=${enc(subject)}&body=${enc(body)}`;
  done.querySelector("pre").textContent = `${t("To", "Tới")}: ${TO}\n${t("Subject", "Tiêu đề")}: ${subject}\n\n${body}`;
  done.dataset.text = `${subject}\n\n${body}`;
  form.hidden = true; done.hidden = false; $(".ap-panel").scrollTop = 0;
  done.querySelector("[data-mailto]").focus();
});
done.querySelector("[data-copy]").addEventListener("click", e => {
  const b = e.currentTarget;
  navigator.clipboard?.writeText(`${t("To", "Tới")}: ${TO}\n${done.dataset.text}`).then(() => {
    b.textContent = t("Copied ✓", "Đã sao chép ✓"); setTimeout(() => b.textContent = t("Copy email text", "Sao chép nội dung"), 1600);
  }).catch(() => {});
});
done.querySelector("[data-edit]").addEventListener("click", () => { done.hidden = true; form.hidden = false; });

/* ---------- open / close ---------- */
function openForm(){
  lastFocus = document.activeElement;
  modal.hidden = false; document.documentElement.classList.add("ap-lock"); hideHint();
  requestAnimationFrame(() => modal.classList.add("show"));
  setTimeout(() => form.hidden ? done.querySelector("[data-mailto]").focus() : form.querySelector("input")?.focus(), 60);
}
function closeForm(){
  modal.classList.remove("show"); document.documentElement.classList.remove("ap-lock");
  setTimeout(() => { modal.hidden = true; }, 200); lastFocus?.focus?.();
}
fab.addEventListener("click", openForm);
modal.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeForm(); });
addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden && document.querySelector(".sk")?.hidden !== false) closeForm(); });
document.addEventListener("click", e => { const a = e.target.closest("[data-apply]"); if (a){ e.preventDefault(); openForm(); } });
if (location.hash === "#apply") openForm();

/* ---------- hint bubble: shows 3 s after each page opens, then again every minute;
   closing it with × or opening the form hides it for the rest of the visit ---------- */
const EVERY = 60000, SHOW = 6000;
const ss = (k, v) => { try { return v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch(e){ return null; } };
let hideT, hovering = false;
const reveal = () => { clearTimeout(hideT); hint.classList.remove("bye"); hint.hidden = false; };
const fadeOut = delay => { clearTimeout(hideT); hideT = setTimeout(() => {
  if (hovering) return;
  hint.classList.add("bye"); hideT = setTimeout(() => { hint.hidden = true; hint.classList.remove("bye"); }, 400);
}, delay); };
function hideHint(){ clearTimeout(hideT); hint.hidden = true; ss("apHintOff", "1"); }
const AUTO = /(^|\/)(index\.html|people\.html|contact\.html)?$/.test(location.pathname);   // timed hint on Home, People, Contact only
function showHint(){
  if (!AUTO || ss("apHintOff") || !modal.hidden || document.hidden) return;
  reveal(); fadeOut(SHOW);
  fab.classList.remove("nudge"); void fab.offsetWidth; fab.classList.add("nudge");
}
/* hovering the Apply button (or the bubble itself) always shows the bubble; it fades shortly after the mouse leaves */
[fab, hint].forEach(el => {
  el.addEventListener("pointerenter", e => { if (e.pointerType === "touch" || !modal.hidden) return; hovering = true; reveal(); });
  el.addEventListener("pointerleave", e => { if (e.pointerType === "touch") return; hovering = false; fadeOut(500); });
});
setTimeout(() => { showHint(); setInterval(showHint, EVERY); },
  document.documentElement.classList.contains("intro-on") ? 5000 : 3000);   // wait for the home intro to finish
hint.querySelector(".ap-hint-text").addEventListener("click", openForm);
hint.querySelector(".ap-hint-x").addEventListener("click", hideHint);

window.RASLApply = { open: openForm, compose, values };   // for testing
})();
