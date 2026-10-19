# Vietnamese edition of the RASL site: exact-string replacements applied to the built English HTML.
# Written as natural academic Vietnamese rather than word-for-word. Longer / more specific strings first.
import re

NCKU = 'Đại học Quốc lập Thành Công (NCKU)'
HAUI = 'Trường Đại học Công nghiệp Hà Nội'

TITLES = {
    'Publications · RASL': 'Công bố khoa học · RASL',
    'News · RASL': 'Tin tức · RASL',
    'People · RASL': 'Thành viên · RASL',
    'Contact · RASL': 'Liên hệ · RASL',
}
DESCS = {
    'index.html': 'RASL — Phòng thí nghiệm Robot và Hệ thống Tự hành: tương tác người – robot, robot nông nghiệp, robot đi bằng chân và học máy cho robot.',
    'publications.html': 'Danh sách công bố khoa học có phản biện của RASL.',
    'news.html': 'Tin tức và hoạt động mới nhất của RASL.',
    'people.html': 'Giới thiệu thành viên của RASL.',
    'contact.html': 'Thông tin liên hệ với RASL.',
}

TR = [
    # director bio first, so shorter award names below do not split it
    ("Cong-Thanh Vu received the B.S. and M.S. degrees in mechatronics engineering from Hanoi University of Industry, Hanoi, Vietnam, in 2019 and 2021, respectively, and the Ph.D. degree in mechanical engineering from National Cheng Kung University (NCKU), Tainan, Taiwan, in 2026. He is currently the Director of the Robotics and Autonomous Systems Lab (RASL). His research interests include human–robot interaction, human-aware navigation, agricultural robots, legged locomotion, and robot learning, with a focus on robots that understand, assist, and work alongside people in real-world environments. Dr. Vu was a recipient of the Excellent Doctoral Student Award from NCKU in 2026. He serves as a reviewer for IEEE/ASME Transactions on Mechatronics, IEEE Transactions on Systems, Man, and Cybernetics: Systems, and major robotics conferences, including ICRA and IROS.",
     f'Cong-Thanh Vu nhận bằng Đại học và Thạc sĩ ngành Kỹ thuật Cơ điện tử tại {HAUI}, Hà Nội, lần lượt vào các năm 2019 và 2021, và bằng Tiến sĩ ngành Kỹ thuật Cơ khí tại {NCKU}, Đài Nam, Đài Loan, năm 2026. Hiện anh là Giám đốc Phòng thí nghiệm Robot và Hệ thống Tự hành (RASL). Các hướng nghiên cứu chính của anh gồm tương tác người – robot, điều hướng robot có nhận thức về con người, robot nông nghiệp, robot đi bằng chân và học máy cho robot, tập trung vào những robot biết thấu hiểu, hỗ trợ và làm việc cùng con người trong môi trường thực tế. Tiến sĩ Vu từng nhận Giải thưởng Nghiên cứu sinh Tiến sĩ Xuất sắc của NCKU năm 2026. Anh là phản biện cho các tạp chí IEEE/ASME Transactions on Mechatronics, IEEE Transactions on Systems, Man, and Cybernetics: Systems và các hội nghị lớn về robot như ICRA và IROS.'),
    # ---------------- home: hero ----------------
    ('Robots that <em>understand</em>, <em>adapt</em>, and work alongside people.',
     'Robot biết <em>thấu hiểu</em>, <em>thích nghi</em> và đồng hành cùng con người.'),
    ('We study intelligent robots for the real world — from companion robots that follow and assist humans, to agricultural robots in the field and legged robots that learn to walk.',
     'RASL nghiên cứu robot thông minh cho những ứng dụng thực tế: từ robot đồng hành biết đi theo và hỗ trợ con người, robot nông nghiệp làm việc ngoài đồng ruộng, đến robot đi bằng chân tự học cách di chuyển.'),
    ('<span class="dot"></span>Robotics and Autonomous Systems Lab', '<span class="dot"></span>Phòng thí nghiệm Robot và Hệ thống Tự hành'),
    ('">Publications <svg', '">Công bố khoa học <svg'),
    ('<span>Peer-reviewed papers</span>', '<span>Bài báo có phản biện</span>'),
    ('<span>Journal articles</span>', '<span>Bài báo tạp chí</span>'),
    ('<span>Conference papers</span>', '<span>Bài báo hội nghị</span>'),
    ('aria-label="Venues"', 'aria-label="Tạp chí và hội nghị"'),

    ('<div class="intro-sub">Robotics and Autonomous Systems Lab</div>', '<div class="intro-sub">Phòng thí nghiệm Robot và Hệ thống Tự hành</div>'),
    # ---------------- home: research ----------------
    ('We combine learning, perception and control so that robots can act safely and usefully in dynamic, human-centered and unstructured environments.',
     'Chúng tôi kết hợp học máy, nhận thức môi trường và điều khiển để robot hoạt động an toàn, hiệu quả trong những môi trường luôn thay đổi, thiếu cấu trúc và có sự hiện diện của con người.'),
    ('What we work on', 'Các hướng nghiên cứu'),
    ('Companion robots with adaptive interaction strategies and proactive assistance, including multimodal language-model–driven care for the elderly.',
     'Robot đồng hành có khả năng tự điều chỉnh cách tương tác và chủ động hỗ trợ con người, trong đó có hệ thống chăm sóc người cao tuổi ứng dụng mô hình ngôn ngữ đa phương thức.'),
    ('Socially compliant navigation, human-following and group-following robots that adapt to changing formations and crowded scenes.',
     'Robot di chuyển tuân theo chuẩn mực ứng xử xã hội, có thể đi theo một người hoặc cả nhóm người và linh hoạt thích ứng khi đội hình thay đổi hay khi môi trường đông đúc.'),
    ('Autonomous navigation in orchards, traversability on uneven terrain, and context-aware pesticide spraying under changing weather.',
     'Robot tự hành trong vườn cây ăn quả, vượt địa hình gồ ghề và phun thuốc bảo vệ thực vật thông minh, tự điều chỉnh theo thời tiết và điều kiện thực địa.'),
    ('Passive dynamic walking, kneed-walker guided policies, and humanoid robots that learn diverse whole-body skills.',
     'Nghiên cứu dáng đi động lực học thụ động, dùng mô hình kneed-walker để định hướng chính sách điều khiển, và giúp robot hình người học nhiều kỹ năng vận động toàn thân.'),
    ('Deep reinforcement learning for navigation and multi-robot planning, and continual learning for robust human tracking.',
     'Ứng dụng học tăng cường sâu cho bài toán điều hướng và lập kế hoạch nhiều robot, cùng phương pháp học liên tục giúp robot bám theo con người ổn định lâu dài.'),
    ('Vision–language models for scene understanding and decision making, and policy learning from synthetic video without real-world data.',
     'Dùng mô hình thị giác – ngôn ngữ để robot hiểu bối cảnh và ra quyết định, đồng thời học chính sách điều khiển từ video tổng hợp mà không cần dữ liệu thực tế.'),
    ('>Human–Robot Interaction<', '>Tương tác người – robot<'),
    ('>Human-Aware Navigation<', '>Điều hướng giữa con người<'),
    ('>Agricultural Robots<', '>Robot nông nghiệp<'),
    ('>Legged Locomotion<', '>Robot đi bằng chân<'),
    ('>Robot Learning<', '>Học máy cho robot<'),
    ('>Vision–Language–Action<', '>Thị giác – Ngôn ngữ – Hành động<'),
    ('<li>Companion robots</li>', '<li>Robot đồng hành</li>'),
    ('<li>Proactive assistance</li>', '<li>Hỗ trợ chủ động</li>'),
    ('<li>Elderly care</li>', '<li>Chăm sóc người cao tuổi</li>'),
    ('<li>Human following</li>', '<li>Đi theo người</li>'),
    ('<li>Group following</li>', '<li>Đi theo nhóm</li>'),
    ('<li>Social navigation</li>', '<li>Điều hướng xã hội</li>'),
    ('<li>Orchard navigation</li>', '<li>Tự hành trong vườn cây</li>'),
    ('<li>Adaptive spraying</li>', '<li>Phun thuốc thích ứng</li>'),
    ('<li>Uneven terrain</li>', '<li>Địa hình gồ ghề</li>'),
    ('<li>Passive walking</li>', '<li>Dáng đi thụ động</li>'),
    ('<li>Humanoids</li>', '<li>Robot hình người</li>'),
    ('<li>Whole-body skills</li>', '<li>Kỹ năng toàn thân</li>'),
    ('<li>Deep RL</li>', '<li>Học tăng cường sâu</li>'),
    ('<li>Multi-robot planning</li>', '<li>Lập kế hoạch nhiều robot</li>'),
    ('<li>Continual learning</li>', '<li>Học liên tục</li>'),
    ('<li>Vision–language models</li>', '<li>Mô hình thị giác – ngôn ngữ</li>'),
    ('<li>Scene reasoning</li>', '<li>Hiểu bối cảnh</li>'),
    ('<li>Synthetic video</li>', '<li>Video tổng hợp</li>'),

    # ---------------- news ----------------
    ('Cong-Thanh Vu received the Excellent Doctoral Student Award from National Cheng Kung University (NCKU), Taiwan.',
     f'Cong-Thanh Vu vinh dự nhận Giải thưởng Nghiên cứu sinh Tiến sĩ Xuất sắc do {NCKU}, Đài Loan trao tặng.'),
    ('Excellent Doctoral Student Award', 'Giải thưởng Nghiên cứu sinh Tiến sĩ Xuất sắc'),
    ('Paper accepted to IEEE TSMC: Systems', 'Bài báo được chấp nhận đăng trên IEEE TSMC: Systems'),
    ('Adaptive interaction strategies for human companion robots via deep reinforcement learning.',
     'Nghiên cứu chiến lược tương tác thích ứng cho robot đồng hành bằng học tăng cường sâu.'),
    ('Paper published in COMPAG', 'Bài báo được xuất bản trên tạp chí COMPAG'),
    ('Context-aware adaptive pesticide spraying for agricultural robots using vision–language models, Vol. 252.',
     'Phun thuốc bảo vệ thực vật thích ứng theo bối cảnh cho robot nông nghiệp bằng mô hình thị giác – ngôn ngữ (Tập 252).'),
    ('Paper accepted to IEEE/RSJ IROS 2026', 'Bài báo được chấp nhận tại hội nghị IEEE/RSJ IROS 2026'),
    ('Adaptive companionship for group-following robots — see you in Pittsburgh, USA.',
     'Robot đồng hành thích ứng khi đi theo nhóm người có đội hình thay đổi — báo cáo tại Pittsburgh, Hoa Kỳ.'),
    ('Three papers accepted to IEEE/ASME AIM 2026', 'Ba bài báo được chấp nhận tại hội nghị IEEE/ASME AIM 2026'),
    ('Gimbal-based human tracking, VLM-driven elderly care, and humanoid learning from synthetic video — Genova, Italy.',
     'Gồm bám theo người bằng gimbal, robot chăm sóc người cao tuổi dùng VLM và robot hình người học từ video tổng hợp — Genova, Ý.'),
    ('Presented at IROS 2025 and Humanoids 2025', 'Báo cáo tại hội nghị IROS 2025 và Humanoids 2025'),
    ('Human-following with deep RL (Hangzhou, China) and learning virtual passive dynamic walking.',
     'Robot đi theo người bằng học tăng cường sâu (Hàng Châu, Trung Quốc) và học dáng đi động lực học thụ động ảo.'),
    ('Latest updates', 'Tin mới nhất'),
    ('Recent papers', 'Bài báo gần đây'),
    ('View all', 'Xem tất cả'),

    # ---------------- join / contact ----------------
    ('Students interested in robot learning, human–robot interaction or field robotics are welcome to get in touch.',
     'Chúng tôi luôn chào đón các bạn sinh viên quan tâm đến học máy cho robot, tương tác người – robot và robot thực địa.'),
    ('>Join RASL<', '>Tham gia RASL<'),
    ('<h1>Get in touch</h1>', '<h1>Liên hệ với chúng tôi</h1>'),
    ('>Get in touch<', '>Liên hệ ngay<'),
    ('>Apply now<', '>Ứng tuyển ngay<'),
    ('For collaborations, research questions or joining the lab:', 'Về hợp tác, trao đổi nghiên cứu hoặc tham gia RASL:'),
    ('</span>Online</h3>', '</span>Trực tuyến</h3>'),
    (' for citations and full-text links.', ' để xem số trích dẫn và bản đầy đủ của các bài báo.'),

    # ---------------- publications page ----------------
    ('aria-label="Filter by type"', 'aria-label="Lọc theo loại công bố"'),
    ('aria-pressed="true">All<', 'aria-pressed="true">Tất cả<'),
    ('data-f="Journal" aria-pressed="false">Journal<', 'data-f="Journal" aria-pressed="false">Tạp chí<'),
    ('data-f="Conference" aria-pressed="false">Conference<', 'data-f="Conference" aria-pressed="false">Hội nghị<'),
    ('placeholder="Search by title, keyword, author, venue, year or DOI…"', 'placeholder="Tìm theo tên bài, từ khoá, tác giả, tạp chí/hội nghị, năm hoặc DOI…"'),
    ('aria-label="Search publications by title, keyword, author, venue, year or DOI"', 'aria-label="Tìm công bố theo tên bài, từ khoá, tác giả, tạp chí/hội nghị, năm hoặc DOI"'),
    ('<span>Try:</span>', '<span>Gợi ý:</span>'),

    # ---------------- people page ----------------
    ('>Leadership<', '>Lãnh đạo<'),
    ('<h2>Director</h2>', '<h2>Giám đốc</h2>'),
    ('Director · RASL', 'Giám đốc · RASL'),
    ('Director, Robotics and Autonomous Systems Lab (RASL)', 'Giám đốc Phòng thí nghiệm Robot và Hệ thống Tự hành (RASL)'),
    ('alt="Portrait of Cong-Thanh Vu"', 'alt="Ảnh chân dung Cong-Thanh Vu"'),
    ('<h4>Education</h4>', '<h4>Học vấn</h4>'),
    ('<h4>Honors &amp; Awards</h4>', '<h4>Giải thưởng &amp; Học bổng</h4>'),
    ('<h4>Professional Service</h4>', '<h4>Hoạt động học thuật</h4>'),
    ('Ph.D., Mechanical Engineering', 'Tiến sĩ – Kỹ thuật Cơ khí'),
    ('M.S., Mechatronics Engineering', 'Thạc sĩ – Kỹ thuật Cơ điện tử'),
    ('B.S., Mechatronics Engineering', 'Đại học – Kỹ thuật Cơ điện tử'),
    ('National Cheng Kung University, Taiwan', f'{NCKU}, Đài Loan'),
    ('Hanoi University of Industry, Vietnam', HAUI),
    ('Advisor: Prof. Yen-Chen Liu', 'Người hướng dẫn: GS. Yen-Chen Liu'),
    ('Advisor: Assoc. Prof. Anh-Tu Nguyen', 'Người hướng dẫn: PGS. Anh-Tu Nguyen'),
    ('<b>Full Scholarship</b>', '<b>Học bổng toàn phần</b>'),
    ('<b>Travel Award</b>', '<b>Học bổng tham dự hội nghị quốc tế</b>'),
    ('NSTC, Taiwan', 'Hội đồng Khoa học và Công nghệ Quốc gia (NSTC), Đài Loan'),
    ('Bronze Award, Smart Manufacturing Data Competition', 'Giải Đồng – Cuộc thi Dữ liệu Sản xuất Thông minh'),
    ('NCKU Alliance, MOE Smart Manufacturing Talent Program, Taiwan', 'Liên minh NCKU, Chương trình đào tạo nhân tài sản xuất thông minh của Bộ Giáo dục Đài Loan'),
    ('Award, ABU Robocon Vietnam', 'Giải thưởng Robocon Việt Nam'),
    ('National robot contest, ABU Asia-Pacific Robot Contest', 'Cuộc thi Sáng tạo Robot Việt Nam, vòng loại ABU Robocon châu Á – Thái Bình Dương'),
    ('<b>Talent Scholarship</b>', '<b>Học bổng Tài năng</b>'),
    ('<span>Foxconn Technology Group</span>', '<span>Tập đoàn Foxconn</span>'),
    ('<span>National Cheng Kung University</span>', f'<span>{NCKU}</span>'),
    ('<em>Journals</em>', '<em>Tạp chí</em>'),
    ('<em>Conferences</em>', '<em>Hội nghị</em>'),
    ('<b>Reviewer</b>', '<b>Phản biện bài báo</b>'),

    # ---------------- chrome (nav, search, footer) ----------------
    ('aria-label="Search the site"', 'aria-label="Tìm kiếm trên trang"'),
    ('<span>Search</span>', '<span>Tìm kiếm</span>'),
    ('aria-label="Toggle dark mode"', 'aria-label="Bật/tắt giao diện tối"'),
    ('aria-label="Open menu"', 'aria-label="Mở menu"'),
    ('aria-label="Language"', 'aria-label="Ngôn ngữ"'),
    ('>Research<', '>Nghiên cứu<'),
    ('>Publications<', '>Công bố khoa học<'),
    ('>News<', '>Tin tức<'),
    ('>People<', '>Thành viên<'),
    ('>Contact<', '>Liên hệ<'),
]

