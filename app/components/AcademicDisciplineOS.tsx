"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  History,
  Home,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  DEFAULT_DISCIPLINE_DATA,
  type DisciplineData,
  type HistoryEvent,
  type ScheduleBlock,
  type Subject,
  type TaskItem,
  type WeekDay,
  WEEK_DAYS,
  answerSyllabusQuestion,
  computeCurrentGrade,
  computeScoreNeeded,
  createId,
  createSeniorPartnerBrief,
  formatCountdown,
  formatDateLabel,
  formatTimeLabel,
  generateExamRoadmap,
  getDaysUntil,
  getEffectiveWeights,
  getGraduationCountdown,
  getScheduleStatus,
  mergeWithDefaults,
  parseSyllabus,
} from "../lib/academic";

type NavTab = "home" | "works" | "history";

type HistoryKind = HistoryEvent["kind"];

const STORAGE_KEY = "academic-discipline-os-v1";
const DAILY_REMINDER_SCAN_KEY = "academic-discipline-os-last-reminder-scan";
const SUPABASE_TABLE = "discipline_os_state";

const buildDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const yesterdayKey = (today: Date) => {
  const date = new Date(today);
  date.setDate(today.getDate() - 1);
  return buildDateKey(date);
};

const HISTORY_KIND_STYLES: Record<HistoryKind, string> = {
  discipline: "text-orange-300",
  subject: "text-sky-300",
  schedule: "text-indigo-300",
  task: "text-emerald-300",
  syllabus: "text-cyan-300",
  notification: "text-amber-300",
  system: "text-zinc-300",
};

