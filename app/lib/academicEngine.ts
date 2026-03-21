export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type AssignmentType = "assignment" | "exam";

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  credits: number;
}

export interface ScheduleBlock {
  id: string;
  subjectId: string;
  day: WeekDay;
  start: string;
  end: string;
}

export interface AssignmentItem {
  id: string;
  subjectId: string;
  title: string;
  dueAt: string;
  completed: boolean;
  type: AssignmentType;
  source?: "manual" | "syllabus";
}

export interface ImportantDate {
  id: string;
  label: string;
  dueAt: string;
  type: AssignmentType;
  sourceLine: string;
}

export interface ParsedSyllabus {
  sourceText: string;
  gradingWeights: Record<string, number>;
  importantDates: ImportantDate[];
  policyLines: string[];
  dropRules: string[];
  topics: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface SemesterRecord {
  term: string;
  gpa: number;
  credits: number;
}

export interface HistoryEvent {
  id: string;
  kind:
    | "discipline"
    | "subject"
    | "schedule"
    | "assignment"
    | "syllabus"
    | "notification"
    | "profile"
    | "system";
  message: string;
  createdAt: string;
}

export interface DisciplineState {
  examMode: boolean;
  streakCount: number;
  streakDate: string | null;
  subjects: SubjectItem[];
  schedule: ScheduleBlock[];
  assignments: AssignmentItem[];
  syllabus: ParsedSyllabus;
  chatHistory: ChatMessage[];
  history: HistoryEvent[];
  notificationEmail: string;
  remindersEnabled: boolean;
  sentReminderKeys: string[];
  componentScores: Record<string, number>;
  selectedScenarioComponent: string;
  semesterHistory: SemesterRecord[];
  cumulativeGpa: number;
}

export const WEEK_DAYS: WeekDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const DATE_HINT_REGEX =
  /(exam|midterm|final|quiz|project|deadline|due|submission|lab|presentation|test)/i;

export const DEFAULT_WEIGHTS: Record<string, number> = {
  Exams: 40,
  Labs: 20,
  Homework: 15,
  Project: 10,
  Final: 15,
};

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const fromDateToWeekDay = (date: Date): WeekDay => {
  const index = date.getDay();
  const converted = index === 0 ? 6 : index - 1;
  return WEEK_DAYS[converted];
};

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const formatTimeLabel = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const helper = new Date();
  helper.setHours(h, m, 0, 0);
  return helper.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDateLabel = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getDaysUntil = (iso: string, now = new Date()) => {
  const target = new Date(iso);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getGraduationCountdown = (target: Date, now = new Date()) => {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Graduation reached";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const rest = days - years * 365 - months * 30;
  return `${years}y ${months}m ${rest}d`;
};

export const formatCountdown = (iso: string, now = new Date()) => {
  const target = new Date(iso);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Due now";
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  return `${days}d ${hours}h`;
};

const normalizeYear = (yearRaw: string | undefined, nowYear: number) => {
  if (!yearRaw) return nowYear;
  const n = Number(yearRaw);
  if (n < 100) return 2000 + n;
  return n;
};

const tryParseDate = (line: string, now = new Date()) => {
  const monthMatch = line.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:,?\s*(\d{2,4}))?\b/i,
  );
  if (monthMatch) {
    const monthToken = monthMatch[1].toLowerCase();
    const day = Number(monthMatch[2]);
    const year = normalizeYear(monthMatch[3], now.getFullYear());
    const month = MONTH_INDEX[monthToken];
    if (month !== undefined && day >= 1 && day <= 31) {
      const date = new Date(year, month, day, 12, 0, 0, 0);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }

  const numeric = line.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numeric) {
    const month = Number(numeric[1]) - 1;
    const day = Number(numeric[2]);
    const year = normalizeYear(numeric[3], now.getFullYear());
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const date = new Date(year, month, day, 12, 0, 0, 0);
      if (!Number.isNaN(date.getTime())) return date;
    }
  }
  return null;
};