MON = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
NAV_VI = [('Publications','Công bố khoa học'),('News','Tin tức'),('People','Thành viên'),('Contact','Liên hệ')]

def translate(html, page):
    for a, b in TR:
        html = html.replace(a, b)
    for a, b in TITLES.items():
        html = html.replace(f'<title>{a}</title>', f'<title>{b}</title>')
    if page in DESCS:
        html = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{DESCS[page]}">', html, count=1)
    html = re.sub(r'\n *<p class="page-sub">.*?</p>', '', html)   # no hero subtitle on Vietnamese pages
    for en, vi in NAV_VI:                                   # breadcrumbs + page titles
        html = html.replace(f'</a> / {en}', f'</a> / {vi}').replace(f'<h1>{en}</h1>', f'<h1>{vi}</h1>')
    # dates: timeline "Oct 2026" -> "Tháng 10/2026"; news tiles <b>Oct</b> -> "T10"; people "Oct 2026" -> "10/2026"
    m2 = lambda m, f: f(MON[m.group(1)], m.group(2)) if m.group(1) in MON else m.group(0)
    html = re.sub(r'<time>(\w{3}) (\d{4})</time>', lambda m: m2(m, lambda mo, y: f'<time>Tháng {mo}/{y}</time>'), html)
    html = re.sub(r'<b>(\w{3})</b><span>(\d{4})</span>', lambda m: m2(m, lambda mo, y: f'<b>T{mo}</b><span>{y}</span>'), html)
    html = re.sub(r'<em>(\w{3}) (\d{4})</em>', lambda m: m2(m, lambda mo, y: f'<em>{mo:02d}/{y}</em>'), html)
    return html

def translate_text(s):
    """For search-index strings (plain text, no tags)."""
    for a, b in TR:
        a2, b2 = re.sub(r'<[^>]+>', '', a).strip('>< '), re.sub(r'<[^>]+>', '', b).strip('>< ')
        if a2 and '"' not in a2 and '=' not in a2:
            s = s.replace(a2, b2)
    return s
