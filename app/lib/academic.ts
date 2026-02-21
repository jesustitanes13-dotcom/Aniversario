export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const WEEK_DAYS: WeekDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type TaskType = "assignment" | "exam";

export interface Subject {
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

export interface TaskItem {
  id: string;
  subjectId: string;
  title: string;
  dueAt: string;
  completed: boolean;
  type: TaskType;
}

export interface StreakState {
  count: number;
  lastMarkedDate: string | null;
}

export interface ParsedSyllabus {
  sourceText: string;
  gradingWeights: Record<string, number>;
  dropRules: string[];
  policyLines: string[];
  topics: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface HistoryEvent {
  id: string;
  kind:
    | "discipline"
    | "subject"
    | "schedule"
    | "task"
    | "syllabus"
    | "notification"
    | "system";
  message: string;
  createdAt: string;
}

export interface DisciplineData {
  examMode: boolean;
  streak: StreakState;
  subjects: Subject[];
  schedule: ScheduleBlock[];
  tasks: TaskItem[];
  syllabus: ParsedSyllabus;
  chatHistory: ChatMessage[];
  history: HistoryEvent[];
  notificationEmail: string;
  remindersEnabled: boolean;
  sentReminderKeys: string[];
  componentScores: Record<string, number>;
  selectedScenarioComponent: string;
}

export const DEFAULT_WEIGHTS: Record<string, number> = {
  Homework: 25,
  Labs: 20,
  Midterm: 25,
  Final: 30,
};

export const DEFAULT_DISCIPLINE_DATA: DisciplineData = {
  examMode: false,
  streak: {
    count: 0,
    lastMarkedDate: null,
  },
  subjects: [],
  schedule: [],
  tasks: [],
  syllabus: {
    sourceText: "",
    gradingWeights: {},
    dropRules: [],
    policyLines: [],
    topics: [],
  },
  chatHistory: [],
  history: [],
  notificationEmail: "",
  remindersEnabled: false,
  sentReminderKeys: [],
  componentScores: {},
  selectedScenarioComponent: "Final",
};

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fromDateToWeekDay = (date: Date): WeekDay => {
  const index = date.getDay();
  const converted = index === 0 ? 6 : index - 1;
  return WEEK_DAYS[converted];
};

export const formatTimeLabel = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const helperDate = new Date();
  helperDate.setHours(h, m, 0, 0);
  return helperDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getDaysUntil = (isoDate: string, now = new Date()) => {
  const target = new Date(isoDate);
  const ms = target.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

export const formatCountdown = (targetIso: string, now = new Date()) => {
  const target = new Date(targetIso);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Due now";
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m`;
};

export const getGraduationCountdown = (
  target: Date,
  now = new Date(),
): string => {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Graduation milestone reached.";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days - years * 365 - months * 30;
  return `${years}y ${months}m ${remainingDays}d remaining`;
};

interface ScheduleStatus {
  currentlyIn?: {
    block: ScheduleBlock;
    subjectName: string;
  };
  nextBlock?: {
    block: ScheduleBlock;
    subjectName: string;
    day: WeekDay;
  };
}

export const getScheduleStatus = (
  schedule: ScheduleBlock[],
  subjects: Subject[],
  now = new Date(),
): ScheduleStatus => {
  const weekDay = fromDateToWeekDay(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const byDay = schedule.filter((block) => block.day === weekDay);
  const sortedToday = [...byDay].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start),
  );

  const findSubjectName = (subjectId: string) =>
    subjects.find((subject) => subject.id === subjectId)?.name ?? "Unknown subject";

  for (const block of sortedToday) {
    const start = toMinutes(block.start);
    const end = toMinutes(block.end);
    if (nowMinutes >= start && nowMinutes < end) {
      return {
        currentlyIn: {
          block,
          subjectName: findSubjectName(block.subjectId),
        },
      };
    }
  }

  const nextToday = sortedToday.find((block) => toMinutes(block.start) > nowMinutes);
  if (nextToday) {
    return {
      nextBlock: {
        block: nextToday,
        subjectName: findSubjectName(nextToday.subjectId),
        day: weekDay,
      },
    };
  }

  const todayIndex = WEEK_DAYS.indexOf(weekDay);
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidateDay = WEEK_DAYS[(todayIndex + offset) % WEEK_DAYS.length];
    const blocks = schedule
      .filter((block) => block.day === candidateDay)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    if (blocks.length > 0) {
      const block = blocks[0];
      return {
        nextBlock: {
          block,
          subjectName: findSubjectName(block.subjectId),
          day: candidateDay,
        },
      };
    }
  }

  return {};
};

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

const scoreLineForQuery = (line: string, queryTokens: string[]) => {
  const lower = line.toLowerCase();
  return queryTokens.reduce(
    (score, token) => score + (lower.includes(token) ? 1 : 0),
    0,
  );
};

export const parseSyllabus = (sourceText: string): ParsedSyllabus => {
  const lines = sourceText
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const gradingWeights: Record<string, number> = {};

  for (const line of lines) {
    const matches = [...line.matchAll(/([A-Za-z][A-Za-z0-9\s/&()_-]{1,40}?)\s*[:=\-]?\s*(\d{1,3})\s*%/g)];
    for (const match of matches) {
      const label = match[1]?.replace(/\s+/g, " ").trim();
      const rawWeight = Number(match[2]);
      if (!label || Number.isNaN(rawWeight)) continue;
      if (rawWeight < 0 || rawWeight > 100) continue;
      if (!gradingWeights[label]) {
        gradingWeights[label] = rawWeight;
      }
    }
  }

  const dropRules = lines
    .filter((line) => /(drop|lowest|replace|bonus|curve)/i.test(line))
    .slice(0, 8);

  const policyLines = lines
    .filter((line) =>
      /(late|office hours?|attendance|make[- ]?up|integrity|plagiarism|submission|deadline)/i.test(
        line,
      ),
    )
    .slice(0, 18);

  const topics = lines
    .filter(
      (line) =>
        line.length >= 8 &&
        line.length <= 120 &&
        !/%/.test(line) &&
        !/(late|office hours?|attendance|integrity|plagiarism|submission|deadline)/i.test(line),
    )
    .slice(0, 24);

  return {
    sourceText,
    gradingWeights,
    dropRules,
    policyLines,
    topics,
  };
};

export const answerSyllabusQuestion = (
  question: string,
  syllabus: ParsedSyllabus,
): string => {
  const q = question.trim();
  if (!q) {
    return "Ask a specific syllabus question and I will answer with precision.";
  }

  if (!syllabus.sourceText.trim()) {
    return "No syllabus is loaded. Upload an image or paste the syllabus text first.";
  }

  const lowerQuestion = q.toLowerCase();

  if (lowerQuestion.includes("late")) {
    const lateLine = syllabus.policyLines.find((line) => /late/i.test(line));
    if (lateLine) {
      return `Late policy located: ${lateLine}`;
    }
  }

  if (lowerQuestion.includes("office hour")) {
    const officeLine = syllabus.policyLines.find((line) => /office hours?/i.test(line));
    if (officeLine) {
      return `Office-hours reference found: ${officeLine}`;
    }
  }

  if (/(drop|lowest|replace)/i.test(lowerQuestion) && syllabus.dropRules.length > 0) {
    return `Detected grading rules: ${syllabus.dropRules.join(" | ")}`;
  }

  if (/(weight|weights|grade|percentage|percent)/i.test(lowerQuestion)) {
    const entries = Object.entries(syllabus.gradingWeights);
    if (entries.length === 0) {
      return "No explicit grading percentages were detected in the provided syllabus.";
    }
    return `Grading weights extracted: ${entries
      .map(([name, weight]) => `${name} ${weight}%`)
      .join(", ")}.`;
  }

  const candidateLines = syllabus.sourceText
    .replace(/\r/g, "")
    .split(/[\n.]/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 20 && line.length <= 220);

  const queryTokens = tokenize(lowerQuestion);
  const ranked = candidateLines
    .map((line) => ({
      line,
      score: scoreLineForQuery(line, queryTokens),
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0] && ranked[0].score > 0) {
    const highlights = ranked
      .filter((item) => item.score > 0)
      .slice(0, 2)
      .map((item) => `- ${item.line}`);
    return `Closest syllabus evidence:\n${highlights.join("\n")}`;
  }

  return "The syllabus does not include a direct answer for that question. Rephrase with keywords such as due dates, attendance, submission, or grading.";
};

export const getEffectiveWeights = (syllabusWeights: Record<string, number>) => {
  return Object.keys(syllabusWeights).length > 0 ? syllabusWeights : DEFAULT_WEIGHTS;
};

export const computeCurrentGrade = (
  weights: Record<string, number>,
  scores: Record<string, number>,
) => {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  if (entries.length === 0) return 0;
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight <= 0) return 0;
  const weightedPoints = entries.reduce((sum, [component, weight]) => {
    const score = clamp(scores[component] ?? 0, 0, 100);
    return sum + score * weight;
  }, 0);
  return weightedPoints / totalWeight;
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
    const score = clamp(scores[name] ?? 0, 0, 100);
    return sum + score * weight;
  }, 0);

  const needed = (target * totalWeight - earnedWithoutComponent) / selectedWeight;
  return Number.isFinite(needed) ? needed : null;
};

export interface RoadmapItem {
  date: string;
  action: string;
}

export const generateExamRoadmap = (
  exam: TaskItem,
  topics: string[],
  now = new Date(),
): RoadmapItem[] => {
  const examDate = new Date(exam.dueAt);
  const msDiff = examDate.getTime() - now.getTime();
  const daysLeft = clamp(Math.ceil(msDiff / (1000 * 60 * 60 * 24)), 1, 21);
  const usableTopics =
    topics.length > 0
      ? topics
      : [
          "Core concepts review",
          "Problem-solving drills",
          "Error log revision",
          "Timed mock exam",
        ];

  const roadmap: RoadmapItem[] = [];
  for (let i = 0; i < daysLeft; i += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const topic = usableTopics[i % usableTopics.length];
    let action = `Deep work block on: ${topic}.`;
    if (i === daysLeft - 1) {
      action = "Final simulation under time constraints + concise formula sheet review.";
    } else if (i === daysLeft - 2) {
      action = "Focus weak points, close gaps, and rehearse likely exam prompts.";
    } else if (i === 0) {
      action = `Diagnostic pass: map weak zones and study ${topic}.`;
    }
    roadmap.push({
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      action,
    });
  }
  return roadmap;
};

export const mergeWithDefaults = (input: unknown): DisciplineData => {
  if (!input || typeof input !== "object") return DEFAULT_DISCIPLINE_DATA;
  const data = input as Partial<DisciplineData>;

  return {
    ...DEFAULT_DISCIPLINE_DATA,
    ...data,
    streak: {
      ...DEFAULT_DISCIPLINE_DATA.streak,
      ...data.streak,
    },
    syllabus: {
      ...DEFAULT_DISCIPLINE_DATA.syllabus,
      ...data.syllabus,
      gradingWeights: data.syllabus?.gradingWeights ?? {},
      dropRules: data.syllabus?.dropRules ?? [],
      policyLines: data.syllabus?.policyLines ?? [],
      topics: data.syllabus?.topics ?? [],
    },
    subjects: data.subjects ?? [],
    schedule: data.schedule ?? [],
    tasks: data.tasks ?? [],
    chatHistory: data.chatHistory ?? [],
    history: data.history ?? [],
    sentReminderKeys: data.sentReminderKeys ?? [],
    componentScores: data.componentScores ?? {},
  };
};

export const createSeniorPartnerBrief = (params: {
  streak: number;
  scheduleLine: string;
  urgentTasks: TaskItem[];
  currentGrade: number;
  targetScoreNeeded: number | null;
  scenarioComponent: string;
}) => {
  const urgentLine =
    params.urgentTasks.length > 0
      ? params.urgentTasks
          .slice(0, 3)
          .map((task) => {
            const days = getDaysUntil(task.dueAt);
            return `${task.title} (${days} day${days === 1 ? "" : "s"} left)`;
          })
          .join("; ")
      : "No urgent deadlines inside the next 72 hours.";

  const scoreLine =
    params.targetScoreNeeded === null
      ? "Target scenario unavailable for current grading setup."
      : `To lock an A (90), you need approximately ${params.targetScoreNeeded.toFixed(
          1,
        )}% on ${params.scenarioComponent}.`;

  return [
    "Senior Partner briefing:",
    `- Discipline streak: ${params.streak} day(s). Consistency remains the primary KPI.`,
    `- Right now status: ${params.scheduleLine}`,
    `- Urgent deadline queue: ${urgentLine}`,
    `- Current weighted grade: ${params.currentGrade.toFixed(2)}%.`,
    `- ${scoreLine}`,
    "- Execute one high-focus block immediately after this check-in.",
  ].join("\n");
};
