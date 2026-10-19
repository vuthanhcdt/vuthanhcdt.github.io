import sys
import re,sys,os
SP=os.path.dirname(os.path.abspath(__file__)); OUT=sys.argv[1]
rd=lambda n: open(os.path.join(SP,n)).read()
research=rd('sec_research.html'); news=rd('sec_news.html'); pubs=rd('sec_publications.html'); people=rd('sec_people.html'); contact=rd('sec_contact.html')
cards=re.findall(r'<article class="card reveal">\s*<div class="ico">(<svg.*?</svg>)</div>\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>',research,re.S)
assert len(cards)==6
news_items=re.findall(r'(<div class="news-item reveal">.*?</div></div>)',news,re.S)
assert len(news_items)==6,len(news_items)
ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
SLUG=['hri','navigation','agriculture','locomotion','learning','vla']
PAPERS=['0,4,2','2,6,8,13,12,11','1,9','7,5','0,6,10,3','1,4,5']
LONG=[
 'Robots that share space with people must read intent, adapt their behaviour and offer help at the right moment. We study companion robots that learn interaction strategies with deep reinforcement learning, and multimodal language-model–driven service robots for elderly-care settings.',
 'Following a person or a group through crowds and changing layouts requires predicting motion and choosing where to be. We develop socially compliant navigation, optimized tracking positions for human-following robots, and adaptive companionship for groups whose formation changes over time.',
 'Field robots face uneven terrain, changing weather and plants that never look the same twice. We work on autonomous navigation in orchards and on context-aware pesticide spraying that uses vision–language models to adapt to weather and terrain.',
 'Walking efficiently and robustly is still hard for robots. We study passive dynamic walking with kneed-walker models as guides for learned policies, and humanoid robots that learn diverse tasks from synthetic video.',
 'Learning lets robots handle situations that are hard to hand-code. Our work uses deep reinforcement learning for human-following and multi-robot planning in dynamic environments, and continual learning so trackers stay reliable as conditions change.',
 'Vision–language models give robots common-sense understanding of scenes and instructions. We use them for adaptive decision making in the field and for interaction, and explore policy learning from generated video without real-world data.',
]
PAGES=[('index.html','Home'),('publications.html','Publications'),('news.html','News'),('people.html','People'),('contact.html','Contact')]

