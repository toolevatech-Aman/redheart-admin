// Ready-made festival themes for the Site Themes page. Picking one fills the
// form (name, main colour, banner, dates); everything stays editable.
// date: fixed {m,d}; or {rule} for computed dates; or null for lunar festivals
// whose date moves every year (the admin sets those by hand).

const nthWeekday = (year, month, weekday, n) => {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
};

// Anonymous Gregorian algorithm.
const easter = (year) => {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { m: month, d: day };
};
const easterPlus = (year, delta) => {
  const e = easter(year);
  const dt = new Date(Date.UTC(year, e.m - 1, e.d + delta));
  return { m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
};

const RULES = {
  mothersDay: (y) => ({ m: 5, d: nthWeekday(y, 5, 0, 2) }),
  fathersDay: (y) => ({ m: 6, d: nthWeekday(y, 6, 0, 3) }),
  friendshipDay: (y) => ({ m: 8, d: nthWeekday(y, 8, 0, 1) }),
  goodFriday: (y) => easterPlus(y, -2),
  easter: (y) => easterPlus(y, 0),
};

// Festivals that have a full festive effect (artwork in the storefront). Others get colour + banner only.
export const FX_STYLES = { "durga-puja": "durga", holi: "holi", diwali: "diwali", christmas: "christmas" };

const f = (key, name, primary, text, annBg, annColor, date = null) => ({ key, name, primary, text, annBg, annColor, date, style: FX_STYLES[key] || "" });

export const FESTIVALS = [
  f("durga-puja", "Durga Puja", "#b91c1c", "Shubho Durga Puja from RedHeart", "#7f1d1d", "#fef3c7"),
  f("karwa-chauth", "Karwa Chauth", "#be123c", "Happy Karwa Chauth - gifts for your forever person", "#881337", "#ffffff"),
  f("diwali", "Diwali", "#c2410c", "Happy Diwali from RedHeart - gifts that light up their day", "#1e1b4b", "#fcd34d"),
  f("bhai-dooj", "Bhai Dooj", "#be185d", "Happy Bhai Dooj - send a gift to your brother or sister", "#831843", "#ffffff"),
  f("chhath-puja", "Chhath Puja", "#ea580c", "Chhath Puja ki hardik shubhkamnayein", "#7c2d12", "#ffffff"),
  f("christmas", "Christmas", "#15803d", "Merry Christmas from RedHeart", "#991b1b", "#ffffff", { m: 12, d: 25 }),
  f("new-year", "New Year", "#4338ca", "Happy New Year from RedHeart", "#111827", "#fde047", { m: 1, d: 1 }),
  f("lohri", "Lohri", "#dc2626", "Happy Lohri from RedHeart", "#7c2d12", "#fde68a", { m: 1, d: 13 }),
  f("vasant-panchami", "Vasant Panchami", "#a16207", "Happy Vasant Panchami", "#713f12", "#fef9c3"),
  f("republic-day", "Republic Day", "#15803d", "Happy Republic Day from RedHeart", "#c2410c", "#ffffff", { m: 1, d: 26 }),
  f("rose-day", "Rose Day", "#be123c", "Happy Rose Day - say it with flowers", "#881337", "#ffffff", { m: 2, d: 7 }),
  f("propose-day", "Propose Day", "#db2777", "Happy Propose Day from RedHeart", "#831843", "#ffffff", { m: 2, d: 8 }),
  f("chocolate-day", "Chocolate Day", "#92400e", "Happy Chocolate Day from RedHeart", "#451a03", "#fde68a", { m: 2, d: 9 }),
  f("teddy-day", "Teddy Day", "#b45309", "Happy Teddy Day from RedHeart", "#78350f", "#ffffff", { m: 2, d: 10 }),
  f("promise-day", "Promise Day", "#7c3aed", "Happy Promise Day from RedHeart", "#4c1d95", "#ffffff", { m: 2, d: 11 }),
  f("hug-day", "Hug Day", "#c026d3", "Happy Hug Day from RedHeart", "#701a75", "#ffffff", { m: 2, d: 12 }),
  f("kiss-day", "Kiss Day", "#9f1239", "Happy Kiss Day from RedHeart", "#4c0519", "#ffffff", { m: 2, d: 13 }),
  f("valentines-day", "Valentine's Day", "#e11d48", "Happy Valentine's Day from RedHeart", "#881337", "#ffffff", { m: 2, d: 14 }),
  f("holi", "Holi", "#c026d3", "Happy Holi from RedHeart", "#701a75", "#fef08a"),
  f("eid", "Eid", "#047857", "Eid Mubarak from RedHeart", "#064e3b", "#ffffff"),
  f("ram-navami", "Ram Navami", "#ea580c", "Happy Ram Navami", "#7c2d12", "#ffffff"),
  f("good-friday", "Good Friday", "#475569", "Good Friday", "#1e293b", "#ffffff", { rule: "goodFriday" }),
  f("easter", "Easter", "#9333ea", "Happy Easter from RedHeart", "#581c87", "#ffffff", { rule: "easter" }),
  f("baisakhi", "Baisakhi", "#b45309", "Happy Baisakhi from RedHeart", "#78350f", "#fef3c7", { m: 4, d: 14 }),
  f("earth-day", "Earth Day", "#15803d", "Happy Earth Day - say it with plants", "#14532d", "#ffffff", { m: 4, d: 22 }),
  f("buddha-purnima", "Buddha Purnima", "#0e7490", "Happy Buddha Purnima", "#164e63", "#ffffff"),
  f("mothers-day", "Mother's Day", "#db2777", "Happy Mother's Day - tell her with flowers", "#831843", "#ffffff", { rule: "mothersDay" }),
  f("eid-al-adha", "Eid al-Adha", "#0f766e", "Eid al-Adha Mubarak from RedHeart", "#134e4a", "#ffffff"),
  f("environment-day", "World Environment Day", "#166534", "World Environment Day - gift a plant", "#14532d", "#ffffff", { m: 6, d: 5 }),
  f("fathers-day", "Father's Day", "#1d4ed8", "Happy Father's Day from RedHeart", "#1e3a8a", "#ffffff", { rule: "fathersDay" }),
  f("guru-purnima", "Guru Purnima", "#9a3412", "Happy Guru Purnima", "#7c2d12", "#fef3c7"),
  f("friendship-day", "Friendship Day", "#0284c7", "Happy Friendship Day from RedHeart", "#0c4a6e", "#ffffff", { rule: "friendshipDay" }),
  f("independence-day", "Independence Day", "#c2410c", "Happy Independence Day from RedHeart", "#166534", "#ffffff", { m: 8, d: 15 }),
  f("onam", "Onam", "#b45309", "Happy Onam from RedHeart", "#166534", "#fef3c7"),
  f("raksha-bandhan", "Raksha Bandhan", "#be185d", "Happy Raksha Bandhan - send a gift to your brother or sister", "#831843", "#ffffff"),
  f("janmashtami", "Krishna Janmashtami", "#2563eb", "Happy Krishna Janmashtami", "#1e3a8a", "#fde68a"),
  f("teachers-day", "Teachers' Day", "#1d4ed8", "Happy Teachers' Day from RedHeart", "#1e3a8a", "#ffffff", { m: 9, d: 5 }),
  f("ganesh-chaturthi", "Ganesh Chaturthi", "#ea580c", "Ganpati Bappa Morya - Happy Ganesh Chaturthi", "#7c2d12", "#ffffff"),
  f("engineers-day", "Engineers' Day", "#0369a1", "Happy Engineers' Day from RedHeart", "#0c4a6e", "#ffffff", { m: 9, d: 15 }),
];

const pad = (n) => String(n).padStart(2, "0");

// Next occurrence (today or later, in IST) as { start, end } datetime-local
// strings covering the whole day, or null when the date isn't fixed.
export function nextOccurrence(festival, now = new Date()) {
  if (!festival.date) return null;
  const ist = new Date(now.getTime() + 330 * 60000);
  const today = `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}`;
  for (let year = ist.getUTCFullYear(); year <= ist.getUTCFullYear() + 1; year++) {
    const md = festival.date.rule ? RULES[festival.date.rule](year) : festival.date;
    const day = `${year}-${pad(md.m)}-${pad(md.d)}`;
    if (day >= today) return { start: `${day}T00:00`, end: `${day}T23:59` };
  }
  return null;
}
