#!/usr/bin/env python3
"""
Builds a professional Academic Curriculum Vitae (PDF) for Director Dr. Cong-Thanh Vu.
Reads publication data from static/data/profile-sections.json and uses headless Chrome
to generate a high-quality, printable vector PDF at static/files/CV_Cong_Thanh_Vu.pdf.
"""

import json
import os
import subprocess
import tempfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT_DIR / "static" / "data" / "profile-sections.json"
OUTPUT_PDF = ROOT_DIR / "static" / "files" / "CV_Cong_Thanh_Vu.pdf"
DOCS_PDF = ROOT_DIR / "docs" / "files" / "CV_Cong_Thanh_Vu.pdf"

def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_html(data):
    pubs = data.get("sections", {}).get("publications", {}).get("rows", [])
    
    # Sort publications by Year desc
    journals = [p for p in pubs if p.get("Category", "").lower() == "journal"]
    conferences = [p for p in pubs if p.get("Category", "").lower() != "journal"]

    def format_pub_list(items):
        html_items = []
        for i, item in enumerate(items, 1):
            title = item.get("Title", "")
            authors = item.get("Authors", "").replace("Cong-Thanh Vu", "<strong>Cong-Thanh Vu</strong>")
            venue = item.get("Venue/Book Title", "")
            info = item.get("Info") or item.get("Journal Info") or ""
            year = item.get("Year", "")
            note = item.get("Note", "")
            
            detail_parts = []
            if venue:
                detail_parts.append(f"<em>{venue}</em>")
            if info:
                detail_parts.append(info)
            elif note:
                detail_parts.append(f"({note})")
            elif year:
                detail_parts.append(str(year))
                
            details_str = ", ".join(detail_parts)
            
            html_items.append(f"""
            <li style="margin-bottom: 9px; line-height: 1.45;">
                <div style="font-weight: 600; color: #1e293b;">{title}</div>
                <div style="color: #475569; font-size: 0.92rem;">{authors}</div>
                <div style="color: #005bac; font-size: 0.88rem;">{details_str}</div>
            </li>
            """)
        return "".join(html_items)

    journal_html = format_pub_list(journals)
    conf_html = format_pub_list(conferences)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Curriculum Vitae - Cong-Thanh Vu, Ph.D.</title>
