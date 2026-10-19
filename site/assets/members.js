/*
  RASL members — one entry per person.
  The CV page (cv.html?m=<id>) is generated automatically from this file
  (`badge` — a string or a list — on an education entry is shown only in the password-protected full CV)
  plus every paper in pubs.js whose author list contains `pubName`.

  To add a member: copy the block below, give it a new `id`, fill in the fields,
  and link to it with  cv.html?m=<id>  (e.g. from the People page).
  Leave out any section the person does not have yet.

  Vietnamese CV (cv.html?m=<id>&lang=vi): the optional `vi` block overrides text fields. Its lists are matched
  to the English ones by position, so only the translated fields (what / where / badge / advisor name) are needed.
  `summary` (EN and VI) is overwritten by tools/build.py with the bio on the People page — edit it there.
  Dates such as "Mar 2022" are converted to "03/2022" automatically; paper titles stay in English.
*/
/* Conference venues listed under "Top-tier Conferences" in every CV (short names as in pubs.js). */
window.TOP_TIER = ["IROS", "ICRA", "RSS", "CoRL"];

window.MEMBERS = [
  {
    id: "vu",
    name: "Cong-Thanh Vu",
    suffix: "Ph.D.",
    pubName: "Cong-Thanh Vu",
    website: "https://vuthanhcdt.github.io/",
    role: "Director, RASL — Robotics and Autonomous Systems Lab",
    photo: "assets/avatar-cutout.png?v=1",
    contact: [
      { label: "Email", text: "vuthanh.cdt@gmail.com", url: "mailto:vuthanh.cdt@gmail.com" },
      { label: "Google Scholar", text: "Cong-Thanh Vu", url: "https://scholar.google.com/citations?user=7FEW5b8AAAAJ" }
    ],
    summary: "Cong-Thanh Vu received the B.S. and M.S. degrees in mechatronics engineering from Hanoi University of Industry, Hanoi, Vietnam, in 2019 and 2021, respectively, and the Ph.D. degree in mechanical engineering from National Cheng Kung University (NCKU), Tainan, Taiwan, in 2026. His research interests include human–robot interaction, human-aware and social navigation in crowded environments, agricultural robots, legged locomotion, and robot learning, with a focus on robots that understand, assist, and work alongside people in real-world environments. Dr. Vu was a recipient of the Excellent Doctoral Student Award from NCKU in 2026. He serves as a reviewer for IEEE/ASME Transactions on Mechatronics, IEEE Transactions on Systems, Man, and Cybernetics: Systems, and major robotics conferences, including ICRA and IROS.",
    interests: ["Human–Robot Interaction", "Human-Aware Navigation", "Agricultural Robots", "Legged Locomotion", "Robot Learning", "Vision–Language–Action"],
    education: [
      { when: "2022 – 2026", what: "Ph.D. in Mechanical Engineering", where: "National Cheng Kung University (NCKU), Tainan, Taiwan", badge: "QS World Top 200", advisor: { name: "Prof. Yen-Chen Liu", url: "https://scholar.google.com/citations?user=D5p2j08AAAAJ" } },
      { when: "2019 – 2021", what: "M.S. in Mechatronics Engineering", where: "Hanoi University of Industry, Hanoi, Vietnam", advisor: { name: "Assoc. Prof. Anh-Tu Nguyen", url: "https://scholar.google.com/citations?user=2jZTByoAAAAJ" } },
      { when: "2015 – 2019", what: "B.S. in Mechatronics Engineering", where: "Hanoi University of Industry, Hanoi, Vietnam", advisor: { name: "Assoc. Prof. Anh-Tu Nguyen", url: "https://scholar.google.com/citations?user=2jZTByoAAAAJ" } }
    ],
    experience: [
      { when: "Mar 2022 – Jun 2026", what: "Graduate Research Assistant", where: "Department of Mechanical Engineering, National Cheng Kung University, Taiwan" },
      { when: "Aug 2021 – Feb 2022", what: "Research Assistant", where: "Department of Mechanical Engineering, University of Economics – Technology for Industries, Vietnam" },
      { when: "Aug 2019 – Jun 2021", what: "Graduate Research Assistant", where: "Department of Mechanical Engineering, Hanoi University of Industry, Vietnam" }
    ],
    honors: [
      { when: "Oct 2026", what: "Excellent Doctoral Student Award", where: "National Cheng Kung University" },
      { when: "2022 – 2026", what: "Full Scholarship", where: "National Cheng Kung University" },
      { when: "2024", what: "Travel Award", where: "National Science and Technology Council (NSTC), Taiwan" },
      { when: "2024", what: "Bronze Award, Smart Manufacturing Data Competition", where: "NCKU Alliance, Ministry of Education (MOE) Smart Manufacturing Cross-Domain Talent Cultivation Program, Taiwan" },
      { when: "2018, 2019", what: "Award, ABU Robocon Vietnam", where: "Vietnam national round of the ABU Asia-Pacific Robot Contest" },
      { when: "2017, 2018", what: "Talent Scholarship", where: "Foxconn Technology Group" }
    ],
    service: [
      { what: "Journal reviewer", where: "IEEE/ASME Transactions on Mechatronics; IEEE Transactions on Systems, Man, and Cybernetics: Systems; Journal of the Franklin Institute" },
      { what: "Conference reviewer", where: "ICRA, IROS, AIM, SMC, Humanoids" }
    ],
    vi: {
      name: "Vũ Công Thành",
      suffix: "",
      prefix: "TS.",
      role: "Giám đốc RASL — Phòng thí nghiệm Robot và Hệ thống Tự hành",
      summary: "Vũ Công Thành nhận bằng Đại học và Thạc sĩ ngành Kỹ thuật Cơ điện tử tại Trường Đại học Công nghiệp Hà Nội, Hà Nội, lần lượt vào các năm 2019 và 2021, và bằng Tiến sĩ ngành Kỹ thuật Cơ khí tại Đại học Quốc lập Thành Công (NCKU), Đài Nam, Đài Loan, năm 2026. Các hướng nghiên cứu chính của anh gồm tương tác người – robot, điều hướng có nhận thức về con người và điều hướng xã hội trong môi trường đông người, robot nông nghiệp, robot đi bằng chân và học máy cho robot, tập trung vào những robot biết thấu hiểu, hỗ trợ và làm việc cùng con người trong môi trường thực tế. Anh từng nhận Giải thưởng Nghiên cứu sinh Tiến sĩ Xuất sắc của NCKU năm 2026. Anh là phản biện cho các tạp chí IEEE/ASME Transactions on Mechatronics, IEEE Transactions on Systems, Man, and Cybernetics: Systems và các hội nghị lớn về robot như ICRA và IROS.",
      interests: ["Tương tác người – robot", "Điều hướng giữa con người", "Robot nông nghiệp", "Robot đi bằng chân", "Học máy cho robot", "Vision–Language–Action"],
      education: [
        { what: "Tiến sĩ ngành Kỹ thuật Cơ khí", where: "Đại học Quốc lập Thành Công (NCKU), Đài Nam, Đài Loan", badge: "Top 200 thế giới (QS)", advisor: { name: "GS. Yen-Chen Liu" } },
        { what: "Thạc sĩ ngành Kỹ thuật Cơ điện tử", where: "Trường Đại học Công nghiệp Hà Nội, Hà Nội, Việt Nam", advisor: { name: "PGS. Anh-Tu Nguyen" } },
        { what: "Đại học ngành Kỹ thuật Cơ điện tử", where: "Trường Đại học Công nghiệp Hà Nội, Hà Nội, Việt Nam", advisor: { name: "PGS. Anh-Tu Nguyen" } }
      ],
      experience: [
        { what: "Trợ lý nghiên cứu (nghiên cứu sinh)", where: "Khoa Cơ khí, Đại học Quốc lập Thành Công, Đài Loan" },
        { what: "Trợ lý nghiên cứu", where: "Khoa Cơ khí, Trường Đại học Kinh tế – Kỹ thuật Công nghiệp, Việt Nam" },
        { what: "Trợ lý nghiên cứu (học viên cao học)", where: "Khoa Cơ khí, Trường Đại học Công nghiệp Hà Nội, Việt Nam" }
      ],
      honors: [
        { what: "Giải thưởng Nghiên cứu sinh Tiến sĩ Xuất sắc", where: "Đại học Quốc lập Thành Công" },
        { what: "Học bổng toàn phần", where: "Đại học Quốc lập Thành Công" },
        { what: "Học bổng tham dự hội nghị quốc tế", where: "Hội đồng Khoa học và Công nghệ Quốc gia (NSTC), Đài Loan" },
        { what: "Giải Đồng – Cuộc thi Dữ liệu Sản xuất Thông minh", where: "Liên minh NCKU, Chương trình đào tạo nhân tài liên ngành sản xuất thông minh của Bộ Giáo dục (MOE), Đài Loan" },
        { what: "Giải thưởng Robocon Việt Nam", where: "Vòng loại quốc gia của Cuộc thi Sáng tạo Robot châu Á – Thái Bình Dương (ABU Robocon)" },
        { what: "Học bổng Tài năng", where: "Tập đoàn Foxconn" }
      ],
      service: [
        { what: "Phản biện tạp chí", where: "IEEE/ASME Transactions on Mechatronics; IEEE Transactions on Systems, Man, and Cybernetics: Systems; Journal of the Franklin Institute" },
        { what: "Phản biện hội nghị", where: "ICRA, IROS, AIM, SMC, Humanoids" }
      ]
    }
  }
];