export default function AcademicDisciplineOS() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [data, setData] = useState<DisciplineData>(DEFAULT_DISCIPLINE_DATA);
  const [now, setNow] = useState<Date>(new Date());
  const [hydrated, setHydrated] = useState(false);
  const [loadingFromCloud, setLoadingFromCloud] = useState(false);
  const [statusLine, setStatusLine] = useState("");

  const [subjectForm, setSubjectForm] = useState({
    code: "",
    name: "",
    credits: 3,
  });
  const [scheduleForm, setScheduleForm] = useState<{
    subjectId: string;
    day: WeekDay;
    start: string;
    end: string;
  }>({
    subjectId: "",
    day: "Monday",
    start: "09:00",
    end: "10:30",
  });
  const [taskForm, setTaskForm] = useState({
    subjectId: "",
    title: "",
    dueAt: "",
    type: "assignment" as TaskItem["type"],
  });
  const [syllabusInput, setSyllabusInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const supabaseClient = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    return createClient(url, anonKey);
  }, []);

  const palette = data.examMode
    ? {
        accent: "#ff6b00",
        accentSoft: "rgba(255,107,0,0.1)",
        border: "rgba(255,107,0,0.35)",
      }
    : {
        accent: "#0070f3",
        accentSoft: "rgba(0,112,243,0.12)",
        border: "rgba(0,112,243,0.35)",
      };

  const appendHistory = useCallback(
    (previous: DisciplineData, kind: HistoryKind, message: string): DisciplineData => {
      const nextHistory: HistoryEvent[] = [
        {
          id: createId(),
          kind,
          message,
          createdAt: new Date().toISOString(),
        },
        ...previous.history,
      ].slice(0, 240);
      return {
        ...previous,
        history: nextHistory,
      };
    },
    [],
  );

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (typeof window === "undefined") return;

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (!cancelled) {
            setData(mergeWithDefaults(parsed));
          }
        } catch {
          if (!cancelled) {
            setStatusLine("Stored local data was invalid and has been skipped.");
          }
        }
      }

      if (supabaseClient) {
        setLoadingFromCloud(true);
        try {
          const { data: authData } = await supabaseClient.auth.getUser();
          const userId = authData.user?.id;
          if (userId) {
            const { data: row } = await supabaseClient
              .from(SUPABASE_TABLE)
              .select("payload")
              .eq("user_id", userId)
              .maybeSingle();

            if (!cancelled && row?.payload) {
              setData(mergeWithDefaults(row.payload));
              setStatusLine("Supabase cloud state synchronized.");
            }
          }
        } catch {
          if (!cancelled) {
            setStatusLine("Supabase sync unavailable. Running in LocalStorage mode.");
          }
        } finally {
          if (!cancelled) setLoadingFromCloud(false);
        }
      }

      if (!cancelled) setHydrated(true);
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [supabaseClient]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    if (!supabaseClient) return;
    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          const { data: authData } = await supabaseClient.auth.getUser();
          const userId = authData.user?.id;
          if (!userId) return;
          await supabaseClient.from(SUPABASE_TABLE).upsert(
            {
              user_id: userId,
              payload: data,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id",
            },
          );
        } catch {
          // Safe fallback: LocalStorage remains source of truth if cloud sync is unavailable.
        }
      })();
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [data, hydrated, supabaseClient]);

  useEffect(() => {
    if (!hydrated) return;
    setSyllabusInput((current) => current || data.syllabus.sourceText);
  }, [hydrated, data.syllabus.sourceText]);

  const scheduleStatus = useMemo(
    () => getScheduleStatus(data.schedule, data.subjects, now),
    [data.schedule, data.subjects, now],
  );

  const rightNowLine = useMemo(() => {
    if (scheduleStatus.currentlyIn) {
      const { subjectName, block } = scheduleStatus.currentlyIn;
      return `CURRENTLY IN: ${subjectName} (${formatTimeLabel(block.start)} - ${formatTimeLabel(
        block.end,
      )})`;
    }

    if (scheduleStatus.nextBlock) {
      const { subjectName, block, day } = scheduleStatus.nextBlock;
      return `FREE TIME: Next block starts ${day} at ${formatTimeLabel(
        block.start,
      )} (${subjectName})`;
    }

    return "FREE TIME: No schedule blocks configured.";
  }, [scheduleStatus]);

  const graduationCountdown = useMemo(() => {
    const graduationDate = new Date("2029-05-31T23:59:59");
    return getGraduationCountdown(graduationDate, now);
  }, [now]);

  const effectiveWeights = useMemo(
    () => getEffectiveWeights(data.syllabus.gradingWeights),
    [data.syllabus.gradingWeights],
  );

  const effectiveWeightEntries = useMemo(
    () => Object.entries(effectiveWeights),
    [effectiveWeights],
  );

  useEffect(() => {
    if (effectiveWeightEntries.length === 0) return;
    const defaultComponent = effectiveWeightEntries[0][0];
    setData((previous) => {
      if (previous.selectedScenarioComponent && effectiveWeights[previous.selectedScenarioComponent]) {
        return previous;
      }
      return {
        ...previous,
        selectedScenarioComponent: defaultComponent,
      };
    });
  }, [effectiveWeightEntries, effectiveWeights]);

  const currentGrade = useMemo(
    () => computeCurrentGrade(effectiveWeights, data.componentScores),
    [effectiveWeights, data.componentScores],
  );

  const scoreNeededForA = useMemo(
    () =>
      computeScoreNeeded(
        90,
        data.selectedScenarioComponent,
        effectiveWeights,
        data.componentScores,
      ),
    [data.componentScores, data.selectedScenarioComponent, effectiveWeights],
  );

  const urgentTasks = useMemo(
    () =>
      data.tasks
        .filter((task) => !task.completed)
        .filter((task) => {
          const days = getDaysUntil(task.dueAt, now);
          return days >= 0 && days <= 3;
        })
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [data.tasks, now],
  );

  const imminentExams = useMemo(
    () =>
      data.tasks
        .filter((task) => task.type === "exam" && !task.completed)
        .filter((task) => {
          const days = getDaysUntil(task.dueAt, now);
          return days >= 0 && days <= 7;
        })
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [data.tasks, now],
  );

  const examRoadmaps = useMemo(
    () =>
      imminentExams.map((exam) => ({
        exam,
        roadmap: generateExamRoadmap(exam, data.syllabus.topics, now),
      })),
    [data.syllabus.topics, imminentExams, now],
  );

  const groupedTasks = useMemo(() => {
    const bySubject = new Map<string, TaskItem[]>();
    for (const task of data.tasks) {
      const key = task.subjectId || "unassigned";
      const existing = bySubject.get(key) ?? [];
      existing.push(task);
      bySubject.set(key, existing);
    }
    for (const entries of bySubject.values()) {
      entries.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    }
    return bySubject;
  }, [data.tasks]);

  const scheduleLine = rightNowLine;
  const seniorPartnerBrief = useMemo(
    () =>
      createSeniorPartnerBrief({
        streak: data.streak.count,
        scheduleLine,
        urgentTasks,
        currentGrade,
        targetScoreNeeded: scoreNeededForA,
        scenarioComponent: data.selectedScenarioComponent,
      }),
    [currentGrade, data.selectedScenarioComponent, data.streak.count, scheduleLine, scoreNeededForA, urgentTasks],
  );

  const runReminderScan = useCallback(
    async (silent = false) => {
      if (!data.notificationEmail) {
        if (!silent) {
          setStatusLine("Set an email address first to enable deadline reminders.");
        }
        return;
      }

      setNotificationLoading(true);
      try {
        const response = await fetch("/api/notifications/reminders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientEmail: data.notificationEmail,
            tasks: data.tasks,
            sentReminderKeys: data.sentReminderKeys,
          }),
        });

        const result = (await response.json()) as {
          message: string;
          sentCount?: number;
          triggeredKeys?: string[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Reminder request failed.");
        }

        setData((previous) => {
          const merged = {
            ...previous,
            sentReminderKeys: [
              ...new Set([...(previous.sentReminderKeys ?? []), ...(result.triggeredKeys ?? [])]),
            ],
          };
          return appendHistory(
            merged,
            "notification",
            `Reminder scan executed. Emails sent: ${result.sentCount ?? 0}.`,
          );
        });
        if (!silent) {
          setStatusLine(result.message || "Reminder scan completed.");
        }
      } catch (error) {
        if (!silent) {
          setStatusLine(
            error instanceof Error
              ? error.message
              : "Reminder scan failed. Verify RESEND_API_KEY and from email.",
          );
        }
      } finally {
        setNotificationLoading(false);
      }
    },
    [appendHistory, data.notificationEmail, data.sentReminderKeys, data.tasks],
  );

  useEffect(() => {
    if (!hydrated || !data.remindersEnabled) return;
    if (typeof window === "undefined") return;
    if (!data.notificationEmail) return;

    const today = buildDateKey(new Date());
    const lastScan = window.localStorage.getItem(DAILY_REMINDER_SCAN_KEY);
    if (lastScan === today) return;

    window.localStorage.setItem(DAILY_REMINDER_SCAN_KEY, today);
    void runReminderScan(true);
  }, [data.notificationEmail, data.remindersEnabled, hydrated, runReminderScan]);

  const sortedSchedule = useMemo(() => {
    const dayPosition = new Map(WEEK_DAYS.map((day, index) => [day, index]));
    return [...data.schedule].sort((a, b) => {
      const dayDiff = (dayPosition.get(a.day) ?? 0) - (dayPosition.get(b.day) ?? 0);
      if (dayDiff !== 0) return dayDiff;
      return a.start.localeCompare(b.start);
    });
  }, [data.schedule]);

  const markDisciplineDone = () => {
    const today = buildDateKey(new Date());
    setData((previous) => {
      if (previous.streak.lastMarkedDate === today) {
        return previous;
      }
      const keepStreak = previous.streak.lastMarkedDate === yesterdayKey(new Date());
      const nextCount = keepStreak ? previous.streak.count + 1 : 1;
      const merged: DisciplineData = {
        ...previous,
        streak: {
          count: nextCount,
          lastMarkedDate: today,
        },
      };
      return appendHistory(
        merged,
        "discipline",
        `Discipline check completed for ${today}. Streak is now ${nextCount} day(s).`,
      );
    });
  };

  const addSubject = () => {
    const code = subjectForm.code.trim();
    const name = subjectForm.name.trim();
    if (!code || !name) {
      setStatusLine("Subject code and name are required.");
      return;
    }
    const credits = Number.isFinite(subjectForm.credits) ? subjectForm.credits : 3;
    const newSubject: Subject = {
      id: createId(),
      code,
      name,
      credits: Math.max(1, credits),
    };
    setData((previous) =>
      appendHistory(
        {
          ...previous,
          subjects: [...previous.subjects, newSubject],
        },
        "subject",
        `Subject added: ${code} - ${name}.`,
      ),
    );
    setSubjectForm({
      code: "",
      name: "",
      credits: 3,
    });
    setStatusLine("Subject added.");
  };

  const updateSubject = (subjectId: string, patch: Partial<Subject>) => {
    setData((previous) => ({
      ...previous,
      subjects: previous.subjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              ...patch,
            }
          : subject,
      ),
    }));
  };

  const removeSubject = (subjectId: string) => {
    setData((previous) =>
      appendHistory(
        {
          ...previous,
          subjects: previous.subjects.filter((subject) => subject.id !== subjectId),
          schedule: previous.schedule.filter((block) => block.subjectId !== subjectId),
          tasks: previous.tasks.filter((task) => task.subjectId !== subjectId),
        },
        "subject",
        "Subject, related schedule blocks, and tasks removed.",
      ),
    );
  };

  const addScheduleBlock = () => {
    if (!scheduleForm.subjectId) {
      setStatusLine("Select a subject before adding a schedule block.");
      return;
    }
    if (scheduleForm.start >= scheduleForm.end) {
      setStatusLine("Schedule end time must be later than start time.");
      return;
    }
    const block: ScheduleBlock = {
      id: createId(),
      subjectId: scheduleForm.subjectId,
      day: scheduleForm.day,
      start: scheduleForm.start,
      end: scheduleForm.end,
    };
    setData((previous) =>
      appendHistory(
        {
          ...previous,
          schedule: [...previous.schedule, block],
        },
        "schedule",
        `Schedule block added for ${scheduleForm.day} ${scheduleForm.start}-${scheduleForm.end}.`,
      ),
    );
    setStatusLine("Schedule block added.");
  };

  const removeScheduleBlock = (blockId: string) => {
    setData((previous) => ({
      ...previous,
      schedule: previous.schedule.filter((block) => block.id !== blockId),
    }));
  };

  const addTask = () => {
    const title = taskForm.title.trim();
    if (!taskForm.subjectId || !title || !taskForm.dueAt) {
      setStatusLine("Task requires subject, title, and due datetime.");
      return;
    }
    const task: TaskItem = {
      id: createId(),
      subjectId: taskForm.subjectId,
      title,
      dueAt: new Date(taskForm.dueAt).toISOString(),
      completed: false,
      type: taskForm.type,
    };
    setData((previous) =>
      appendHistory(
        {
          ...previous,
          tasks: [...previous.tasks, task],
        },
        "task",
        `${task.type === "exam" ? "Exam" : "Task"} added: ${task.title}.`,
      ),
    );
    setTaskForm({
      subjectId: taskForm.subjectId,
      title: "",
      dueAt: "",
      type: "assignment",
    });
    setStatusLine("Task added.");
  };

  const toggleTask = (taskId: string) => {
    setData((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    }));
  };

  const removeTask = (taskId: string) => {
    setData((previous) => ({
      ...previous,
      tasks: previous.tasks.filter((task) => task.id !== taskId),
    }));
  };

  const parseSyllabusInput = () => {
    const parsed = parseSyllabus(syllabusInput);
    setData((previous) => {
      const updatedScores = { ...previous.componentScores };
      for (const componentName of Object.keys(getEffectiveWeights(parsed.gradingWeights))) {
        if (typeof updatedScores[componentName] !== "number") {
          updatedScores[componentName] = 0;
        }
      }
      const merged: DisciplineData = {
        ...previous,
        syllabus: parsed,
        componentScores: updatedScores,
      };
      return appendHistory(
        merged,
        "syllabus",
        `Syllabus parsed. Components detected: ${Object.keys(parsed.gradingWeights).length}.`,
      );
    });
    setStatusLine("Syllabus parsed and persisted.");
  };

  const askSyllabusBot = () => {
    const question = questionInput.trim();
    if (!question) return;
    const answer = answerSyllabusQuestion(question, data.syllabus);
    setData((previous) => {
      const messages = [
        ...previous.chatHistory,
        {
          id: createId(),
          role: "user" as const,
          content: question,
          createdAt: new Date().toISOString(),
        },
        {
          id: createId(),
          role: "assistant" as const,
          content: answer,
          createdAt: new Date().toISOString(),
        },
      ].slice(-40);
      return appendHistory(
        {
          ...previous,
          chatHistory: messages,
        },
        "syllabus",
        "Syllabus chatbot query processed.",
      );
    });
    setQuestionInput("");
  };

  const handleSyllabusImage = async (file: File | null) => {
    if (!file) return;
    setOcrLoading(true);
    setStatusLine("OCR processing started...");
    try {
      const { recognize } = await import("tesseract.js");
      const result = await recognize(file, "eng");
      const extracted = result.data.text?.trim();
      if (!extracted) {
        setStatusLine("OCR returned no readable text.");
        return;
      }
      setSyllabusInput((current) =>
        current.trim().length > 0 ? `${current}\n\n${extracted}` : extracted,
      );
      setStatusLine("OCR complete. Review text and parse.");
    } catch {
      setStatusLine("OCR failed. Use text paste fallback.");
    } finally {
      setOcrLoading(false);
    }
  };

  const getSubjectName = (subjectId: string) =>
    data.subjects.find((subject) => subject.id === subjectId)?.name ?? "Unassigned";

  const contentCardClasses = "rounded-2xl border p-4 backdrop-blur-sm bg-zinc-950/70";

  return (
    <div className="mx-auto min-h-screen max-w-md bg-black px-4 pb-28 pt-4 text-zinc-100">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Academic Discipline OS</p>
          <h1 className="text-lg font-semibold">Mission Console</h1>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 px-3 py-2 text-xs">
          <span className="text-zinc-300">Exam Mode</span>
          <button
            type="button"
            onClick={() =>
              setData((previous) => ({
                ...previous,
                examMode: !previous.examMode,
              }))
            }
            className={`relative h-5 w-10 rounded-full transition ${
              data.examMode ? "bg-orange-500" : "bg-zinc-700"
            }`}
            aria-label="Toggle exam mode"
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                data.examMode ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>

      {statusLine ? (
        <div
          className="mb-4 rounded-xl border px-3 py-2 text-xs text-zinc-200"
          style={{
            borderColor: palette.border,
            background: palette.accentSoft,
          }}
        >
          {statusLine}
        </div>
      ) : null}

      {activeTab === "home" ? (
        <section className="space-y-4">
          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Daily status</p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Epa, Jesus Bracho!</h2>
                <p className="mt-1 text-sm text-zinc-300">
                  <GraduationCap className="mr-2 inline h-4 w-4" />
                  Countdown to May 2029: {graduationCountdown}
                </p>
              </div>
            </div>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">The streak</p>
                <p className="mt-1 text-sm text-zinc-300">Gym + Study discipline tracking</p>
              </div>
              <div className="flex items-center gap-2 text-xl font-semibold text-orange-400">
                <Flame className="h-6 w-6" />
                {data.streak.count}
              </div>
            </div>
            <button
              type="button"
              onClick={markDisciplineDone}
              className="mt-3 w-full rounded-xl border px-3 py-2 text-sm font-medium transition hover:opacity-90"
              style={{
                borderColor: palette.border,
                background: palette.accentSoft,
                color: palette.accent,
              }}
            >
              Mark Gym + Study completed today
            </button>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Right now</p>
            <p className="mt-2 text-sm font-medium text-zinc-100">{rightNowLine}</p>
            <p className="mt-1 text-xs text-zinc-500">Live schedule sync updates every minute.</p>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <div className="mb-2 flex items-center gap-2">
              <Bot className="h-4 w-4" style={{ color: palette.accent }} />
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                Internal Bot Dashboard
              </p>
            </div>
            <textarea
              readOnly
              value={seniorPartnerBrief}
              className="h-48 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm leading-relaxed text-zinc-200"
            />
            <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              Senior Partner tone: cold, analytical, professional (English only)
            </p>
          </article>
        </section>
      ) : null}

      {activeTab === "works" ? (
        <section className="space-y-4">
          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Semester manager
            </h2>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <input
                value={subjectForm.code}
                onChange={(event) =>
                  setSubjectForm((current) => ({
                    ...current,
                    code: event.target.value,
                  }))
                }
                placeholder="Subject code (e.g., CS1)"
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
              <input
                value={subjectForm.name}
                onChange={(event) =>
                  setSubjectForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Subject name"
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={subjectForm.credits}
                onChange={(event) =>
                  setSubjectForm((current) => ({
                    ...current,
                    credits: Number(event.target.value),
                  }))
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                min={1}
                max={8}
              />
              <button
                type="button"
                onClick={addSubject}
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: palette.border,
                  background: palette.accentSoft,
                  color: palette.accent,
                }}
              >
                <Plus className="h-4 w-4" />
                Add subject
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {data.subjects.length === 0 ? (
                <p className="text-sm text-zinc-500">No subjects yet.</p>
              ) : (
                data.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm"
                  >
                    <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                      <input
                        value={subject.code}
                        onChange={(event) =>
                          updateSubject(subject.id, {
                            code: event.target.value,
                          })
                        }
                        className="rounded-md border border-zinc-800 bg-black px-2 py-1"
                      />
                      <input
                        value={subject.name}
                        onChange={(event) =>
                          updateSubject(subject.id, {
                            name: event.target.value,
                          })
                        }
                        className="rounded-md border border-zinc-800 bg-black px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubject(subject.id)}
                        className="rounded-md border border-zinc-700 px-2 text-zinc-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Weekly schedule
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select
                value={scheduleForm.subjectId}
                onChange={(event) =>
                  setScheduleForm((current) => ({
                    ...current,
                    subjectId: event.target.value,
                  }))
                }
                className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              >
                <option value="">Select subject</option>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>

              <select
                value={scheduleForm.day}
                onChange={(event) =>
                  setScheduleForm((current) => ({
                    ...current,
                    day: event.target.value as WeekDay,
                  }))
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              >
                {WEEK_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addScheduleBlock}
                className="rounded-lg border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: palette.border,
                  background: palette.accentSoft,
                  color: palette.accent,
                }}
              >
                Add block
              </button>

              <input
                type="time"
                value={scheduleForm.start}
                onChange={(event) =>
                  setScheduleForm((current) => ({
                    ...current,
                    start: event.target.value,
                  }))
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={scheduleForm.end}
                onChange={(event) =>
                  setScheduleForm((current) => ({
                    ...current,
                    end: event.target.value,
                  }))
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-4 space-y-2">
              {sortedSchedule.length === 0 ? (
                <p className="text-sm text-zinc-500">No schedule blocks configured.</p>
              ) : (
                sortedSchedule.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
                  >
                    <p>
                      <span className="font-medium">{block.day}</span> · {formatTimeLabel(block.start)} -{" "}
                      {formatTimeLabel(block.end)} · {getSubjectName(block.subjectId)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeScheduleBlock(block.id)}
                      className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              AI syllabus parser + chatbot
            </h2>
            <div className="mt-3 space-y-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 px-3 py-3 text-sm text-zinc-300">
                <Upload className="h-4 w-4" />
                {ocrLoading ? "Running OCR..." : "Upload syllabus image for OCR"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    void handleSyllabusImage(file);
                    event.target.value = "";
                  }}
                />
              </label>
              <textarea
                value={syllabusInput}
                onChange={(event) => setSyllabusInput(event.target.value)}
                placeholder="Paste syllabus text here..."
                className="h-40 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={parseSyllabusInput}
                className="w-full rounded-lg border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: palette.border,
                  background: palette.accentSoft,
                  color: palette.accent,
                }}
              >
                Parse syllabus
              </button>
            </div>

            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm">
              <p className="font-medium text-zinc-200">Detected grading weights</p>
              <p className="mt-1 text-zinc-400">
                {Object.entries(data.syllabus.gradingWeights).length === 0
                  ? "No explicit percentages detected yet."
                  : Object.entries(data.syllabus.gradingWeights)
                      .map(([name, weight]) => `${name}: ${weight}%`)
                      .join(" · ")}
              </p>
              <p className="mt-2 font-medium text-zinc-200">Rules</p>
              <p className="mt-1 text-zinc-400">
                {data.syllabus.dropRules.length > 0
                  ? data.syllabus.dropRules.join(" | ")
                  : "No drop/curve rules detected."}
              </p>
            </div>

            <div className="mt-3 space-y-2">
              <input
                value={questionInput}
                onChange={(event) => setQuestionInput(event.target.value)}
                placeholder='Ask: "What is the late policy?"'
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={askSyllabusBot}
                className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
              >
                Ask syllabus bot
              </button>
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                {data.chatHistory.length === 0 ? (
                  <p className="text-sm text-zinc-500">No chat messages yet.</p>
                ) : (
                  data.chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.role === "assistant"
                          ? "border border-zinc-700 bg-zinc-900 text-zinc-100"
                          : "border border-zinc-800 bg-black text-zinc-300"
                      }`}
                    >
                      <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                        {message.role}
                      </p>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              GPA simulator
            </h2>
            <div className="mt-3 space-y-2">
              {effectiveWeightEntries.map(([component, weight]) => (
                <div key={component} className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <label className="text-sm text-zinc-300">
                    {component} ({weight}%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={data.componentScores[component] ?? 0}
                    onChange={(event) =>
                      setData((previous) => ({
                        ...previous,
                        componentScores: {
                          ...previous.componentScores,
                          [component]: Number(event.target.value),
                        },
                      }))
                    }
                    className="w-24 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-right text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm">
              <p>Current weighted grade: {currentGrade.toFixed(2)}%</p>
              <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
                <label className="text-zinc-300">What-if component:</label>
                <select
                  value={data.selectedScenarioComponent}
                  onChange={(event) =>
                    setData((previous) => ({
                      ...previous,
                      selectedScenarioComponent: event.target.value,
                    }))
                  }
                  className="rounded-md border border-zinc-800 bg-black px-2 py-1 text-sm"
                >
                  {effectiveWeightEntries.map(([component]) => (
                    <option key={component} value={component}>
                      {component}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-zinc-200">
                {scoreNeededForA === null
                  ? "What-if scenario unavailable."
                  : scoreNeededForA > 100
                    ? `You need ${scoreNeededForA.toFixed(
                        1,
                      )}% on ${data.selectedScenarioComponent}. Target A is currently infeasible.`
                    : scoreNeededForA <= 0
                      ? `An A is already secured. ${data.selectedScenarioComponent} can be used as buffer.`
                      : `You need ${scoreNeededForA.toFixed(1)}% on ${
                          data.selectedScenarioComponent
                        } to keep an A.`}
              </p>
            </div>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Task checklist
            </h2>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <select
                value={taskForm.subjectId}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    subjectId: event.target.value,
                  }))
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              >
                <option value="">Select subject</option>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
              <input
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Task title"
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={taskForm.dueAt}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    dueAt: event.target.value,
                  }))
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
              <select
                value={taskForm.type}
                onChange={(event) =>
                  setTaskForm((current) => ({
                    ...current,
                    type: event.target.value as TaskItem["type"],
                  }))
                }
                className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
              </select>
              <button
                type="button"
                onClick={addTask}
                className="rounded-lg border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: palette.border,
                  background: palette.accentSoft,
                  color: palette.accent,
                }}
              >
                Add task
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {groupedTasks.size === 0 ? (
                <p className="text-sm text-zinc-500">No tasks added.</p>
              ) : (
                [...groupedTasks.entries()].map(([subjectId, tasks]) => (
                  <div key={subjectId} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                      {getSubjectName(subjectId)}
                    </p>
                    <div className="mt-2 space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between gap-2 rounded-lg border border-zinc-800 bg-black/70 px-2 py-2"
                        >
                          <button
                            type="button"
                            onClick={() => toggleTask(task.id)}
                            className={`mt-0.5 rounded-md border px-2 py-1 text-xs ${
                              task.completed
                                ? "border-emerald-700 text-emerald-300"
                                : "border-zinc-700 text-zinc-300"
                            }`}
                          >
                            {task.completed ? <CheckCircle2 className="h-4 w-4" /> : "Todo"}
                          </button>
                          <div className="flex-1 text-sm">
                            <p className={task.completed ? "line-through text-zinc-500" : "text-zinc-100"}>
                              {task.title}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {task.type.toUpperCase()} · {formatDateLabel(task.dueAt)} ·{" "}
                              <span className="text-zinc-300">{formatCountdown(task.dueAt, now)}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTask(task.id)}
                            className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Exam prep roadmap (next 7 days)
            </h2>
            <div className="mt-3 space-y-3">
              {examRoadmaps.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No exams in the next 7 days. Add one in task checklist to generate roadmap.
                </p>
              ) : (
                examRoadmaps.map(({ exam, roadmap }) => (
                  <div key={exam.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <p className="text-sm font-medium text-zinc-200">
                      {exam.title} · {formatDateLabel(exam.dueAt)}
                    </p>
                    <div className="mt-2 space-y-1">
                      {roadmap.map((item, index) => (
                        <p key={`${exam.id}-${item.date}-${index}`} className="text-sm text-zinc-300">
                          <span className="font-medium text-zinc-200">{item.date}:</span> {item.action}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              Email alerts (Resend)
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Automated reminder logic sends notifications at 3, 2, and 1-day marks.
            </p>
            <div className="mt-3 space-y-2">
              <input
                type="email"
                value={data.notificationEmail}
                onChange={(event) =>
                  setData((previous) => ({
                    ...previous,
                    notificationEmail: event.target.value,
                  }))
                }
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={data.remindersEnabled}
                  onChange={(event) =>
                    setData((previous) => ({
                      ...previous,
                      remindersEnabled: event.target.checked,
                    }))
                  }
                />
                Enable daily automated reminder scan
              </label>
              <button
                type="button"
                onClick={() => void runReminderScan(false)}
                disabled={notificationLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 disabled:opacity-60"
              >
                <Bell className="h-4 w-4" />
                {notificationLoading ? "Scanning..." : "Run reminder scan now"}
              </button>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "history" ? (
        <section className="space-y-4">
          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                Execution history
              </h2>
              <div className="text-xs text-zinc-500">{data.history.length} events</div>
            </div>
            <div className="mt-3 space-y-2">
              {data.history.length === 0 ? (
                <p className="text-sm text-zinc-500">No history events yet.</p>
              ) : (
                data.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm"
                  >
                    <p className={`text-xs uppercase tracking-[0.12em] ${HISTORY_KIND_STYLES[entry.kind]}`}>
                      {entry.kind}
                    </p>
                    <p className="mt-1 text-zinc-200">{entry.message}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                      {new Date(entry.createdAt).toLocaleString("en-US")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className={contentCardClasses} style={{ borderColor: palette.border }}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
              System diagnostics
            </h2>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <p>
                <Sparkles className="mr-1 inline h-4 w-4" style={{ color: palette.accent }} />
                Theme mode: {data.examMode ? "Exam Mode (urgent red/orange)" : "Standard dark + electric blue"}
              </p>
              <p>
                <CalendarClock className="mr-1 inline h-4 w-4" />
                Local schedule blocks: {data.schedule.length}
              </p>
              <p>
                <BriefcaseBusiness className="mr-1 inline h-4 w-4" />
                Subjects tracked: {data.subjects.length}
              </p>
              <p>
                <Bell className="mr-1 inline h-4 w-4" />
                Reminder engine: {data.remindersEnabled ? "Enabled" : "Disabled"} / Email:{" "}
                {data.notificationEmail || "Not configured"}
              </p>
              <p>
                <Bot className="mr-1 inline h-4 w-4" />
                Cloud sync:{" "}
                {loadingFromCloud
                  ? "Syncing..."
                  : supabaseClient
                    ? "Supabase configured (fallback to local if unavailable)"
                    : "Supabase env not configured (LocalStorage only)"}
              </p>
            </div>
          </article>
        </section>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 px-3 py-3 text-xs ${
              activeTab === "home" ? "text-white" : "text-zinc-500"
            }`}
            style={activeTab === "home" ? { color: palette.accent } : undefined}
          >
            <Home className="h-5 w-5" />
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("works")}
            className={`flex flex-col items-center gap-1 px-3 py-3 text-xs ${
              activeTab === "works" ? "text-white" : "text-zinc-500"
            }`}
            style={activeTab === "works" ? { color: palette.accent } : undefined}
          >
            <BriefcaseBusiness className="h-5 w-5" />
            Works
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center gap-1 px-3 py-3 text-xs ${
              activeTab === "history" ? "text-white" : "text-zinc-500"
            }`}
            style={activeTab === "history" ? { color: palette.accent } : undefined}
          >
            <History className="h-5 w-5" />
            History
          </button>
        </div>
      </nav>
    </div>
  );
}
