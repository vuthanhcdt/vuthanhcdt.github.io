/*
  RASL members — one entry per person.
  The CV page (cv.html?m=<id>) is generated automatically from this file
  (`badge` — a string or a list — on an education entry is shown only in the password-protected full CV)
  plus every paper in pubs.js whose author list contains `pubName`.

  To add a member: copy the block below, give it a new `id`, fill in the fields,
  and link to it with  cv.html?m=<id>  (e.g. from the People page).
  Leave out any section the person does not have yet.
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
    summary: "Robotics researcher working on robots that act alongside people and in unstructured environments: human–robot interaction, human-aware navigation, agricultural robots, legged locomotion, and learning-based control with deep reinforcement learning and vision–language models.",
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
    ]
  }
];