export const parseSyllabus = (sourceText: string): ParsedSyllabus => {
  const lines = sourceText
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const gradingWeights: Record<string, number> = {};
  for (const line of lines) {
    const matches = [
      ...line.matchAll(
        /([A-Za-z][A-Za-z0-9\s/&()_-]{1,40}?)\s*[:=\-]?\s*(\d{1,3})\s*%/g,
      ),
    ];
    for (const match of matches) {
      const label = match[1]?.replace(/\s+/g, " ").trim();
      const weight = Number(match[2]);
      if (!label || Number.isNaN(weight) || weight < 0 || weight > 100) continue;
      if (!gradingWeights[label]) gradingWeights[label] = weight;
    }
  }

  const policyLines = lines
    .filter((line) =>
      /(late|attendance|office hours?|integrity|submission|deadline|absence|make[- ]?up)/i.test(
        line,
      ),
    )
    .slice(0, 18);

  const dropRules = lines
    .filter((line) => /(drop|lowest|bonus|curve|replace)/i.test(line))
    .slice(0, 10);

  const topics = lines
    .filter(
      (line) =>
        line.length >= 10 &&
        line.length <= 120 &&
        !/%/.test(line) &&
        !/(office|attendance|integrity|submission|deadline|late)/i.test(line),
    )
    .slice(0, 28);

  const importantDates: ImportantDate[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (!DATE_HINT_REGEX.test(line)) continue;
    const parsedDate = tryParseDate(line);
    if (!parsedDate) continue;
    const type: AssignmentType = /(exam|midterm|final|quiz|test)/i.test(line)
      ? "exam"
      : "assignment";
    const label = line.replace(/\s+/g, " ").slice(0, 120);
    const dueAt = parsedDate.toISOString();
    const key = `${label.toLowerCase()}::${dueAt.slice(0, 10)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    importantDates.push({
      id: createId(),
      label,
      dueAt,
      type,
      sourceLine: line,
    });
  }

  return {
    sourceText,
    gradingWeights,
    importantDates: importantDates.sort(
      (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    ),
    policyLines,
    dropRules,
    topics,
  };
};

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

export const answerSyllabusQuestionLocal = (
  question: string,
  syllabus: ParsedSyllabus,
) => {
  const query = question.trim();
  if (!query) return "Please ask a specific question.";
  if (!syllabus.sourceText.trim()) {
    return "No syllabus loaded yet. Paste text or run OCR first.";
  }

  const lower = query.toLowerCase();
  if (lower.includes("attendance")) {
    const line = syllabus.policyLines.find((item) => /attendance/i.test(item));
    if (line) return `Attendance policy found: ${line}`;
  }
  if (lower.includes("late")) {
    const line = syllabus.policyLines.find((item) => /late/i.test(item));
    if (line) return `Late policy found: ${line}`;
  }
  if (/(weight|percentage|grade)/i.test(lower)) {
    const entries = Object.entries(syllabus.gradingWeights);
    if (entries.length === 0) {
      return "No explicit grading percentages detected in the syllabus text.";
    }
    return entries.map(([name, weight]) => `${name}: ${weight}%`).join(" | ");
  }

  const candidates = syllabus.sourceText
    .replace(/\r/g, "")
    .split(/[\n.]/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 20 && line.length <= 220);

  const tokens = tokenize(lower);
  const ranked = candidates
    .map((line) => ({
      line,
      score: tokens.reduce(
        (sum, token) => sum + (line.toLowerCase().includes(token) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0] && ranked[0].score > 0) {
    return `Closest match: ${ranked[0].line}`;
  }
  return "No direct evidence in the syllabus for that query. Try another keyword.";
};

export const getEffectiveWeights = (weights: Record<string, number>) =>
  Object.keys(weights).length > 0 ? weights : DEFAULT_WEIGHTS;

export const computeCurrentGrade = (
  weights: Record<string, number>,
  scores: Record<string, number>,
) => {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total === 0) return 0;
  const points = entries.reduce((sum, [name, weight]) => {
    return sum + clamp(scores[name] ?? 0, 0, 100) * weight;
  }, 0);
  return points / total;
};

export const computeScoreNeeded = (
  target: number,
  component: string,
  weights: Record<string, number>,
  scores: Record<string, number>,
) => {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  if (entries.length === 0) return null;
  const selectedWeight = weights[component];
  if (!selectedWeight || selectedWeight <= 0) return null;

  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const earnedWithoutComponent = entries.reduce((sum, [name, weight]) => {
    if (name === component) return sum;
    return sum + clamp(scores[name] ?? 0, 0, 100) * weight;
  }, 0);
  const needed = (target * totalWeight - earnedWithoutComponent) / selectedWeight;
  return Number.isFinite(needed) ? needed : null;
};

export const percentToFourScale = (percent: number) => {
  if (percent >= 93) return 4;
  if (percent >= 90) return 3.7;
  if (percent >= 87) return 3.3;
  if (percent >= 83) return 3;
  if (percent >= 80) return 2.7;
  if (percent >= 77) return 2.3;
  if (percent >= 73) return 2;
  if (percent >= 70) return 1.7;
  if (percent >= 67) return 1.3;
  if (percent >= 63) return 1;
  if (percent >= 60) return 0.7;
  return 0;
};

const buildDefaultSemesterHistory = () => {
  const records: SemesterRecord[] = [{ term: "Fall 2025", gpa: 0, credits: 15 }];
  for (let year = 2026; year <= 2029; year += 1) {
    records.push({ term: `Spring ${year}`, gpa: 0, credits: 15 });
    records.push({ term: `Fall ${year}`, gpa: 0, credits: 15 });
  }
  return records;
};

export const DEFAULT_SEMESTER_HISTORY = buildDefaultSemesterHistory();

export const computeCumulativeGpa = (history: SemesterRecord[]) => {
  const valid = history.filter((item) => item.gpa > 0 && item.credits > 0);
  const totalCredits = valid.reduce((sum, item) => sum + item.credits, 0);
  if (totalCredits === 0) return 0;
  const totalPoints = valid.reduce((sum, item) => sum + item.gpa * item.credits, 0);
  return totalPoints / totalCredits;
};

export interface CalendarCell {
  isoDate: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  assignments: AssignmentItem[];
}

export const buildMonthlyCalendar = (anchor: Date, assignments: AssignmentItem[]) => {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const firstWeekDay = first.getDay();
  const gridStart = new Date(year, month, 1 - firstWeekDay);
  const weeks: CalendarCell[][] = [];

  for (let row = 0; row < 6; row += 1) {
    const week: CalendarCell[] = [];
    for (let col = 0; col < 7; col += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + row * 7 + col);
      const isoDate = date.toISOString().slice(0, 10);
      const dayAssignments = assignments.filter(
        (item) => item.dueAt.slice(0, 10) === isoDate,
      );
      week.push({
        isoDate,
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === month,
        isToday: isoDate === new Date().toISOString().slice(0, 10),
        assignments: dayAssignments,
      });
    }
    weeks.push(week);
  }
  return weeks;
};

export const buildSevenDayActionPlan = (
  assignments: AssignmentItem[],
  now = new Date(),
) => {
  return assignments
    .filter((item) => !item.completed)
    .filter((item) => {
      const days = getDaysUntil(item.dueAt, now);
      return days >= 0 && days <= 7;
    })
    .sort((a, b) => {
      const dayDiff = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      if (dayDiff !== 0) return dayDiff;
      if (a.type === b.type) return 0;
      return a.type === "exam" ? -1 : 1;
    })
    .map((item) => {
      const days = getDaysUntil(item.dueAt, now);
      const priority = days <= 2 ? "Critical" : days <= 4 ? "High" : "Medium";
      return { item, priority, days };
    });
};

export const getScheduleStatusLine = (
  schedule: ScheduleBlock[],
  subjects: SubjectItem[],
  now = new Date(),
) => {
  const weekDay = fromDateToWeekDay(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayBlocks = schedule
    .filter((block) => block.day === weekDay)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const subjectName = (subjectId: string) =>
    subjects.find((item) => item.id === subjectId)?.name ?? "Unknown subject";

  for (const block of todayBlocks) {
    const start = toMinutes(block.start);
    const end = toMinutes(block.end);
    if (nowMinutes >= start && nowMinutes < end) {
      return `CURRENTLY IN: ${subjectName(block.subjectId)} (${formatTimeLabel(
        block.start,
      )} - ${formatTimeLabel(block.end)})`;
    }
  }

  const nextToday = todayBlocks.find((block) => toMinutes(block.start) > nowMinutes);
  if (nextToday) {
    return `FREE TIME: Next block starts at ${formatTimeLabel(
      nextToday.start,
    )} (${subjectName(nextToday.subjectId)})`;
  }
  return "FREE TIME: no class block configured.";
};

export const createSeniorPartnerBrief = (params: {
  streak: number;
  rightNowLine: string;
  currentGrade: number;
  cumulativeGpa: number;
  actionItems: number;
  scoreNeeded: number | null;
  selectedComponent: string;
}) => {
  const scenario =
    params.scoreNeeded === null
      ? "No what-if scenario available."
      : `Need ${params.scoreNeeded.toFixed(1)}% on ${params.selectedComponent} to lock an A.`;
  return [
    "Senior Partner Brief",
    `- Discipline streak KPI: ${params.streak} day(s).`,
    `- Runtime status: ${params.rightNowLine}`,
    `- Current class grade: ${params.currentGrade.toFixed(2)}%.`,
    `- Cumulative GPA (4.0): ${params.cumulativeGpa.toFixed(2)}.`,
    `- 7-day action queue: ${params.actionItems} critical item(s).`,
    `- ${scenario}`,
    "- Execute your highest-leverage task now.",
  ].join("\n");
};

export const DEFAULT_STATE: DisciplineState = {
  examMode: false,
  streakCount: 0,
  streakDate: null,
  subjects: [],
  schedule: [],
  assignments: [],
  syllabus: {
    sourceText: "",
    gradingWeights: {},
    importantDates: [],
    policyLines: [],
    dropRules: [],
    topics: [],
  },
  chatHistory: [],
  history: [],
  notificationEmail: "",
  remindersEnabled: false,
  sentReminderKeys: [],
  componentScores: {},
  selectedScenarioComponent: "Final",
  semesterHistory: DEFAULT_SEMESTER_HISTORY,
  cumulativeGpa: 0,
};

export const mergeWithDefaults = (input: unknown): DisciplineState => {
  if (!input || typeof input !== "object") return DEFAULT_STATE;
  const data = input as Partial<DisciplineState>;
  const semesterHistory =
    data.semesterHistory && data.semesterHistory.length > 0
      ? data.semesterHistory
      : DEFAULT_SEMESTER_HISTORY;
  return {
    ...DEFAULT_STATE,
    ...data,
    subjects: data.subjects ?? [],
    schedule: data.schedule ?? [],
    assignments: data.assignments ?? [],
    history: data.history ?? [],
    chatHistory: data.chatHistory ?? [],
    sentReminderKeys: data.sentReminderKeys ?? [],
    componentScores: data.componentScores ?? {},
    semesterHistory,
    cumulativeGpa: data.cumulativeGpa ?? computeCumulativeGpa(semesterHistory),
    syllabus: {
      ...DEFAULT_STATE.syllabus,
      ...data.syllabus,
      gradingWeights: data.syllabus?.gradingWeights ?? {},
      importantDates: data.syllabus?.importantDates ?? [],
      policyLines: data.syllabus?.policyLines ?? [],
      dropRules: data.syllabus?.dropRules ?? [],
      topics: data.syllabus?.topics ?? [],
    },
  };
};
