/* =====================================================================
   script.js — হিসাবপাতা হোমপেজের কাজ করার কোড
   টুলের তালিকা tools.js ফাইলে আছে; এই ফাইল সাধারণত বদলানোর দরকার নেই।
   ===================================================================== */

/* ---------- অংশ ১: ছোট সহায়ক ফাংশন (যেগুলো আলাদাভাবে পরীক্ষা করা যায়) ---------- */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BN_WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const EN_MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
                      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const BN_MONTHS = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
                   'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];

// ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর (যেমন 2026 → ২০২৬)
function toBanglaDigits(value) {
  return String(value).replace(/\d/g, d => BN_DIGITS[Number(d)]);
}

// সার্চের জন্য লেখা এক রকম করা:
// বাংলা সংখ্যা → ইংরেজি সংখ্যা, ছোট হাতের অক্ষর, হাইফেন → ফাঁকা, বাড়তি ফাঁকা বাদ
function normalizeText(text) {
  return String(text)
    .replace(/[০-৯]/g, d => String(BN_DIGITS.indexOf(d)))
    .replace(/[\u200c\u200d]/g, '')
    .toLowerCase()
    .replace(/[-–—_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CATEGORY_LABELS = {};
if (typeof CATEGORIES !== 'undefined') {
  CATEGORIES.forEach(c => { CATEGORY_LABELS[c.id] = c.label; });
}

// সার্চ লেখার ঘরে যা লেখা হলো এবং ক্যাটাগরি — দুটোই মেলে এমন টুলের তালিকা ফেরত দেয়
function filterTools(tools, query, category) {
  const words = normalizeText(query).split(' ').filter(Boolean);
  return tools.filter(tool => {
    if (tool.visibility !== 'public') return false;             // নিরাপত্তা-জাল: শুধু public
    if (category !== 'all' && tool.category !== category) return false;
    const haystack = normalizeText(
      [tool.name, tool.description, tool.keywords, CATEGORY_LABELS[tool.category] || ''].join(' ')
    );
    return words.every(word => haystack.includes(word));        // প্রতিটি শব্দ মিলতে হবে
  });
}

/* ---------- অংশ ২: বাংলা তারিখ (বাংলা একাডেমির সংশোধিত পঞ্জিকা, ২০১৯ থেকে প্রযোজ্য) ----------
   নিয়ম:
   - ১ বৈশাখ = ১৪ এপ্রিল
   - বৈশাখ থেকে আশ্বিন: প্রতি মাস ৩১ দিন
   - কার্তিক থেকে মাঘ: প্রতি মাস ৩০ দিন
   - ফাল্গুন: ২৯ দিন (ইংরেজি লিপ ইয়ারে ৩০ দিন), চৈত্র: ৩০ দিন
   - বাংলা সন = ইংরেজি সাল − ৫৯৩ (১ বৈশাখের পর), না হলে − ৫৯৪
   এটি ২০১৯ বা তার পরের তারিখের জন্য। এর আগের তারিখে দেখানো হয় না। */

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

// month0: ০ = জানুয়ারি ... ১১ = ডিসেম্বর (জাভাস্ক্রিপ্টের নিয়ম)
function banglaDate(year, month0, day) {
  // ২০১৯-এর ১৪ এপ্রিলের আগের তারিখের জন্য নিয়মটি প্রযোজ্য নয়
  if (year < 2019 || (year === 2019 && (month0 < 3 || (month0 === 3 && day < 14)))) return null;

  const beforeNewYear = month0 < 3 || (month0 === 3 && day < 14);
  const startYear = beforeNewYear ? year - 1 : year;            // এই বাংলা সন যে ইংরেজি সালে শুরু
  const falgunDays = isLeapYear(startYear + 1) ? 30 : 29;
  const lengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgunDays, 30];

  const MS_PER_DAY = 86400000;
  let offset = Math.round((Date.UTC(year, month0, day) - Date.UTC(startYear, 3, 14)) / MS_PER_DAY);

  for (let i = 0; i < 12; i++) {
    if (offset < lengths[i]) {
      return { day: offset + 1, monthIndex: i, month: BN_MONTHS[i], year: startYear - 593 };
    }
    offset -= lengths[i];
  }
  return null; // হিসাব না মিললে ভুল তারিখ না দেখিয়ে কিছুই দেখাব না
}

function formatBanglaDate(year, month0, day) {
  const b = banglaDate(year, month0, day);
  if (!b) return null;
  return `${toBanglaDigits(b.day)} ${b.month} ${toBanglaDigits(b.year)}`;
}

function formatEnglishDate(date) {
  return `${toBanglaDigits(date.getDate())} ${EN_MONTHS_BN[date.getMonth()]} ${toBanglaDigits(date.getFullYear())}`;
}

function formatTime(date) {
  const h24 = date.getHours();
  let period;
  if (h24 >= 4 && h24 < 6) period = 'ভোর';
  else if (h24 >= 6 && h24 < 12) period = 'সকাল';
  else if (h24 >= 12 && h24 < 15) period = 'দুপুর';
  else if (h24 >= 15 && h24 < 17) period = 'বিকাল';
  else if (h24 >= 17 && h24 < 19) period = 'সন্ধ্যা';
  else period = 'রাত';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${period} ${toBanglaDigits(String(h12).padStart(2, '0'))}:${toBanglaDigits(mm)}:${toBanglaDigits(ss)}`;
}

/* ---------- অংশ ২খ: পরবর্তী সরকারি ছুটি (তথ্য আসে holidays.js থেকে) ---------- */

// '2026-10-20' ধাঁচের তারিখ যাচাই; ভুল হলে null
function parseIsoDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) return null;
  const y = Number(m[1]), m0 = Number(m[2]) - 1, d = Number(m[3]);
  const utc = Date.UTC(y, m0, d);
  const check = new Date(utc);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m0 || check.getUTCDate() !== d) return null;
  return { y: y, m0: m0, d: d, utc: utc };
}

// তালিকার একটি লাইন থেকে শুরু ও শেষ তারিখ বের করা (date অথবা start/end)। ভুল হলে null
function readHolidayEntry(h) {
  if (!h || !h.name) return null;
  const startIso = h.start || h.date;
  const p1 = parseIsoDate(startIso);
  const p2 = parseIsoDate(h.end || startIso);
  if (!p1 || !p2 || p2.utc < p1.utc) return null;      // শেষ তারিখ শুরুর আগে হলে ভুল
  return { name: h.name, s: p1, e: p2 };
}

// আজ চলছে বা আজকের পরে শুরু হবে — এমন সবচেয়ে কাছের ছুটি (না থাকলে null)
function nextHoliday(holidays, y, m0, d) {
  const today = Date.UTC(y, m0, d);
  let best = null;
  (holidays || []).forEach(h => {
    const r = readHolidayEntry(h);
    if (!r) {
      if (typeof console !== 'undefined') console.warn('holidays.js: এই লাইনটি সঠিক নয়, বাদ দেওয়া হলো:', h);
      return;
    }
    if (r.e.utc < today) return;                        // পুরো ছুটি পার হয়ে গেছে — দেখাব না
    if (!best || r.s.utc < best.s.utc) best = r;
  });
  if (!best) return null;
  return {
    name: best.name,
    start: best.s, end: best.e,
    days: Math.round((best.e.utc - best.s.utc) / 86400000) + 1,
    ongoing: best.s.utc <= today,
    daysUntilStart: Math.max(0, Math.round((best.s.utc - today) / 86400000)),
    weekday: new Date(best.s.utc).getUTCDay()           // ছুটি শুরুর বার (০=রবিবার ... ৬=শনিবার)
  };
}

// তারিখের লেখা: "২০–২৪ অক্টোবর ২০২৬" / "১৬ ডিসেম্বর ২০২৬" / "২৯ অক্টোবর – ২ নভেম্বর ২০২৬"
function holidayDateText(n) {
  const s = n.start, e = n.end, B = toBanglaDigits;
  if (s.utc === e.utc) return `${B(s.d)} ${EN_MONTHS_BN[s.m0]} ${B(s.y)}`;
  if (s.y === e.y && s.m0 === e.m0) return `${B(s.d)}–${B(e.d)} ${EN_MONTHS_BN[s.m0]} ${B(s.y)}`;
  if (s.y === e.y) return `${B(s.d)} ${EN_MONTHS_BN[s.m0]} – ${B(e.d)} ${EN_MONTHS_BN[e.m0]} ${B(s.y)}`;
  return `${B(s.d)} ${EN_MONTHS_BN[s.m0]} ${B(s.y)} – ${B(e.d)} ${EN_MONTHS_BN[e.m0]} ${B(e.y)}`;
}

// কার্ডের ছোট ট্যাগ (ওপরে ডানে):
//   একটানা একাধিক দিন (২, ৩, ৫, ১০ ...)  → "একটানা ৫ দিন"
//   এক দিনের ছুটি                         → ছুটির বার, যেমন "বুধবার"
//   ছুটি এখন চলছে                         → "এখন চলছে" (এক দিনের ছুটি আজ হলে "আজ ছুটি")
function holidayPillText(n) {
  if (n.ongoing) return n.days > 1 ? 'এখন চলছে' : 'আজ ছুটি';
  if (n.days > 1) return `একটানা ${toBanglaDigits(n.days)} দিন`;
  return BN_WEEKDAYS[n.weekday];
}

// আজ তালিকার কোনো সরকারি ছুটি চলছে কি? থাকলে তার নাম, না থাকলে null
function holidayOnDate(holidays, y, m0, d) {
  const today = Date.UTC(y, m0, d);
  let found = null;
  (holidays || []).forEach(h => {
    const r = readHolidayEntry(h);
    if (r && !found && r.s.utc <= today && today <= r.e.utc) found = r.name;
  });
  return found;
}

// "এখন সময়" ঘরের নিচের লাইন: আজ কেমন দিন
// সরকারি অফিসে সাপ্তাহিক ছুটি শুক্র ও শনিবার। তালিকার ছুটি থাকলে সেটাই অগ্রাধিকার পায়।
function dayTypeText(holidays, y, m0, d) {
  const name = holidayOnDate(holidays, y, m0, d);
  if (name) return `আজ সরকারি ছুটি: ${name}`;
  const wd = new Date(Date.UTC(y, m0, d)).getUTCDay();
  if (wd === 5 || wd === 6) return 'আজ সাপ্তাহিক ছুটি';
  return 'আজ কর্মদিবস';
}

// "বাংলা তারিখ" ঘরের নিচের লাইন: বাংলাদেশের অর্থবছর (১ জুলাই – ৩০ জুন)
function fiscalYearText(y, m0) {
  const start = m0 >= 6 ? y : y - 1;
  const endShort = String((start + 1) % 100).padStart(2, '0');
  return `অর্থবছর ${toBanglaDigits(start)}–${toBanglaDigits(endShort)}`;
}

// পুরো শিরোনাম (পরীক্ষা ও স্ক্রিন-রিডারের জন্য): "দুর্গাপূজা ২০–২৪ অক্টোবর ২০২৬"
function holidayTitleText(n) {
  return `${n.name} ${holidayDateText(n)}`;
}

/* ---------- অংশ ৩: পেজের সাথে সংযোগ (শুধু ব্রাউজারে চলে) ---------- */

function startPage() {
  const grid = document.getElementById('tools-grid');
  const filtersBox = document.getElementById('category-filters');
  const searchInput = document.getElementById('tool-search');
  const clearBtn = document.getElementById('search-clear');
  const emptyState = document.getElementById('empty-state');
  const statusLine = document.getElementById('result-status');

  let activeCategory = 'all';
  const publicTools = TOOLS.filter(t => t.visibility === 'public');
  const cardById = {};

  // কার্ড তৈরি (textContent ব্যবহার করায় লেখা নিরাপদ থাকে)
  publicTools.forEach(tool => {
    const link = document.createElement('a');
    link.className = 'tool-card';
    link.href = tool.url;
    if (tool.newTab) {                                  // বাইরের/সরকারি সাইট: নতুন ট্যাবে খুলবে
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const icon = document.createElement('span');
    icon.className = 'tool-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = tool.icon;

    const tag = document.createElement('span');
    tag.className = 'tool-tag';
    tag.textContent = CATEGORY_LABELS[tool.category] || '';

    const title = document.createElement('span');
    title.className = 'tool-title';
    title.textContent = tool.name;

    const desc = document.createElement('span');
    desc.className = 'tool-desc';
    desc.textContent = tool.description;

    const action = document.createElement('span');
    action.className = 'tool-action';
    action.textContent = tool.actionText || 'টুলটি ব্যবহার করুন';

    link.append(icon, tag);
    if (tool.badge) {                                   // ঐচ্ছিক ছোট লেবেল (যেমন 🔒 পাসওয়ার্ড সুরক্ষিত)
      const badge = document.createElement('span');
      badge.className = 'tool-badge';
      badge.textContent = tool.badge;
      link.appendChild(badge);
    }
    link.append(title, desc, action);
    grid.appendChild(link);
    cardById[tool.id] = link;
  });

  // ক্যাটাগরি বাটন তৈরি
  const buttons = CATEGORIES.map(cat => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'filter-btn';
    b.dataset.filter = cat.id;
    b.textContent = cat.label;
    b.setAttribute('aria-pressed', String(cat.id === activeCategory));
    b.addEventListener('click', () => {
      activeCategory = cat.id;
      buttons.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      render();
    });
    filtersBox.appendChild(b);
    return b;
  });

  // সার্চ ও ক্যাটাগরি মিলিয়ে কার্ড দেখানো/লুকানো
  function render() {
    const query = searchInput.value;
    const matches = filterTools(publicTools, query, activeCategory);
    const matchIds = new Set(matches.map(t => t.id));

    publicTools.forEach(tool => { cardById[tool.id].hidden = !matchIds.has(tool.id); });

    emptyState.hidden = matches.length > 0;
    clearBtn.hidden = query.length === 0;
    statusLine.textContent = matches.length > 0
      ? `${toBanglaDigits(matches.length)}টি টুল পাওয়া গেছে`
      : 'কোনো টুল পাওয়া যায়নি';
  }

  searchInput.addEventListener('input', render);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Escape') { searchInput.value = ''; render(); } });
  clearBtn.addEventListener('click', () => { searchInput.value = ''; render(); searchInput.focus(); });
  document.getElementById('search-form').addEventListener('submit', e => e.preventDefault());
  render();

  // তারিখ ও সময় (ব্যবহারকারীর ডিভাইসের সময় অনুযায়ী)
  const elWeekday = document.getElementById('date-weekday');
  const elEnglish = document.getElementById('date-english');
  const elBangla = document.getElementById('date-bangla');
  const elTime = document.getElementById('date-time');
  const elBanglaBox = document.getElementById('bangla-date-box');

  // পরবর্তী সরকারি ছুটির কার্ড (তারিখ বদলালে নিজে হালনাগাদ হয়; তথ্য না থাকলে কার্ড লুকানো থাকে)
  const elHolidayCard = document.getElementById('holiday-card');
  let lastHolidayDay = '';
  function updateHoliday(now) {
    const key = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
    if (key === lastHolidayDay) return;
    lastHolidayDay = key;
    const n = (typeof HOLIDAYS !== 'undefined')
      ? nextHoliday(HOLIDAYS, now.getFullYear(), now.getMonth(), now.getDate())
      : null;
    const row = document.getElementById('top-row');
    if (!n) { elHolidayCard.hidden = true; row.classList.remove('has-holiday'); return; }
    document.getElementById('holiday-name').textContent = n.name;
    document.getElementById('holiday-date').textContent = holidayDateText(n);
    const pillText = holidayPillText(n);
    const pill = document.getElementById('holiday-pill');
    pill.textContent = pillText;
    pill.hidden = !pillText;
    elHolidayCard.hidden = false;
    row.classList.add('has-holiday');
  }

  // নিচের দুই ছোট লাইন (অর্থবছর, আজ কেমন দিন): তারিখ বদলালে নিজে হালনাগাদ হয়
  const elFY = document.getElementById('date-fy');
  const elDayType = document.getElementById('date-daytype');
  let lastInfoDay = '';
  function updateDayInfo(now) {
    const key = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
    if (key === lastInfoDay) return;
    lastInfoDay = key;
    elFY.textContent = fiscalYearText(now.getFullYear(), now.getMonth());
    elDayType.textContent = dayTypeText((typeof HOLIDAYS !== 'undefined') ? HOLIDAYS : [], now.getFullYear(), now.getMonth(), now.getDate());
  }

  function tick() {
    const now = new Date();
    updateHoliday(now);
    updateDayInfo(now);
    elWeekday.textContent = BN_WEEKDAYS[now.getDay()];
    elEnglish.textContent = formatEnglishDate(now);
    const bn = formatBanglaDate(now.getFullYear(), now.getMonth(), now.getDate());
    if (bn) { elBangla.textContent = bn; elBanglaBox.hidden = false; }
    else { elBanglaBox.hidden = true; }                      // নির্ভরযোগ্য না হলে বাংলা তারিখ দেখাব না
    elTime.textContent = formatTime(now);
  }
  tick();
  setInterval(tick, 1000);

}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', startPage);
}

// পরীক্ষার জন্য (ব্রাউজারে এটি কিছু করে না)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeText, filterTools, banglaDate, formatBanglaDate, toBanglaDigits, isLeapYear, parseIsoDate, nextHoliday, holidayTitleText, holidayDateText, holidayPillText, holidayOnDate, dayTypeText, fiscalYearText };
}