<style>
  @page {{
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
  }}
  * {{
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.5;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }}
  .header {{
    border-bottom: 2px solid #005bac;
    padding-bottom: 12px;
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }}
  .name {{
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
    margin: 0 0 4px 0;
  }}
  .title {{
    font-size: 11pt;
    font-weight: 600;
    color: #005bac;
    margin: 0 0 3px 0;
  }}
  .affiliation {{
    font-size: 9.5pt;
    color: #475569;
    margin: 0;
  }}
  .contact-info {{
    text-align: right;
    font-size: 9pt;
    color: #334155;
    line-height: 1.45;
  }}
  .contact-info a {{
    color: #005bac;
    text-decoration: none;
  }}
  h2 {{
    font-size: 12pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 4px;
    margin: 16px 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  h3 {{
    font-size: 10pt;
    font-weight: 700;
    color: #334155;
    margin: 12px 0 6px 0;
  }}
  .entry {{
    margin-bottom: 10px;
    page-break-inside: avoid;
  }}
  .entry-header {{
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    color: #0f172a;
  }}
  .entry-sub {{
    display: flex;
    justify-content: space-between;
    color: #475569;
    font-size: 9.5pt;
  }}
  .entry-desc {{
    font-size: 9.2pt;
    color: #334155;
    margin-top: 2px;
  }}
  ul {{
    margin: 4px 0 8px 18px;
    padding: 0;
  }}
  li {{
    margin-bottom: 4px;
  }}
  .badge {{
    display: inline-block;
    padding: 2px 6px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: 600;
    color: #334155;
  }}
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="name">Cong-Thanh Vu, Ph.D.</div>
    <div class="title">Director, Robotics and Autonomous Systems Laboratory (RASL)</div>
    <div class="affiliation">Assistant Professor, Department of Mechatronics Engineering, HAUI, Vietnam</div>
  </div>
  <div class="contact-info">
    <div><strong>Email:</strong> <a href="mailto:vuthanh.cdt@gmail.com">vuthanh.cdt@gmail.com</a></div>
    <div><strong>Website:</strong> <a href="https://vuthanhcdt.github.io/">vuthanhcdt.github.io</a></div>
    <div><strong>Google Scholar:</strong> <a href="https://scholar.google.com/citations?user=7FEW5b8AAAAJ">Cong-Thanh Vu</a></div>
    <div><strong>Location:</strong> Hanoi, Vietnam</div>
  </div>
</div>

<h2>Research Interests</h2>
<p style="margin: 0 0 12px 0; color: #334155; font-size: 9.5pt;">
  <strong>Human–Robot Interaction & Social Robotics:</strong> Adaptive companionship, proactive assistance, human-aware mobile robot navigation, and group following.<br>
  <strong>Field & Legged Robotics:</strong> Agricultural mobile robots, adaptive pesticide spraying, passive dynamic walking, and humanoid locomotion.<br>
  <strong>Robot Learning & AI:</strong> Deep reinforcement learning, continual learning for tracking, and Vision-Language-Action (VLA) multimodal models.
</p>

<h2>Education</h2>
<div class="entry">
  <div class="entry-header">
    <span>National Cheng Kung University (NCKU)</span>
    <span>Tainan, Taiwan</span>
  </div>
  <div class="entry-sub">
    <span>Ph.D. in Mechanical Engineering</span>
    <span>Mar. 2022 – Jun. 2026</span>
  </div>
</div>

<div class="entry">
  <div class="entry-header">
    <span>Hanoi University of Industry (HAUI)</span>
    <span>Hanoi, Vietnam</span>
  </div>
  <div class="entry-sub">
    <span>M.S. in Mechatronics Engineering</span>
    <span>Aug. 2019 – Jun. 2021</span>
  </div>
</div>

<div class="entry">
  <div class="entry-header">
    <span>Hanoi University of Industry (HAUI)</span>
    <span>Hanoi, Vietnam</span>
  </div>
  <div class="entry-sub">
    <span>B.S. in Mechatronics Engineering</span>
    <span>Aug. 2015 – Jun. 2019</span>
  </div>
</div>

<h2>Academic & Professional Experience</h2>
<div class="entry">
  <div class="entry-header">
    <span>Hanoi University of Industry (HAUI)</span>
    <span>Hanoi, Vietnam</span>
  </div>
  <div class="entry-sub">
    <span>Assistant Professor & Lab Director (RASL), Department of Mechatronics Engineering</span>
    <span>Aug. 2026 – Present</span>
  </div>
</div>

<div class="entry">
  <div class="entry-header">
    <span>National Cheng Kung University (NCKU)</span>
    <span>Tainan, Taiwan</span>
  </div>
  <div class="entry-sub">
    <span>Graduate Research Assistant, Department of Mechanical Engineering</span>
    <span>Mar. 2022 – Jun. 2026</span>
  </div>
</div>

<div class="entry">
  <div class="entry-header">
    <span>University of Economics - Technology for Industries (UNETI)</span>
    <span>Hanoi, Vietnam</span>
  </div>
  <div class="entry-sub">
    <span>Research Assistant, Department of Mechanical Engineering</span>
    <span>Aug. 2021 – Feb. 2022</span>
  </div>
</div>

<div class="entry">
  <div class="entry-header">
    <span>Hanoi University of Industry (HAUI)</span>
    <span>Hanoi, Vietnam</span>
  </div>
  <div class="entry-sub">
    <span>Graduate Research Assistant, Department of Mechanical Engineering</span>
    <span>Aug. 2019 – Jun. 2021</span>
  </div>
</div>

<h2>Honors & Awards</h2>
<ul>
  <li><strong>Full Scholarship</strong>, National Cheng Kung University (NCKU), Taiwan (2022 – 2026)</li>
  <li><strong>Travel Award</strong>, National Science and Technology Council (NSTC), Taiwan (2024)</li>
  <li><strong>Talent Scholarship</strong>, Foxconn Technology Group, Vietnam (2017, 2018)</li>
</ul>

<h2>Selected Publications (14 Peer-Reviewed Papers)</h2>

<h3>Refereed Journal Articles</h3>
<ol style="margin: 0 0 10px 18px; padding: 0;">
  {journal_html}
</ol>

<h3>Refereed Conference Proceedings</h3>
<ol style="margin: 0 0 10px 18px; padding: 0;">
  {conf_html}
</ol>

<h2>Professional Services & Activities</h2>
<div style="font-size: 9.5pt; color: #334155; line-height: 1.5;">
  <strong>Journal Reviewer:</strong>
  <ul>
    <li><em>IEEE/ASME Transactions on Mechatronics</em> (TMECH)</li>
    <li><em>IEEE Transactions on Systems, Man, and Cybernetics: Systems</em> (TSMC)</li>
    <li><em>Journal of the Franklin Institute</em> (JFI)</li>
  </ul>
  <strong>Conference Reviewer:</strong>
  <ul>
    <li><em>IEEE International Conference on Robotics and Automation</em> (ICRA)</li>
    <li><em>IEEE/RSJ International Conference on Intelligent Robots and Systems</em> (IROS)</li>
    <li><em>IEEE/ASME International Conference on Advanced Intelligent Mechatronics</em> (AIM)</li>
    <li><em>IEEE International Conference on Systems, Man, and Cybernetics</em> (SMC)</li>
    <li><em>IEEE-RAS International Conference on Humanoid Robots</em> (Humanoids)</li>
  </ul>
</div>

</body>
</html>
"""
    return html_content

def build_pdf():
    print("1. Loading profile data...")
    data = load_data()
    
    print("2. Generating HTML CV template...")
    html_content = generate_html(data)
    
    OUTPUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    DOCS_PDF.parent.mkdir(parents=True, exist_ok=True)
    
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html_content)
        temp_html_path = f.name
        
    try:
        print(f"3. Compiling PDF using headless Chrome...")
        cmd = [
            "google-chrome",
            "--headless=new",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={OUTPUT_PDF}",
            f"file://{temp_html_path}"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"   Success -> {OUTPUT_PDF} ({os.path.getsize(OUTPUT_PDF)} bytes)")
        
        # Copy to docs/files/
        import shutil
        shutil.copyfile(OUTPUT_PDF, DOCS_PDF)
        print(f"   Copied -> {DOCS_PDF}")
    finally:
        if os.path.exists(temp_html_path):
            os.remove(temp_html_path)

if __name__ == "__main__":
    build_pdf()
