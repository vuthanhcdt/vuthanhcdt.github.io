(function () {
  const linkColumns = new Set(["Download Link", "Slide Link", "Lecture Material Links", "Link", "Tutorial Site", "Explorer", "Event Link", "Website"]);
  const compactColumns = new Set(["Year", "Date", "Published Date", "Semester", "Code", "Types", "Category"]);
  const linkLabels = {
    "Download Link": "Paper",
    "Lecture Material Links": "Material",
    "Link": "Blog",
    "Tutorial Site": "Tutorial Site",
    "Explorer": "Explorer",
    "Event Link": "Event",
    "Website": "Website",
  };
  const publicationBadgeColumns = ["Year", "Types", "Category"];
  const publicationFilters = {
    type: [
      { value: "all", label: "All" },
      { value: "International", label: "International" },
      { value: "Domestic", label: "Domestic" },
    ],
    category: [
      { value: "all", label: "All" },
      { value: "Journal", label: "Journal" },
      { value: "Conference", label: "Conference" },
      { value: "Workshop", label: "Workshop" },
      { value: "Book", label: "Book" },
    ],
  };

  const state = {
    data: null,
    filters: {},
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[-\s]+/g, "-");
  }

  function isUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
  }

  function isInternalPath(value) {
    return /^\//.test(String(value || "").trim());
  }

  function isLocalPreview() {
    const host = String(window.location && window.location.hostname ? window.location.hostname : "").toLowerCase();
    return host === "127.0.0.1" || host === "localhost" || host === "0.0.0.0";
  }

  function localPreviewHref(value) {
    const text = String(value || "").trim();
    if (!isUrl(text) || !isLocalPreview()) return text;
    try {
      const url = new URL(text);
      return url.hostname === "gisbi-kim.github.io" ? url.pathname + url.search + url.hash : text;
    } catch (_error) {
      return text;
    }
  }

  function hostLabel(value) {
    try {
      return new URL(value).hostname.replace(/^www\./, "");
    } catch (_error) {
      return "Open";
    }
  }

  function renderValue(column, value, labelOverride) {
    if (!value) return "";
    const text = String(value).trim();
    const href = localPreviewHref(text);
    const linkTarget = isUrl(href) ? ' target="_blank" rel="noopener"' : "";
    if (linkColumns.has(column) && (isUrl(text) || isInternalPath(text))) {
      const host = hostLabel(text);
      const label = labelOverride || linkLabels[column] || (host.includes("dropbox.com") ? "Material" : `Open ${host}`);
      return `<a class="profile-data-link" href="${escapeHtml(href)}"${linkTarget}>${escapeHtml(label)}</a>`;
    }
    if (isUrl(text)) {
      return `<a href="${escapeHtml(href)}"${linkTarget}>${escapeHtml(text)}</a>`;
    }
    return escapeHtml(text);
  }

  function popupColumn(row, defaultColumn) {
    const popupImage = String(row["Popup Image"] || "").trim();
    if (!popupImage) return "";
    return String(row["Popup Trigger"] || defaultColumn || "").trim();
  }

  function renderPopupValue(row, column, valueHtml) {
    const popupImage = String(row["Popup Image"] || "").trim();
    if (!popupImage) return valueHtml;
    return `<button class="profile-data-title-button" type="button" data-talk-popup-image="${escapeHtml(popupImage)}" data-talk-popup-title="${escapeHtml(row[column])}">${valueHtml}</button>`;
  }

  function renderPopupTitle(row, primary) {
    const title = renderValue(primary, row[primary]);
    return popupColumn(row, primary) === primary ? renderPopupValue(row, primary, title) : title;
  }

  function renderAuthors(value) {
    return escapeHtml(value)
      .replace(/\bCong-Thanh Vu\b/g, "<strong>Cong-Thanh Vu</strong>")
      .replace(/\bThanh Vu\b/g, "<strong>Thanh Vu</strong>")
      .replace(/\bVũ Công Thành\b/g, "<strong>Vũ Công Thành</strong>")
      .replace(/\bVu Thanh\b/g, "<strong>Vu Thanh</strong>");
  }

  function renderTeachingCourse(value) {
    const text = String(value || "").trim();
    const match = text.match(/^(.*?)\s*\(([^()]*)\)$/);
    if (!match) return escapeHtml(text);
    return `${escapeHtml(match[1])}<br><span class="profile-data-course-korean">(${escapeHtml(match[2])})</span>`;
  }

  function renderTeachingTa(value) {
    return escapeHtml(value)
      .replace(
        /\bCong-Thanh Vu\b/g,
        '<a href="https://scholar.google.com/citations?user=7FEW5b8AAAAJ" target="_blank" rel="noopener">Cong-Thanh Vu</a>'
      );
  }

  function renderRecipient(value) {
    return escapeHtml(value).replace(
      /\bCong-Thanh Vu\b/g,
      '<a href="https://scholar.google.com/citations?user=7FEW5b8AAAAJ" target="_blank" rel="noopener">Cong-Thanh Vu</a>'
    );
  }

  function renderEvent(row) {
    const event = String(row.Event || "").trim();
    const link = String(row["Event Link"] || "").trim();
    if (link && isUrl(link)) {
      return `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(event)}</a>`;
    }
    return escapeHtml(event);
  }

  function renderTalkInvitation(value) {
    return renderTalkConferenceLinks(value)
      .replace(
        /\bDaeun Song\b/g,
        '<a href="https://robotics.ewha.ac.kr/" target="_blank" rel="noopener">Daeun Song</a>'
      )
      .replace(
        /\bWansoo Kim\b/g,
        '<a href="https://harco.hanyang.ac.kr/" target="_blank" rel="noopener">Wansoo Kim</a>'
      )
      .replace(
        /\bSunglok Choi\b/g,
        '<a href="https://mint-lab.github.io/" target="_blank" rel="noopener">Sunglok Choi</a>'
      )
      .replace(
        /\bHyeonwoo Yu\b/g,
        '<a href="https://sites.google.com/view/hyeonwooyu/" target="_blank" rel="noopener">Hyeonwoo Yu</a>'
      )
      .replace(
        /\bYounghun Cho\b/g,
        '<a href="https://dudgnsrj.github.io/" target="_blank" rel="noopener">Younghun Cho</a>'
      )
      .replace(
        /\bTae-Hyuk Kwon\b/g,
        '<a href="https://kwon.kaist.ac.kr/" target="_blank" rel="noopener">Tae-Hyuk Kwon</a>'
      )
      .replace(
        /\bURobotics\b/g,
        '<a href="https://urobotics.ai/" target="_blank" rel="noopener">URobotics</a>'
      );
  }

  function renderTalkConferenceLinks(value) {
    return escapeHtml(value)
      .replace(
        /\bIROS 2026\b/g,
        '<a href="https://2026.ieee-iros.org/" target="_blank" rel="noopener">IROS 2026</a>'
      )
      .replace(
        /\bIROS 2025\b/g,
        '<a href="https://www.iros25.org/" target="_blank" rel="noopener">IROS 2025</a>'
      )
      .replace(
        /\bAIM 2026\b/g,
        '<a href="https://aim2026.com/" target="_blank" rel="noopener">AIM 2026</a>'
      )
      .replace(
        /\bICRA 2026\b/g,
        '<a href="https://2026.ieee-icra.org/" target="_blank" rel="noopener">ICRA 2026</a>'
      )
      .replace(
        /\bICROS 2026\b/g,
        '<a href="https://2026.icros.org/" target="_blank" rel="noopener">ICROS 2026</a>'
      );
  }

  function renderTalkEventSession(row) {
    const eventSession = String(row["Event/Session"] || "").trim();
    const eventLink = String(row["Event Link"] || "").trim();
    if (eventSession && eventLink && isUrl(eventLink)) {
      return `<a href="${escapeHtml(eventLink)}" target="_blank" rel="noopener">${escapeHtml(eventSession)}</a>`;
    }
    return renderTalkConferenceLinks(eventSession);
  }

  function publicationFigure(row) {
    const figure = String(row.Figure || "/images/publication-dummy.svg").trim();
    const alt = `Figure for ${String(row.Title || "publication").trim()}`;
    return `<a class="profile-data-publication-figure" href="${escapeHtml(figure)}" target="_blank" rel="noopener"><img src="${escapeHtml(figure)}" alt="${escapeHtml(alt)}" loading="lazy"></a>`;
  }

  function cardFigure(row, fallback, label) {
    const figure = String(row.Figure || fallback).trim();
    const alt = `Figure for ${String(row.Project || row.Title || label).trim()}`;
    return `<a class="profile-data-publication-figure" href="${escapeHtml(figure)}" target="_blank" rel="noopener"><img src="${escapeHtml(figure)}" alt="${escapeHtml(alt)}" loading="lazy"></a>`;
  }

  function titleColumn(columns) {
    return columns.find((column) => ["Project", "Title", "Course"].includes(column)) || columns[0];
  }

  function metaColumns(columns, primary) {
    return columns.filter((column) => column !== primary && !linkColumns.has(column));
  }

  function actionColumns(columns) {
    return columns.filter((column) => linkColumns.has(column));
  }

  function visibleRows(rows) {
    return rows.filter((row) => !Object.values(row).some((value) => String(value || "").trim() === "EOL"));
  }

  function filtersFor(key) {
    if (!state.filters[key]) {
      state.filters[key] = {
        type: "all",
        category: "all",
        year: "all",
        fromYear: "all",
        toYear: "all",
        venue: "all",
        tag: "all",
        rasl: "all",
      };

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("venue")) state.filters[key].venue = params.get("venue");
        if (params.get("year")) state.filters[key].year = params.get("year");
        if (params.get("from")) state.filters[key].fromYear = params.get("from");
        if (params.get("to")) state.filters[key].toYear = params.get("to");
        if (params.get("type")) state.filters[key].type = params.get("type");
        if (params.get("category")) {
          const cat = params.get("category");
          state.filters[key].category = cat === "all" ? "all" : [cat];
        }

        if (window.location.hash) {
          const hash = window.location.hash.slice(1);
          if (hash.startsWith("venue=")) {
            state.filters[key].venue = decodeURIComponent(hash.split("=")[1]);
          } else if (hash.startsWith("year=")) {
            state.filters[key].year = decodeURIComponent(hash.split("=")[1]);
          }
        }
      }
    }
    return state.filters[key];
  }

  function selectedCategories(filters) {
    if (Array.isArray(filters.category)) return filters.category;
    if (typeof filters.category === "string" && filters.category !== "all") return [filters.category];
    return [];
  }

  function publicationBaseMatch(row, filters) {
    const typeMatch = filters.type === "all" || row.Types === filters.type;
    const category = String(row.Category || "");
    const categories = selectedCategories(filters);
    const categoryMatch =
      filters.category === "all" || !categories.length || categories.some((selected) => category.toLowerCase().includes(selected.toLowerCase()));
    const raslMatch = !filters.rasl || filters.rasl === "all" || (row.Authors && /Cong-Thanh Vu/i.test(row.Authors));
    return typeMatch && categoryMatch && raslMatch;
  }

  function applyPublicationFilters(rows, filters) {
    return rows.filter((row) => {
      const baseMatch = publicationBaseMatch(row, filters);
      const rowY = Number(publicationYear(row));
      const singleYearMatch = filters.year === "all" || String(rowY) === String(filters.year);
      const fromY = filters.fromYear && filters.fromYear !== "all" && !isNaN(Number(filters.fromYear)) ? Number(filters.fromYear) : -Infinity;
      const toY = filters.toYear && filters.toYear !== "all" && !isNaN(Number(filters.toYear)) ? Number(filters.toYear) : Infinity;
      const rangeMatch = rowY >= fromY && rowY <= toY;
      const venueMatch = filters.venue === "all" || venueShortName(row["Venue/Book Title"]) === filters.venue;
      return baseMatch && singleYearMatch && rangeMatch && venueMatch;
    });
  }

  function applyPublicationBaseFilters(rows, filters) {
    return rows.filter((row) => publicationBaseMatch(row, filters));
  }

  function essayTags(row) {
    return String(row.Tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function applyEssayFilters(rows, filters) {
    return filters.tag === "all" ? rows : rows.filter((row) => essayTags(row).includes(filters.tag));
  }

  function talkType(row) {
    const talkContext = `${row["Event/Session"] || ""} ${row["Invitation From"] || ""}`;
    if (/(IROS|KRoC|ICEIC|Conference|Summer School|Award Session)/i.test(talkContext)) return "Conference";
    if (/Hyundai Motor Company|Mobile Robotics Team|URobotics/i.test(`${row["Host / Venue"] || ""} ${row["Invitation From"] || ""}`)) return "Industry";
    if (/Daegu's Innovation, Moving Towards a Robot and Future Mobility City/i.test(String(row.Title || ""))) return "Public Sector";
    if (/^Prof\./i.test(String(row["Invitation From"] || "").trim())) return "University";
    if (/ETRI/i.test(`${row["Host / Venue"] || ""} ${row["Invitation From"] || ""}`)) return "Research Institute";
    if (/^Dr\./i.test(String(row["Invitation From"] || "").trim())) return "Research Institute";
    return "Other";
  }

  function applyTalkFilters(rows, filters) {
    return rows.filter((row) => {
      const matchesType = !filters.talkType || filters.talkType === "all" || talkType(row) === filters.talkType;
      const matchesYear = !filters.talkYear || filters.talkYear === "all" || rowYear({ title: "Invited Talks" }, row) === filters.talkYear;
      return matchesType && matchesYear;
    });
  }

  function renderSegmentedFilter(key, group, label, options, activeValue) {
    const buttons = options
      .map((option) => {
        const active = option.value === activeValue ? " is-active" : "";
        const pressed = option.value === activeValue ? "true" : "false";
        return `<button class="profile-data-filter-button${active}" type="button" data-profile-key="${escapeHtml(key)}" data-profile-filter="${escapeHtml(group)}" data-profile-filter-value="${escapeHtml(option.value)}" aria-pressed="${pressed}">${escapeHtml(option.label)}</button>`;
      })
      .join("");
    return `<div class="profile-data-filter-group"><span>${escapeHtml(label)}</span><div class="profile-data-filter-buttons">${buttons}</div></div>`;
  }

  function renderMultiSelectFilter(key, group, label, options, activeValue) {
    const values = Array.isArray(activeValue) ? activeValue : [];
    const buttons = options
      .map((option) => {
        const active = option.value === "all" ? activeValue === "all" : activeValue !== "all" && values.includes(option.value);
        return `<button class="profile-data-filter-button${active ? " is-active" : ""}" type="button" data-profile-key="${escapeHtml(key)}" data-profile-filter="${escapeHtml(group)}" data-profile-filter-value="${escapeHtml(option.value)}" data-profile-filter-multi="true" aria-pressed="${active ? "true" : "false"}">${escapeHtml(option.label)}</button>`;
      })
      .join("");
    return `<div class="profile-data-filter-group"><span>${escapeHtml(label)}</span><div class="profile-data-filter-buttons">${buttons}</div></div>`;
  }

  function renderPublicationFilters(key, filters) {
    return `<div class="profile-data-filters" aria-label="Publication filters">
      ${renderSegmentedFilter(key, "type", "Type", publicationFilters.type, filters.type)}
      ${renderMultiSelectFilter(key, "category", "Category", publicationFilters.category, filters.category)}
    </div>`;
  }

  function renderEssayFilters(key, rows, filters) {
    const tags = Array.from(new Set(rows.flatMap(essayTags))).sort((a, b) => a.localeCompare(b));
    const options = [{ value: "all", label: "All" }, ...tags.map((tag) => ({ value: tag, label: tag }))];
    return `<div class="profile-data-filters" aria-label="Essay filters">
      ${renderSegmentedFilter(key, "tag", "Tag", options, filters.tag)}
    </div>`;
  }

  function renderTalkFilters(key, rows, filters) {
    const preferred = ["Conference", "University", "Research Institute", "Industry", "Public Sector", "Other"];
    const present = new Set(rows.map(talkType));
    const options = [{ value: "all", label: "All" }, ...preferred.filter((type) => present.has(type)).map((type) => ({ value: type, label: type }))];
    const years = Array.from(new Set(rows.map((row) => rowYear({ title: "Invited Talks" }, row)).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
    const yearOptions = [{ value: "all", label: "All" }, ...years.map((year) => ({ value: year, label: year }))];
    return `<div class="profile-data-filters" aria-label="Invited talk filters">
      ${renderSegmentedFilter(key, "talkYear", "Year", yearOptions, filters.talkYear || "all")}
      ${renderSegmentedFilter(key, "talkType", "Type", options, filters.talkType || "all")}
    </div>`;
  }

  function renderTalkCollapseControls() {
    return `<div class="profile-data-collapse-controls" aria-label="Invited talk year controls">
      <button class="profile-data-control-button" type="button" data-profile-talk-collapse="open">Expand all</button>
      <button class="profile-data-control-button" type="button" data-profile-talk-collapse="closed">Collapse all</button>
    </div>`;
  }

  function countBy(rows, column) {
    return rows.reduce((counts, row) => {
      const value = String(row[column] || "").trim();
      if (!value) return counts;
      counts[value] = (counts[value] || 0) + 1;
      return counts;
    }, {});
  }

  function sortedEntries(counts) {
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }

  function publicationYear(row) {
    const match = String(row.Year || "").match(/\d{4}/);
    return match ? match[0] : String(row.Year || "").trim();
  }

  function countPublicationYears(rows) {
    return rows.reduce((counts, row) => {
      const year = publicationYear(row);
      if (!year) return counts;
      counts[year] = (counts[year] || 0) + 1;
      return counts;
    }, {});
  }

  function venueShortName(venue) {
    const text = String(venue || "").replace(/\s+/g, " ").trim();
    if (text.includes("Computers and Electronics in Agriculture")) return "COMPAG";
    if (text.includes("Industrial Informatics")) return "TII";
    if (text.includes("Human-Machine Systems")) return "THMS";
    if (text.includes("Systems, Man, and Cybernetics")) return "TSMC";
    if (text.includes("Transactions on Mechatronics")) return "TMECH";
    if (text.includes("Franklin Institute")) return "JFI";
    if (text.includes("Advanced Intelligent Mechatronics")) return "AIM";
    if (text.includes("Humanoid Robots")) return "Humanoids";
    if (text.includes("Intelligent Robots and Systems")) return "IROS";
    if (text.includes("Robotics and Automation")) return "ICRA";
    if (text.includes("Robotics and Automation Letters")) return "RA-L";
    if (text.includes("Control and Robotics Engineering")) return "ICCRE";
    if (text.includes("Recent Advances in Systems Science")) return "RASSE";
    if (text.includes("Robot Motion and Control")) return "ROMOCO";
    if (text.includes("Intelligent Systems and Networks")) return "ICISN";
    if (text.includes("Advanced Mechanical Engineering")) return "AMAS";
    return text;
  }

  function renderPublicationMetaValue(column, row) {
    if (column === "Authors") return renderAuthors(row[column]);
    if (column === "Venue/Book Title") return escapeHtml(String(row[column] || "").replace(/\s+/g, " ").trim());
    return renderValue(column, row[column]);
  }

  function metaLabel(column) {
    if (column === "Collaboration") return "Collaboration with";
    return column;
  }

  function isAprlPublication(row) {
    return /(?:\bGiseop Kim|김기섭)\s*[*†]*\s*$/.test(String(row.Authors || "").trim());
  }

  function countVenues(rows) {
    return rows.reduce((counts, row) => {
      const venue = venueShortName(row["Venue/Book Title"]);
      if (!venue) return counts;
      counts[venue] = (counts[venue] || 0) + 1;
      return counts;
    }, {});
  }

  function renderSummaryButton(key, group, value, label, count, activeValue) {
    const active = value === activeValue ? " is-active" : "";
    const pressed = value === activeValue ? "true" : "false";
    return `<button class="profile-data-summary-chip${active}" type="button" data-profile-key="${escapeHtml(key)}" data-profile-filter="${escapeHtml(group)}" data-profile-filter-value="${escapeHtml(value)}" data-profile-filter-toggle="true" aria-pressed="${pressed}"><b>${escapeHtml(label)}</b>${escapeHtml(count)}</button>`;
  }

  function renderPublicationSummary(key, rows, filters) {
    if (!rows.length) {
      return '<div class="profile-data-summary"><span>No publications match the current filters.</span></div>';
    }
    const byYear = sortedEntries(countPublicationYears(rows))
      .sort((a, b) => Number(b[0]) - Number(a[0]) || b[1] - a[1])
      .map(([year, count]) => renderSummaryButton(key, "year", year, year, count, filters.year))
      .join("");
    const byVenue = sortedEntries(countVenues(rows))
      .map(([venue, count]) => renderSummaryButton(key, "venue", venue, venue, count, filters.venue))
      .join("");
    return `<div class="profile-data-summary" aria-label="Publication summary">
      <div><strong>Year</strong>${byYear}</div>
      <div><strong>Venue</strong>${byVenue}</div>
    </div>`;
  }

  function renderFundedSummary(rows) {
    const currentRows = rows.filter((row) => String(row.Status || "").trim() === "Current");
    const totals = currentRows.reduce(
      (acc, row) => {
        const role = String(row.Role || "");
        const piMatch = role.match(/(\d+)\s*책/);
        const coMatch = role.match(/(\d+)\s*공/);
        const pi = piMatch ? Number(piMatch[1]) : 0;
        const co = coMatch ? Number(coMatch[1]) : 0;
        acc.pi += pi;
        acc.co += pi + co;
        return acc;
      },
      { pi: 0, co: 0 }
    );
    return `<div class="profile-data-summary profile-data-summary-funded" aria-label="Current funded project summary">
      <div><strong>Current</strong><span class="profile-data-summary-chip"><b>${totals.pi}책</b>${totals.co}공</span></div>
    </div>`;
  }

  function rowYear(section, row) {
    if (section.title === "Publications/Patents") return publicationYear(row);
    if (section.title === "Teaching") return String(row.Year || "").trim();
    if (section.title === "Funded Projects") return String(row.Status || "").trim();
    const date = section.title === "Essays" ? row["Published Date"] : row.Date;
    const match = String(date || "").match(/\d{4}/);
    return match ? match[0] : "";
  }

  function renderCards(section) {
    const columns = section.columns || [];
    const isAwardsSection = section.title === "Awards";
    const primary = isAwardsSection ? "" : titleColumn(columns);
    const actions = actionColumns(columns);
    const isPublicationSection = section.title === "Publications/Patents";
    const isTalksSection = section.title === "Invited Talks";
    const isTeachingSection = section.title === "Teaching";
    const isEssaysSection = section.title === "Essays";
    const isPersonalProjectsSection = section.title === "Personal Projects";
    const isFundedProjectsSection = section.title === "Funded Projects";
    const isAcademicServiceSection = section.title === "Academic Service";
    const showYearSeparators = ["Publications/Patents", "Invited Talks", "Awards", "Academic Service", "Teaching", "Essays", "Funded Projects"].includes(section.title);
    const metas = metaColumns(columns, primary).filter((column) => {
      if (isPublicationSection && ["Types", "Category"].includes(column)) return false;
      if (isAcademicServiceSection && column === "Category") return false;
      if (isEssaysSection && column === "Tags") return false;
      if (isFundedProjectsSection && column === "Status") return false;
      if (isFundedProjectsSection && column === "Figure") return false;
      return true;
    });
    function renderCard(row) {
        const publicationBadges = isPublicationSection
          ? publicationBadgeColumns
              .filter((column) => row[column])
              .map((column) => `<span class="profile-data-badge profile-data-badge-${column.toLowerCase()}">${renderValue(column, row[column])}</span>`)
              .join("")
          : "";
        const essayTagBadges =
          isEssaysSection && row.Tags
            ? String(row.Tags)
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => `<span class="profile-data-badge profile-data-badge-essay-tag">${escapeHtml(tag)}</span>`)
                .join("")
            : "";
        const currentTalkType = isTalksSection ? talkType(row) : "";
        const talksBadge =
          currentTalkType === "University"
            ? '<span class="profile-data-badge profile-data-badge-university">University</span>'
            : "";
        const researchInstituteBadge =
          currentTalkType === "Research Institute"
            ? '<span class="profile-data-badge profile-data-badge-research-institute">Research Institute</span>'
            : "";
        const governmentBadge =
          currentTalkType === "Public Sector"
            ? '<span class="profile-data-badge profile-data-badge-government">Public Sector</span>'
            : "";
        const conferenceBadge = currentTalkType === "Conference" ? '<span class="profile-data-badge profile-data-badge-conference">Conference</span>' : "";
        const industryBadge = currentTalkType === "Industry" ? '<span class="profile-data-badge profile-data-badge-industry">Industry</span>' : "";
        const fundedStatusBadge =
          isFundedProjectsSection && row.Status
            ? `<span class="profile-data-badge profile-data-badge-funded-${String(row.Status).toLowerCase()}">${escapeHtml(String(row.Status))}</span>`
            : "";
        const academicServiceBadge =
          isAcademicServiceSection && row.Category
            ? `<span class="profile-data-badge profile-data-badge-service-${String(row.Category).toLowerCase().includes("international") ? "international" : "domestic"}">${escapeHtml(String(row.Category))}</span>`
            : "";
        const isMainTeaching =
          isTeachingSection &&
          /(Advancded mobile system|Introduction to Artificial Intelligence)/i.test(String(row.Course || ""));
        const teachingCodeBadge =
          isTeachingSection && row.Code
            ? `<span class="profile-data-badge profile-data-badge-code">${renderValue("Code", row.Code)}</span>`
            : "";
        const mainTeachingBadge = isMainTeaching ? '<span class="profile-data-badge profile-data-badge-main">Main</span>' : "";
        const badgeHtml = `${publicationBadges}${essayTagBadges}${conferenceBadge}${talksBadge}${researchInstituteBadge}${industryBadge}${governmentBadge}${fundedStatusBadge}${academicServiceBadge}${teachingCodeBadge}${mainTeachingBadge}`;
        const metaHtml = metas
          .filter((column) => row[column] && !(isTeachingSection && column === "Code"))
          .map((column) => {
            const compact = compactColumns.has(column) ? " profile-data-meta-compact" : "";
            const author = isPublicationSection && column === "Authors" ? " profile-data-meta-author" : "";
            const fullLine = isTalksSection && ["Date", "Event/Session", "Host / Venue", "Invitation From"].includes(column) ? " profile-data-meta-full" : "";
            const value = isPublicationSection
              ? renderPublicationMetaValue(column, row)
              : isAwardsSection && column === "Recipient"
                ? popupColumn(row, "Award") === column
                  ? renderPopupValue(row, column, renderRecipient(row[column]))
                  : renderRecipient(row[column])
              : isAwardsSection && column === "Event"
                ? renderEvent(row)
              : isAwardsSection && column === "Award"
                ? popupColumn(row, "Award") === column
                  ? renderPopupValue(row, column, renderValue(column, row[column]))
                  : renderValue(column, row[column])
              : isTeachingSection && column === "TA"
                ? renderTeachingTa(row[column])
                : isTalksSection && column === "Event/Session"
                  ? renderTalkEventSession(row)
                : isTalksSection && ["Host / Venue", "Invitation From"].includes(column)
                  ? renderTalkInvitation(row[column])
                : isTalksSection
                  ? renderTalkConferenceLinks(row[column])
                : renderValue(column, row[column]);
            return `<span class="profile-data-meta${compact}${author}${fullLine}"><b>${escapeHtml(metaLabel(column))}</b>${value}</span>`;
          })
          .join("");
        const actionHtml = actions
          .filter((column) => row[column] && !(isAwardsSection && column === "Event Link"))
          .map((column) =>
            renderValue(
              column,
              row[column],
              isPublicationSection && column === "Download Link" && row.Title === "Chapter 8: LiDAR SLAM"
                ? "Book (PDF)"
                : isAwardsSection && column === "Website"
                  ? "Materials"
                : isPersonalProjectsSection && column === "Link"
                  ? /\.pdf(?:$|[?#])/i.test(String(row[column]))
                    ? "PDF"
                    : "Website"
                  : ""
            )
          )
          .join(", ");
        const actionsBlock = actionHtml ? `<div class="profile-data-action">${actionHtml}</div>` : "";
        const hasCardFigure = isPublicationSection || isFundedProjectsSection;
        const fundedStatusClass =
          isFundedProjectsSection && row.Status
            ? ` profile-data-card-funded-${String(row.Status).toLowerCase()}`
            : "";
        const cardClass = `profile-data-card${hasCardFigure ? " profile-data-card-publication" : ""}${fundedStatusClass}${isMainTeaching ? " profile-data-card-main" : ""}`;
        const titleValue =
          isTeachingSection && primary === "Course"
            ? renderTeachingCourse(row[primary])
            : isTalksSection && primary === "Title"
              ? renderPopupTitle(row, primary)
              : renderValue(primary, row[primary]);
        const titleRow = primary ? `<div class="profile-data-title-row">${badgeHtml}<h3>${titleValue}</h3></div>` : "";
        const contentBlock = `<div class="profile-data-publication-body">
            ${titleRow}
            <div class="profile-data-meta-row">${metaHtml}</div>
            ${actionsBlock}
          </div>`;
        const cardId = isPublicationSection && (row.Id || row.Title)
          ? ` id="${escapeHtml(row.Id || String(row.Title).toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[-\s]+/g, '-'))}"`
          : "";
        return `<article class="${cardClass}"${cardId}>
          ${contentBlock}
          ${isPublicationSection ? publicationFigure(row) : ""}
          ${isFundedProjectsSection ? cardFigure(row, "/images/publication-dummy.svg", "funded project") : ""}
        </article>`;
    }

    if (isTalksSection) {
      const currentYear = String(new Date().getFullYear());
      const groupedRows = section.rows.reduce((groups, row) => {
        const year = rowYear(section, row) || "Undated";
        if (!groups.has(year)) groups.set(year, []);
        groups.get(year).push(row);
        return groups;
      }, new Map());

      return Array.from(groupedRows.entries())
        .map(([year, rows]) => {
          const open = year === currentYear ? " open" : "";
          const cards = rows.map(renderCard).join("");
          return `<details class="profile-data-year-group" data-profile-talk-year="${escapeHtml(year)}"${open}>
            <summary>
              <span class="profile-data-year-group-title"><span class="profile-data-year-group-arrow" aria-hidden="true"></span>${escapeHtml(year)}</span>
              <span class="profile-data-year-group-status"><span>${rows.length} entries</span><span class="profile-data-year-group-hint"><span class="profile-data-year-group-hint-closed">Show entries</span><span class="profile-data-year-group-hint-open">Hide entries</span></span></span>
            </summary>
            <div class="profile-data-year-group-grid">${cards}</div>
          </details>`;
        })
        .join("");
    }

    let previousYear = "";
    return section.rows
      .map((row) => {
        const year = showYearSeparators ? rowYear(section, row) : "";
        const separator =
          showYearSeparators && year && year !== previousYear
            ? `<div class="profile-data-year-separator"><span>${escapeHtml(year)}</span></div>`
            : "";
        if (year) previousYear = year;
        return `${separator}${renderCard(row)}`;
      })
      .join("");
  }

  function renderTable(section) {
    const columns = section.columns || [];
    const header = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
    const rows = section.rows
      .map((row) => `<tr>${columns.map((column) => `<td>${renderValue(column, row[column])}</td>`).join("")}</tr>`)
      .join("");
    return `<div class="profile-data-table-wrap"><table class="profile-data-table"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function showBibTooltip(button, text, isPreview) {
    let tooltip = document.querySelector(".publication-copy-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "publication-copy-tooltip";
      document.body.appendChild(tooltip);
    }
    tooltip.textContent = text;
    if (isPreview) tooltip.classList.add("is-preview");
    else tooltip.classList.remove("is-preview");

    const rect = button.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + window.scrollY + 6}px`;
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.classList.add("is-visible");

    setTimeout(() => {
      tooltip.classList.remove("is-visible");
    }, 2500);
  }

  function formatDoiLink(text) {
    if (!text) return "";
    return text.replace(/(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)/g, (doi) => {
      const cleanDoi = doi.replace(/[.,;)]+$/, "");
      return `<a href="https://doi.org/${encodeURI(cleanDoi)}" target="_blank" rel="noopener noreferrer" style="color: #005bac; font-weight: 600; text-decoration: underline;">${cleanDoi}</a>`;
    });
  }

  function renderAprlPublicationCard(row) {
    const cardId = escapeHtml(row.Id || slugify(row.Title));
    const year = publicationYear(row);
    const category = String(row.Category || "Conference");
    const categorySlug = category.toLowerCase();
    const venueShort = venueShortName(row["Venue/Book Title"]);
    const venueSlug = slugify(venueShort);

    const authorsRaw = String(row.Authors || "Cong-Thanh Vu");
    const authorList = authorsRaw.split(",").map((a) => a.trim());
    const totalAuthors = authorList.length;

    const authorsFormatted = authorList
      .map((author, index) => {
        const trimmed = author.trim();
        if (/Cong-Thanh Vu/i.test(trimmed)) {
          const isFirstAuthor = index === 0;
          const isLastAuthor = index === totalAuthors - 1 && totalAuthors > 1;

          let suffix = "";
          if (isFirstAuthor) {
            suffix = "*";
          } else if (isLastAuthor) {
            suffix = "†";
          }

          const cleanName = trimmed.replace(/[\*†]/g, "").trim();
          return `<strong>${cleanName}</strong>${suffix}`;
        }
        return `${trimmed}`;
      })
      .join(", ");

    const firstAuthorLastName = "vu";
    const bibKey = `${firstAuthorLastName}${year}${slugify(row.Title).slice(0, 14)}`;
    const isJournal = category.toLowerCase().includes("journal");
    const bibType = isJournal ? "article" : "inproceedings";
    const venueField = isJournal
      ? `journal={${row["Venue/Book Title"] || row["Journal Info"] || ""}}`
      : `booktitle={${row["Venue/Book Title"] || row["Journal Info"] || ""}}`;
    const bibtex = (row.Bibtex && row.Bibtex.trim())
      ? row.Bibtex.trim()
      : (row["BibTeX"] && row["BibTeX"].trim())
      ? row["BibTeX"].trim()
      : `@${bibType}{${bibKey},\n  title={${row.Title}},\n  author={${row.Authors}},\n  ${venueField},\n  year={${year}}\n}`;

    // Venue/Book link (AIM 2026, IROS 2025, IROS 2026, or custom Venue Link)
    const venueLink = (row["Venue Link"] && row["Venue Link"].trim()) ||
                      (row["Venue Website"] && row["Venue Website"].trim()) ||
                      (/AIM/i.test(row["Venue/Book Title"] || "") && String(year) === "2026" ? "https://aim2026.com/" : "") ||
                      (/IROS/i.test(row["Venue/Book Title"] || "") && String(year) === "2026" ? "https://2026.ieee-iros.org/" : "") ||
                      (/IROS/i.test(row["Venue/Book Title"] || "") && String(year) === "2025" ? "https://www.iros25.org/" : "");

    const venueDisplay = venueLink
      ? `<a href="${escapeHtml(venueLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row["Venue/Book Title"] || "")}</a>`
      : escapeHtml(row["Venue/Book Title"] || "");

    const rawInfo = String(row.Info || row["Journal Info"] || "").trim();
    const rawNote = String(row.Note || "").trim();

    let metaDetailsHtml = "";
    if (isJournal) {
      // Online journal: has Vol, pp, DOI, or ISSN
      if (/Vol\.|pp\.|DOI|ISSN/i.test(rawInfo)) {
        metaDetailsHtml = `<span><b>Info</b>${formatDoiLink(escapeHtml(rawInfo))}</span>`;
      } else if (rawNote || /accepted|to appear/i.test(rawInfo)) {
        const noteText = rawNote || rawInfo;
        metaDetailsHtml = `<span><b>Note</b>${escapeHtml(noteText)}</span>`;
      }
    } else {
      // Conference: NO Info, only Note for unpublished/accepted papers
      if (rawNote || /accepted|to appear/i.test(rawInfo)) {
        const noteText = rawNote || rawInfo;
        metaDetailsHtml = `<span><b>Note</b>${escapeHtml(noteText)}</span>`;
      }
    }

    // Direct paper link for clicking title or buttons
    const paperUrl = (row["Download Link"] && row["Download Link"].trim()) || 
                     (row.Website && row.Website.trim()) || 
                     (row.Link && row.Link.trim().startsWith("http") ? row.Link.trim() : "") || 
                     `https://scholar.google.com/citations?user=7FEW5b8AAAAJ`;
    const paperLink = `<a href="${escapeHtml(paperUrl)}" target="_blank" rel="noopener noreferrer" title="View paper">Paper</a>`;
    const websiteLink = (row.Website && row.Website.trim() && row.Website.trim() !== paperUrl)
      ? `<a href="${escapeHtml(row.Website)}" target="_blank" rel="noopener noreferrer">Project</a>`
      : "";
    const bibButton = `<button type="button" data-bibtex="${escapeHtml(bibtex)}" title="Copy BibTeX">Bib</button>`;

    const actionsHtml = `<div class="publication-actions">${bibButton}${paperLink}${websiteLink}</div>`;

    const hasFigure = Boolean(row.Figure && row.Figure.trim());
    const cardClass = hasFigure ? "publication-card" : "publication-card publication-card-text-only";
    const figureHtml = hasFigure
      ? `<a class="publication-figure" href="${escapeHtml(row.Figure)}" target="_blank" rel="noopener" title="Click to view full diagram"><img src="${escapeHtml(row.Figure)}" alt="Figure for ${escapeHtml(row.Title)}" loading="lazy"></a>`
      : "";

    return `
      <article id="${cardId}" class="${cardClass}" data-region="international" data-type="${categorySlug}" data-year="${year}" data-venue="${venueSlug}">
        <div class="publication-body">
          <div class="publication-title-row">
            <span class="pub-badge pub-year">${escapeHtml(year)}</span>
            <span class="pub-badge badge-region-international">International</span>
            <span class="pub-badge badge-type-${categorySlug}">${escapeHtml(category)}</span>
            <span class="pub-badge aprl">RASL</span>
            <h3><a href="${escapeHtml(paperUrl)}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;" title="Open publication">${escapeHtml(row.Title)}</a></h3>
          </div>
          <div class="publication-meta">
            <span><b>Venue/Book</b>${venueDisplay}</span>
            <span><b>Authors</b>${authorsFormatted}</span>
            ${metaDetailsHtml}
          </div>
          ${actionsHtml}
        </div>
        ${figureHtml}
      </article>
    `;
  }

  function renderAprlPublicationSection(section, filters) {
    const baseRows = visibleRows(section.rows);
    const rows = applyPublicationFilters(baseRows, filters);
    const updatedAt = state.data.updatedAt ? new Date(state.data.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Aug 2026";

    const yearCounts = countPublicationYears(baseRows);
    const venueCounts = countVenues(baseRows);

    const rowsByYear = rows.reduce((acc, row) => {
      const y = publicationYear(row) || "Other";
      if (!acc[y]) acc[y] = [];
      acc[y].push(row);
      return acc;
    }, {});
    const sortedYears = Object.keys(rowsByYear).sort((a, b) => Number(b) - Number(a));

    const sortedAllYears = Object.keys(yearCounts).sort((a, b) => Number(b) - Number(a));
    const yearButtonsHtml = sortedAllYears
      .map((year) => {
        const active = filters.year === year ? " is-active" : "";
        return `<button type="button" data-profile-key="publications" data-filter-group="year" data-filter-value="${escapeHtml(year)}" class="${active}">${escapeHtml(year)} <b>${yearCounts[year]}</b></button>`;
      })
      .join("");

    const journalVenues = ["COMPAG", "TII", "THMS", "TSMC"];
    const confVenues = ["IROS", "AIM", "Humanoids", "ICCRE", "RASSE", "ROMOCO", "ICISN", "AMAS"];

    const journalButtonsHtml = journalVenues
      .filter((v) => venueCounts[v])
      .map((v) => {
        const active = filters.venue === v ? " is-active" : "";
        return `<button type="button" data-profile-key="publications" data-filter-group="venue" data-filter-value="${escapeHtml(v)}" class="${active}">${escapeHtml(v)} <b>${venueCounts[v]}</b></button>`;
      })
      .join("");

    const confButtonsHtml = confVenues
      .filter((v) => venueCounts[v])
      .map((v) => {
        const active = filters.venue === v ? " is-active" : "";
        return `<button type="button" data-profile-key="publications" data-filter-group="venue" data-filter-value="${escapeHtml(v)}" class="${active}">${escapeHtml(v)} <b>${venueCounts[v]}</b></button>`;
      })
      .join("");

    let yearListHtml = "";
    if (!sortedYears.length) {
      yearListHtml = '<p style="padding: 2.5rem; text-align: center; color: #64748b; font-size: 1.05rem;">No publications match the selected filters.</p>';
    } else {
      yearListHtml = sortedYears
        .map((year) => {
          const cardsHtml = rowsByYear[year].map(renderAprlPublicationCard).join("");
          return `
            <div class="publication-year" data-publication-year="${escapeHtml(year)}">${escapeHtml(year)}</div>
            <div class="publication-list">
              ${cardsHtml}
            </div>
          `;
        })
        .join("");
    }

    const sortedAscYears = [...sortedAllYears].sort((a, b) => Number(a) - Number(b));
    const fromOptionsHtml = sortedAscYears
      .map((y) => `<option value="${y}" ${String(filters.fromYear) === String(y) ? "selected" : ""}>${y}</option>`)
      .join("");
    const toOptionsHtml = sortedAscYears
      .map((y) => `<option value="${y}" ${String(filters.toYear) === String(y) ? "selected" : ""}>${y}</option>`)
      .join("");

    return `
      <section id="publications" class="publications-section">
        <div class="publications-heading">
          <h1>Publications</h1>
          <p class="publication-updated">updated ${escapeHtml(updatedAt)}</p>
          <div class="publication-author-note">
            <span>Author notes</span>
            <em><b>*</b> First/co-first author</em>
            <em><b>†</b> Corresponding author</em>
            <em><strong>bold</strong> RASL member</em>
          </div>
        </div>

        <div class="publication-filter-panel" aria-label="Publication filters">
          <div>
            <span>Type</span>
            <button type="button" data-profile-key="publications" data-filter-group="category" data-filter-value="all" class="${filters.category === 'all' || !filters.category ? 'is-active' : ''} type-btn-all">All</button>
            <button type="button" data-profile-key="publications" data-filter-group="category" data-filter-value="Conference" class="${(Array.isArray(filters.category) && filters.category.includes('Conference')) || filters.category === 'Conference' ? 'is-active' : ''} type-btn-conference">Conference</button>
            <button type="button" data-profile-key="publications" data-filter-group="category" data-filter-value="Journal" class="${(Array.isArray(filters.category) && filters.category.includes('Journal')) || filters.category === 'Journal' ? 'is-active' : ''} type-btn-journal">Journal</button>
            <button type="button" data-profile-key="publications" data-filter-group="category" data-filter-value="Book" class="${(Array.isArray(filters.category) && filters.category.includes('Book')) || filters.category === 'Book' ? 'is-active' : ''} type-btn-book">Book</button>
            <button type="button" data-profile-key="publications" data-filter-group="category" data-filter-value="Preprint" class="${(Array.isArray(filters.category) && filters.category.includes('Preprint')) || filters.category === 'Preprint' ? 'is-active' : ''} type-btn-preprint">Preprint</button>
            <button type="button" data-profile-key="publications" data-filter-group="category" data-filter-value="Workshop" class="${(Array.isArray(filters.category) && filters.category.includes('Workshop')) || filters.category === 'Workshop' ? 'is-active' : ''} type-btn-workshop">Workshop</button>
          </div>
          <div class="facet-year-range" aria-label="Publication year range">
            <span>Range</span>
            <label>From
              <select data-year-range="from">
                <option value="all" ${filters.fromYear === 'all' ? 'selected' : ''}>Any</option>
                ${fromOptionsHtml}
              </select>
            </label>
            <label>To
              <select data-year-range="to">
                <option value="all" ${filters.toYear === 'all' ? 'selected' : ''}>Any</option>
                ${toOptionsHtml}
              </select>
            </label>
          </div>
          <div class="publication-filter-actions">
            <span>View</span>
            <button type="button" data-profile-key="publications" data-filter-reset="all">Show all</button>
          </div>
        </div>

        <div class="publication-facets" aria-label="Publication facets">
          <div class="publication-filter-total" aria-live="polite">Showing ${rows.length} / ${baseRows.length}</div>
          <div class="facet-row">
            <span>Publication Year</span>
            <div class="facet-year-tools">
              <div class="facet-buttons">
                ${yearButtonsHtml}
              </div>
            </div>
          </div>
          <div class="facet-row">
            <span>Venue</span>
            <div class="facet-venue-groups">
              <div class="facet-subgroup">
                <em>Journals</em>
                <div class="facet-buttons">
                  ${journalButtonsHtml}
                </div>
              </div>
              <div class="facet-subgroup">
                <em>Conferences</em>
                <div class="facet-buttons">
                  ${confButtonsHtml}
                </div>
              </div>
            </div>
          </div>
        </div>

        ${yearListHtml}
      </section>
    `;
  }

  function renderMount(mount) {
    const key = mount.getAttribute("data-profile-section");
    const section = state.data && state.data.sections && state.data.sections[key];
    if (!section) {
      mount.innerHTML = '<p class="profile-data-status">Data is not available.</p>';
      return;
    }

    const filters = filtersFor(key);

    if (key === "publications") {
      mount.innerHTML = renderAprlPublicationSection(section, filters);

      mount.querySelectorAll("select[data-year-range]").forEach((select) => {
        select.addEventListener("change", () => {
          const rangeType = select.getAttribute("data-year-range");
          const currentFilters = filtersFor("publications");
          if (rangeType === "from") {
            currentFilters.fromYear = select.value;
          } else if (rangeType === "to") {
            currentFilters.toYear = select.value;
          }
          renderMount(mount);
        });
      });

      mount.querySelectorAll("[data-filter-group]").forEach((button) => {
        button.addEventListener("click", () => {
          const group = button.getAttribute("data-filter-group");
          const value = button.getAttribute("data-filter-value");
          const currentFilters = filtersFor("publications");

          if (group === "year") {
            currentFilters.year = currentFilters.year === value ? "all" : value;
          } else if (group === "venue") {
            currentFilters.venue = currentFilters.venue === value ? "all" : value;
          } else if (group === "category") {
            currentFilters.category = value === "all" ? "all" : value;
          } else if (group === "region") {
            currentFilters.type = value === "all" ? "all" : value;
          } else if (group === "rasl") {
            currentFilters.rasl = value === "all" ? "all" : value;
          }

          renderMount(mount);
        });
      });

      mount.querySelectorAll("[data-filter-reset]").forEach((button) => {
        button.addEventListener("click", () => {
          state.filters["publications"] = {
            type: "all",
            category: "all",
            year: "all",
            fromYear: "all",
            toYear: "all",
            venue: "all",
            tag: "all",
            rasl: "all"
          };
          renderMount(mount);
        });
      });

      mount.querySelectorAll("[data-bibtex]").forEach((button) => {
        button.addEventListener("click", () => {
          const bib = button.getAttribute("data-bibtex");
          if (navigator.clipboard) {
            navigator.clipboard.writeText(bib).then(() => {
              showBibTooltip(button, "Copied BibTeX to clipboard!");
            });
          } else {
            showBibTooltip(button, bib, true);
          }
        });
      });

      return;
    }

    const view = mount.getAttribute("data-profile-view") || "cards";
    const updatedAt = state.data.updatedAt ? new Date(state.data.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";
    const baseRows = visibleRows(section.rows);
    const rows =
      key === "talks"
        ? applyTalkFilters(baseRows, filters)
        : key === "essays"
          ? applyEssayFilters(baseRows, filters)
          : baseRows;
    const renderedSection = { ...section, rows };
    const countText = rows.length !== baseRows.length ? `${rows.length} of ${baseRows.length}` : baseRows.length;

    mount.innerHTML = `
      <div class="profile-data-toolbar">
        <span>${countText} entries${updatedAt ? ` · updated ${escapeHtml(updatedAt)}` : ""}</span>
      </div>
      ${key === "funded_projects" ? renderFundedSummary(baseRows) : ""}
      ${key === "talks" ? renderTalkFilters(key, baseRows, filters) : ""}
      ${key === "talks" ? renderTalkCollapseControls() : ""}
      ${key === "essays" ? renderEssayFilters(key, baseRows, filters) : ""}
      ${view === "table" ? renderTable(renderedSection) : `<div class="profile-data-grid profile-data-grid-${escapeHtml(key)}">${renderCards(renderedSection)}</div>`}
    `;

    mount.querySelectorAll("[data-profile-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const filterKey = button.getAttribute("data-profile-key");
        const group = button.getAttribute("data-profile-filter");
        const value = button.getAttribute("data-profile-filter-value");
        const currentFilters = filtersFor(filterKey);
        currentFilters[group] = button.getAttribute("data-profile-filter-toggle") === "true" && currentFilters[group] === value ? "all" : value;
        renderMount(mount);
      });
    });

    mount.querySelectorAll("[data-profile-talk-collapse]").forEach((button) => {
      button.addEventListener("click", () => {
        const shouldOpen = button.getAttribute("data-profile-talk-collapse") === "open";
        mount.querySelectorAll(".profile-data-year-group").forEach((group) => {
          group.open = shouldOpen;
        });
      });
    });

    mount.querySelectorAll("[data-talk-popup-image]").forEach((button) => {
      button.addEventListener("click", () => {
        openTalkImageModal(button.getAttribute("data-talk-popup-image"), button.getAttribute("data-talk-popup-title"));
      });
    });

  }

  function ensureTalkImageModal() {
    let modal = document.querySelector(".talk-image-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "talk-image-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = '<button class="talk-image-modal-backdrop" type="button" aria-label="Close talk image"></button><img class="talk-image-modal-image" alt="">';
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.classList.contains("talk-image-modal-backdrop") || event.target.classList.contains("talk-image-modal-image")) {
        closeTalkImageModal();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeTalkImageModal();
    });
    document.body.appendChild(modal);
    return modal;
  }

  function openTalkImageModal(src, title) {
    if (!src) return;
    const modal = ensureTalkImageModal();
    const image = modal.querySelector(".talk-image-modal-image");
    image.src = src;
    image.alt = title || "Invited talk image";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("talk-image-modal-open");
  }

  function closeTalkImageModal() {
    const modal = document.querySelector(".talk-image-modal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("talk-image-modal-open");
  }

  function copySectionUri(section) {
    const url = new URL(window.location.href);
    url.hash = section.id;
    const sectionUrl = url.toString();
    if (window.location.hash !== `#${section.id}`) {
      window.history.pushState(null, "", `#${section.id}`);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(sectionUrl).catch(() => {});
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = sectionUrl;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (_error) {
      // Ignore copy failures; clicking the heading should never disrupt the page.
    }
    document.body.removeChild(textarea);
  }

  function initSectionHeadingCopy() {
    document.querySelectorAll("section.home-section[id] .section-heading :is(h1, h2, h3), #about .col-lg-8 > h1").forEach((heading) => {
      const section = heading.closest("section.home-section[id]");
      if (!section) return;
      if (heading.querySelector(".section-copy-link")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-copy-link";
      button.setAttribute("aria-label", `Copy link to ${heading.textContent.trim()}`);
      button.setAttribute("title", "Copy section link");
      button.textContent = "#";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        copySectionUri(section);
      });
      button.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        copySectionUri(section);
      });
      heading.appendChild(button);
    });
  }

  function initProfileAffiliationLinks() {
    document.querySelectorAll(".portrait-title h3 a").forEach((link) => {
      if (link.textContent.replace(/\s+/g, " ").trim() !== "APRL | DGIST") return;
      link.outerHTML = [
        '<a href="https://team-aprl.github.io/" target="_blank" rel="noopener">APRL</a>',
        '<span class="profile-affiliation-separator"> | </span>',
        '<a href="https://www.dgist.ac.kr" target="_blank" rel="noopener">DGIST</a>',
      ].join("");
    });
  }

  function initProfileEmailLink() {
    document.querySelectorAll(".portrait-title").forEach((title) => {
      if (title.querySelector(".profile-email-link")) return;
      const email = document.createElement("a");
      email.className = "profile-email-link";
      email.href = "mailto:gsk@dgist.ac.kr";
      email.textContent = "gsk@dgist.ac.kr";
      title.appendChild(email);
    });
  }

  function initScholarIconFallback() {
    document.querySelectorAll('.network-icon a[aria-label="google-scholar"]').forEach((link) => {
      if (link.querySelector(".profile-scholar-fallback")) return;
      link.innerHTML = '<i class="fas fa-graduation-cap big-icon profile-scholar-fallback" aria-hidden="true"></i>';
    });
  }

  function initNavbarCleanup() {
    document.querySelectorAll("#navbar-main .nav-link").forEach((link) => {
      if (link.textContent.replace(/\s+/g, " ").trim() !== "Home") return;
      const href = link.getAttribute("href") || "";
      const target = link.getAttribute("data-target") || "";
      if (href.endsWith("#about") || target === "#about") {
        link.closest(".nav-item")?.remove();
      }
    });
  }

  function highlightHashTarget() {
    const hash = window.location.hash ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const target = document.getElementById(hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
        target.style.boxShadow = "0 0 0 3px #005bac, 0 8px 24px rgba(0, 91, 172, 0.25)";
        target.style.borderColor = "#005bac";
        setTimeout(() => {
          target.style.boxShadow = "";
          target.style.borderColor = "";
        }, 3500);
      }, 150);
    }
  }

  function initNewsFiltering() {
    const filterButtons = document.querySelectorAll(".news-filter-buttons button[data-news-filter]");
    const actionButtons = document.querySelectorAll(".news-collapse-actions button[data-news-action]");
    const yearHeaders = document.querySelectorAll(".news-year-header");

    // Category Filter Buttons
    if (filterButtons.length) {
      filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const filter = btn.getAttribute("data-news-filter");
          filterButtons.forEach((b) => b.classList.toggle("is-active", b === btn));

          const yearGroups = document.querySelectorAll(".news-year-group");
          yearGroups.forEach((group) => {
            const items = group.querySelectorAll("li[data-news-category]");
            let visibleCount = 0;

            items.forEach((item) => {
              const cat = item.getAttribute("data-news-category") || "publication";
              const isMatch = filter === "all" || cat.toLowerCase() === filter.toLowerCase();
              item.style.display = isMatch ? "flex" : "none";
              if (isMatch) visibleCount++;
            });

            group.style.display = visibleCount > 0 ? "" : "none";

            const countEl = group.querySelector(".news-year-count");
            if (countEl) {
              countEl.textContent = `(${visibleCount} Announcement${visibleCount === 1 ? "" : "s"})`;
            }
          });
        });
      });
    }

    // Expand / Collapse All Actions
    if (actionButtons.length) {
      actionButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.getAttribute("data-news-action");
          const isExpand = action === "expand";

          document.querySelectorAll(".news-year-group").forEach((group) => {
            const list = group.querySelector(".news-year-list");
            const arrow = group.querySelector(".news-arrow");
            if (list) {
              list.style.display = isExpand ? "flex" : "none";
            }
            if (arrow) {
              arrow.style.transform = isExpand ? "rotate(0deg)" : "rotate(-90deg)";
            }
          });
        });
      });
    }

    // Per-Year Toggle Accordion
    if (yearHeaders.length) {
      yearHeaders.forEach((header) => {
        header.addEventListener("click", () => {
          const group = header.closest(".news-year-group");
          if (!group) return;
          const list = group.querySelector(".news-year-list");
          const arrow = group.querySelector(".news-arrow");
          if (!list) return;

          const isCurrentlyOpen = list.style.display !== "none";
          list.style.display = isCurrentlyOpen ? "none" : "flex";
          if (arrow) {
            arrow.style.transform = isCurrentlyOpen ? "rotate(-90deg)" : "rotate(0deg)";
          }
        });
      });
    }
  }

  function init() {
    const mounts = Array.from(document.querySelectorAll("[data-profile-section]"));
    initSectionHeadingCopy();
    initProfileAffiliationLinks();
    initProfileEmailLink();
    initScholarIconFallback();
    initNavbarCleanup();
    initNewsFiltering();
    if (!mounts.length) return;

    fetch("/data/profile-sections.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        state.data = data;
        mounts.forEach(renderMount);
        highlightHashTarget();
      })
      .catch((error) => {
        mounts.forEach((mount) => {
          mount.innerHTML = `<p class="profile-data-status">Could not load local JSON data: ${escapeHtml(error.message)}</p>`;
        });
      });
  }

  function handleUrlChange() {
    const mounts = Array.from(document.querySelectorAll("[data-profile-section]"));
    if (!mounts.length || !state.data) return;
    state.filters = {};
    mounts.forEach(renderMount);
    highlightHashTarget();
  }

  window.addEventListener("hashchange", highlightHashTarget);
  window.addEventListener("popstate", handleUrlChange);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