def head(title,desc):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
<script>try{{const t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
</head>
<body>
'''
def nav(active):
    ACT=' class="active" aria-current="page"'
    links='\n'.join(f'      <a href="{f}"{ACT if n==active else ""}>{n}</a>' for f,n in PAGES[1:] if n!='Research')
    return f'''<header class="nav" id="nav">
  <div class="wrap">
    <a class="brand" href="index.html">
      <img src="assets/rasl-logo.png" alt="">
      <b>RASL</b>
      <span>Robotics and<br>Autonomous Systems Lab</span>
    </a>
    <nav class="links" id="links">
{links}
    </nav>
    <div class="nav-actions">
      <!--LANG-->
      <button class="search-btn" id="searchBtn" type="button" aria-label="Search the site">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <span>Search</span><kbd>⌘K</kbd>
      </button>
      <button class="icon-btn" id="themeBtn" type="button" aria-label="Toggle dark mode">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      </button>
      <button class="icon-btn menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
</header>
'''
FOOT='''<footer class="site-footer">
  <div class="wrap">
    <a class="brand" href="index.html"><img src="assets/rasl-logo.png" alt=""><b>RASL</b><span>Robotics and<br>Autonomous Systems Lab</span></a>
    <nav class="flinks"><a href="publications.html">Publications</a><a href="news.html">News</a><a href="people.html">People</a><a href="contact.html">Contact</a></nav>
    <div class="copy">© <span id="yr">2026</span> RASL<span class="upd">__UPDATED__</span></div>
  </div>
</footer>
<script src="assets/pubs.js"></script>
<script src="assets/search-index.js"></script>
<script src="assets/site.js"></script>
<script src="assets/apply.js"></script>
</body>
</html>
'''
def page_hero(eyebrow,title,sub):
    return f'''<section class="page-hero">
  <canvas id="net" aria-hidden="true"></canvas>
  <img class="wm" src="assets/rasl-logo.png" alt="">
  <div class="wrap">
    <div class="crumbs"><a href="index.html">RASL</a> / {eyebrow}</div>
    <h1>{title}</h1>
    <p>{sub}</p>
  </div>
</section>
'''
def strip_head(sec):  # drop the in-section heading; page hero replaces it
    out,n=re.subn(r'    <div class="sec-head reveal">.*?\n    </div>\n','',sec,count=1,flags=re.S); assert n==1; return out

import hashlib
def _ver(rel):  # content hash so browsers fetch the new file after every change
    return hashlib.md5(open(os.path.join(OUT,rel),'rb').read()).hexdigest()[:8]
def bust(html):
    for rel in ['assets/site.css','assets/site.js','assets/pubs.js','assets/search-index.js']:
        if os.path.exists(os.path.join(OUT,rel)): html=html.replace(f'"{rel}"',f'"{rel}?v={_ver(rel)}"')
    return html
import datetime
_now=datetime.date.today()
UPD_EN='Updated '+_now.strftime('%B %-d, %Y')
UPD_VI=f'Cập nhật lần cuối: {_now.day:02d}/{_now.month:02d}/{_now.year}'
BUILT={}
def lang_switch(lang,name):
    en_href, vi_href = (name, 'vi/'+name) if lang=='en' else ('../'+name, name)
    ON=' class="on" aria-current="true"'
    en_on = ON if lang=='en' else ''
    vi_on = ON if lang=='vi' else ''
    return (f'<div class="lang-sw" role="group" aria-label="Language">'
            f'<a href="{en_href}" hreflang="en" data-lang="en"{en_on}>EN</a>'
            f'<a href="{vi_href}" hreflang="vi" data-lang="vi"{vi_on}>VI</a></div>')
def write(name,title,desc,active,body):
    raw=bust(head(title,desc)+nav(active)+'\n<main>\n'+body+'\n</main>\n\n'+FOOT)
    raw=raw.replace('</head>',f'<link rel="alternate" hreflang="en" href="__EN__{name}">\n<link rel="alternate" hreflang="vi" href="__VI__{name}">\n</head>',1)
    BUILT[name]=raw
    h=raw.replace('<!--LANG-->',lang_switch('en',name)).replace('__UPDATED__',UPD_EN).replace('__EN__','').replace('__VI__','vi/')
    open(os.path.join(OUT,name),'w').write(h)

# ---------- home ----------
def _tl(n,i):
    d=re.search(r'<b>(.*?)</b><span>(.*?)</span>',n); h=re.search(r'<h3>(.*?)</h3>',n).group(1); p=re.search(r'<p>(.*?)</p>',n).group(1)
    return f'        <li><a href="news.html#news-{i}"><time>{d.group(1)} {d.group(2)}</time><b>{h}</b><span>{p}</span></a></li>'
TL='\n'.join(_tl(n,i) for i,n in enumerate(news_items[:5],1))
VENUES=''.join(f'<span>{v}</span>' for v in ['TSMC','COMPAG','IROS','AIM','Humanoids']*3)
KW=[['Companion robots','Proactive assistance','Elderly care'],
    ['Human following','Group following','Social navigation'],
    ['Orchard navigation','Adaptive spraying','Uneven terrain'],
    ['Passive walking','Humanoids','Whole-body skills'],
    ['Deep RL','Multi-robot planning','Continual learning'],
    ['Vision–language models','Scene reasoning','Synthetic video']]
grid='\n'.join(f'''      <article class="rcard reveal" style="--d:{i*70}ms">
        <div class="rtop"><span class="rnum">0{i+1}</span><div class="ico">{svg}</div></div>
        <h3>{h}</h3>
        <p>{p}</p>
        <ul class="kw">{''.join(f'<li>{k}</li>' for k in KW[i])}</ul>
      </article>''' for i,(svg,h,p) in enumerate(cards))
home=f'''<section class="hero" id="top">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <canvas id="net" aria-hidden="true"></canvas>
  <div class="cursor-glow" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div>
      <img class="hero-logo" src="assets/rasl-mark.png?v=2" alt="RASL">
      <div class="pill"><span class="dot"></span>Robotics and Autonomous Systems Lab</div>
      <h1 class="tagline">Robots that <em>understand</em>, <em>adapt</em>, and work alongside people.</h1>
      <p class="lead">We study intelligent robots for the real world — from companion robots that follow and assist humans, to agricultural robots in the field and legged robots that learn to walk.</p>
      <div class="cta">
        <a class="btn primary" href="publications.html">Publications {ARROW}</a>
        <a class="btn ghost" href="people.html">People</a>
      </div>
    </div>
  </div>
  <div class="wrap">
    <div class="stats">
      <div><b id="sPubs">0</b><span>Peer-reviewed papers</span></div>
      <div><b id="sJour">0</b><span>Journal articles</span></div>
      <div><b id="sConf">0</b><span>Conference papers</span></div>
    </div>
  </div>
</section>

<div class="marquee" aria-label="Venues">
  <div class="track">{VENUES}{VENUES}</div>
</div>

<section class="sec" id="research">
  <div class="wrap">
    <div class="sec-head reveal">
      <div><div class="eyebrow">Research</div><h2>What we work on</h2></div>
      <p>We combine learning, perception and control so that robots can act safely and usefully in dynamic, human-centered and unstructured environments.</p>
    </div>
    <div class="rgrid">
{grid}
    </div>
  </div>
</section>

<section class="sec alt">
  <div class="wrap duo">
    <div class="panel reveal">
      <div class="panel-head">
        <div><div class="eyebrow">News</div><h2>Latest updates</h2></div>
        <a class="view-all" href="news.html">View all {ARROW}</a>
      </div>
      <ol class="tl">
{TL}
      </ol>
    </div>
    <div class="panel reveal">
      <div class="panel-head">
        <div><div class="eyebrow">Publications</div><h2>Recent papers</h2></div>
        <a class="view-all" href="publications.html">View all {ARROW}</a>
      </div>
      <div class="plist" id="featured"></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="join reveal">
      <div><h3>Join RASL</h3><p>Students interested in robot learning, human–robot interaction or field robotics are welcome to get in touch.</p></div>
      <a class="btn primary" href="#apply" data-apply>Apply now</a>
    </div>
  </div>
</section>'''
write('index.html','RASL Robotics Lab','RASL — Robotics and Autonomous Systems Lab. Human–robot interaction, field robotics, legged locomotion and robot learning.','Home',home)

# ---------- research ----------
rows='\n'.join(f'''    <div class="area reveal" id="{SLUG[i]}">
      <div>
        <div class="ico">{svg}</div>
        <div class="num">0{i+1}</div>
        <h2>{h}</h2>
      </div>
      <div>
        <p>{LONG[i]}</p>
        <h4>Selected papers</h4>
        <ul class="papers" data-papers="{PAPERS[i]}"></ul>
      </div>
    </div>''' for i,(svg,h,p) in enumerate(cards))

# ---------- other pages ----------
write('publications.html','Publications · RASL','Peer-reviewed publications of RASL.','Publications',
  page_hero('Publications','Publications','Journal articles and conference proceedings. Filter by type, search by title, author or venue, and copy BibTeX.')+strip_head(pubs))
_n=iter(range(1,100))
news_page=re.sub(r'<div class="news-item reveal">',lambda m:f'<div class="news-item reveal" id="news-{next(_n)}">',news.replace('class="sec alt"','class="sec"'))
write('news.html','News · RASL','News and announcements from RASL.','News',
  page_hero('News','News','Accepted papers, talks and milestones from the lab.')+strip_head(news_page))
write('people.html','People · RASL','People of RASL.','People',
  page_hero('People','People','Meet the people behind RASL.')+people.replace('class="sec alt"','class="sec"'))
write('contact.html','Contact · RASL','Contact RASL.','Contact',
  page_hero('Contact','Get in touch','For collaborations, research questions or joining the lab, send us an email.')+strip_head(contact))
print('built')

# ---------- site-wide search index (publications come from pubs.js) ----------
import json, html as _h
txt=lambda x: _h.unescape(re.sub(r'<[^>]+>',' ',x)).split() and ' '.join(_h.unescape(re.sub(r'<[^>]+>',' ',x)).split())
IDX=[]
for i,n in enumerate(news_items,1):
    d=re.search(r'<b>(.*?)</b><span>(.*?)</span>',n); h=re.search(r'<h3>(.*?)</h3>',n).group(1); p=re.search(r'<p>(.*?)</p>',n).group(1)
    IDX.append(dict(type='News',title=txt(h),text=txt(p),meta=f'{d.group(1)} {d.group(2)}',url=f'news.html#news-{i}'))
for i,(svg,h,p) in enumerate(cards):
    IDX.append(dict(type='Research',title=txt(h),text=txt(p),meta=' · '.join(KW[i]),url='index.html#research'))
for li in re.findall(r'<li><em>(.*?)</em><b>(.*?)</b><span>(.*?)</span>(.*?)</li>',people):
    extra=txt(li[3]) if li[3].strip() else ''
    IDX.append(dict(type='People',title=txt(li[1]),text=txt(li[2])+(' · '+extra if extra else ''),meta=f'Cong-Thanh Vu · {txt(li[0])}',url='people.html'))
IDX+= [dict(type='People',title='Cong-Thanh Vu, Ph.D.',text='Director, Robotics and Autonomous Systems Lab (RASL). Human–robot interaction, human-aware navigation, agricultural robots, legged locomotion, robot learning.',meta='Director',url='people.html'),
       dict(type='Page',title='CV — Cong-Thanh Vu',text='Auto-generated CV with education, experience, publications and awards. Download as PDF.',meta='CV',url='cv.html?m=vu'),
       dict(type='Page',title='Contact',text='Email vuthanh.cdt@gmail.com · Google Scholar',meta='Get in touch',url='contact.html'),
       dict(type='Page',title='Join RASL — apply',text='Application form for students and interns: introduce yourself, your skills, languages and research interests.',meta='Open positions',url='index.html#apply'),
       dict(type='Page',title='Publications',text='All journal articles, conference papers and preprints with BibTeX.',meta='Page',url='publications.html'),
       dict(type='Page',title='News',text='Accepted papers, awards and milestones.',meta='Page',url='news.html')]
open(os.path.join(OUT,'assets','search-index.js'),'w').write('window.SEARCH_INDEX = '+json.dumps(IDX,ensure_ascii=False)+';\n')
print('search items',len(IDX))

# ---------- Vietnamese edition (vi/) ----------
sys.path.insert(0,SP)
from i18n_vi import translate, translate_text
os.makedirs(os.path.join(OUT,'vi'),exist_ok=True)
VI_FIX={'Curriculum Vitae — Cong-Thanh Vu':'CV — Cong-Thanh Vu',
        'Auto-generated CV with education, experience, publications and awards. Download as PDF.':'CV được tạo tự động gồm học vấn, kinh nghiệm, công bố khoa học và giải thưởng; có thể tải về dạng PDF.',
        'Email vuthanh.cdt@gmail.com · Google Scholar':'Email vuthanh.cdt@gmail.com · Google Scholar',
        'Get in touch':'Liên hệ','Open positions':'Tuyển sinh viên nghiên cứu','Page':'Trang',
        'All journal articles, conference papers and preprints with BibTeX.':'Toàn bộ bài báo tạp chí và hội nghị, kèm trích dẫn BibTeX.',
        'Accepted papers, awards and milestones.':'Bài báo mới được chấp nhận, giải thưởng và các cột mốc của lab.',
        'Join RASL':'Tham gia RASL','Join RASL — apply':'Ứng tuyển vào RASL',
        'Application form for students and interns: introduce yourself, your skills, languages and research interests.':'Form ứng tuyển cho sinh viên và thực tập sinh: giới thiệu bản thân, kỹ năng, ngoại ngữ và hướng nghiên cứu quan tâm.','Contact':'Liên hệ','Publications':'Công bố khoa học','News':'Tin tức','Director':'Giám đốc',
        'Cong-Thanh Vu · 2022 – 2026':'Cong-Thanh Vu · 2022 – 2026'}
def tvi(x): return VI_FIX.get(x, translate_text(x))
MON_VI={'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
def vdate(x): return re.sub(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})\b', lambda m: f'{MON_VI[m.group(1)]:02d}/{m.group(2)}', x)
IDX_VI=[dict(d,title=tvi(d['title']),text=tvi(d['text']),meta=vdate(tvi(d['meta'])),url=('../'+d['url'] if d['url'].startswith('cv.html') else d['url'])) for d in IDX]
open(os.path.join(OUT,'assets','search-index-vi.js'),'w').write('window.SEARCH_INDEX = '+json.dumps(IDX_VI,ensure_ascii=False)+';\n')
for name,raw in BUILT.items():
    h=translate(raw,name).replace('<html lang="en">','<html lang="vi">',1)
    h=re.sub(r'(src|href)="assets/',r'\1="../assets/',h)
    h=h.replace('href="cv.html','href="../cv.html')
    h=re.sub(r'assets/search-index\.js(\?v=[0-9a-f]+)?','assets/search-index-vi.js',h)
    h=h.replace('<!--LANG-->',lang_switch('vi',name)).replace('__UPDATED__',UPD_VI).replace('__EN__','../').replace('__VI__','')
    open(os.path.join(OUT,'vi',name),'w').write(h)
print('vi pages',len(BUILT))

# ---------- final pass: refresh asset versions in every page (incl. cv.html) ----------
import glob
for page in glob.glob(os.path.join(OUT,'*.html'))+glob.glob(os.path.join(OUT,'vi','*.html')):
    h=open(page).read()
    pre='../' if os.sep+'vi'+os.sep in page else ''
    for rel in ['assets/site.css','assets/site.js','assets/apply.js','assets/pubs.js','assets/search-index.js','assets/search-index-vi.js','assets/members.js']:
        if os.path.exists(os.path.join(OUT,rel)):
            h=re.sub(r'"%s(\?v=[0-9a-f]+)?"'%re.escape(pre+rel), f'"{pre}{rel}?v={_ver(rel)}"', h)
    open(page,'w').write(h)
print('versions refreshed')
