"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  History,
  Home,
  LogIn,
  LogOut,
  Mail,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  DEFAULT_STATE,
  type AssignmentItem,
  type DisciplineState,
  type HistoryEvent,
  type ScheduleBlock,
  type SubjectItem,
  type WeekDay,
  WEEK_DAYS,
  answerSyllabusQuestionLocal,
  buildMonthlyCalendar,
  buildSevenDayActionPlan,
  clamp,
  computeCurrentGrade,
  computeCumulativeGpa,
  computeScoreNeeded,
  createId,
  createSeniorPartnerBrief,
  formatCountdown,
  formatDateLabel,
  formatTimeLabel,
  getDaysUntil,
  getEffectiveWeights,
  getGraduationCountdown,
  getScheduleStatusLine,
  mergeWithDefaults,
  parseSyllabus,
  percentToFourScale,
} from "../lib/academicEngine";

type NavTab = "home" | "works" | "history";
type HistoryKind = HistoryEvent["kind"];

const STORAGE_KEY = "gpa-stand-state-v2";
const DAILY_REMINDER_SCAN_KEY = "gpa-stand-last-reminder-scan-v2";

const TABLE_ASSIGNMENTS = "assignments";
const TABLE_SYLLABI = "syllabi_data";
const TABLE_PROFILE = "user_profile";

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
  assignment: "text-emerald-300",
  syllabus: "text-cyan-300",
  notification: "text-amber-300",
  profile: "text-fuchsia-300",
  system: "text-zinc-300",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const firstOrEmpty = (value: string) => value || "";

export default function GPAStandardApp() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [state, setState] = useState<DisciplineState>(DEFAULT_STATE);
  const [now, setNow] = useState(new Date());
  const [hydrated, setHydrated] = useState(false);
  const [statusLine, setStatusLine] = useState("");

  const [authEmailInput, setAuthEmailInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [loadedCloudUserId, setLoadedCloudUserId] = useState<string | null>(null);

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
  const [assignmentForm, setAssignmentForm] = useState({
    subjectId: "",
    title: "",
    dueAt: "",
    type: "assignment" as AssignmentItem["type"],
  });
  const [syllabusInput, setSyllabusInput] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [calendarAnchor, setCalendarAnchor] = useState(() => {
    const anchor = new Date();
    anchor.setDate(1);
    anchor.setHours(0, 0, 0, 0);
    return anchor;
  });

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    return createClient(url, anon);
  }, []);

  const palette = state.examMode
    ? {
        accent: "#ff6b00",
        accentSoft: "rgba(255,107,0,0.13)",
        border: "rgba(255,107,0,0.4)",
      }
    : {
        accent: "#0070f3",
        accentSoft: "rgba(0,112,243,0.13)",
        border: "rgba(0,112,243,0.4)",
      };

  const appendHistory = useCallback(
    (previous: DisciplineState, kind: HistoryKind, message: string): DisciplineState => {
      const event: HistoryEvent = {
        id: createId(),
        kind,
        message,
        createdAt: new Date().toISOString(),
      };
      return {
        ...previous,
        history: [event, ...previous.history].slice(0, 280),
      };
    },
    [],
  );

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const merged = mergeWithDefaults(parsed);
        setState(merged);
        setSyllabusInput(merged.syllabus.sourceText);
      } catch {
        setStatusLine("Local cache inválido. Starting from defaults.");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    const bootAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setAuthUser(data.user ?? null);
      setAuthEmailInput(data.user?.email ?? "");
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthEmailInput(session?.user?.email ?? "");
      setLoadedCloudUserId(null);
    });

    void bootAuth();
    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!hydrated || !supabase || !authUser?.id) return;
    if (loadedCloudUserId === authUser.id) return;

    let cancelled = false;
    const loadCloud = async () => {
      setCloudSyncing(true);
      try {
        const [profileRes, syllabusRes, assignmentsRes] = await Promise.all([
          supabase
            .from(TABLE_PROFILE)
            .select("cumulative_gpa, semester_history, notification_email")
            .eq("user_id", authUser.id)
            .maybeSingle(),
          supabase
            .from(TABLE_SYLLABI)
            .select("source_text, parsed_json")
            .eq("user_id", authUser.id)
            .maybeSingle(),
          supabase
            .from(TABLE_ASSIGNMENTS)
            .select("id, subject_id, title, due_at, type, completed")
            .eq("user_id", authUser.id)
            .order("due_at", { ascending: true }),
        ]);

        if (cancelled) return;

        const cloudAssignments: AssignmentItem[] =
          assignmentsRes.data?.map((row) => ({
            id: String(row.id),
            subjectId: row.subject_id ?? "",
            title: row.title ?? "Untitled",
            dueAt: row.due_at,
            type: row.type === "exam" ? "exam" : "assignment",
            completed: Boolean(row.completed),
            source: "manual",
          })) ?? [];

        setState((previous) => {
          const merged = mergeWithDefaults({
            ...previous,
            assignments: cloudAssignments.length > 0 ? cloudAssignments : previous.assignments,
            syllabus: syllabusRes.data?.parsed_json
              ? {
                  ...previous.syllabus,
                  ...syllabusRes.data.parsed_json,
                  sourceText:
                    typeof syllabusRes.data.source_text === "string"
                      ? syllabusRes.data.source_text
                      : previous.syllabus.sourceText,
                }
              : previous.syllabus,
            notificationEmail:
              profileRes.data?.notification_email ?? previous.notificationEmail,
            semesterHistory:
              (profileRes.data?.semester_history as DisciplineState["semesterHistory"]) ??
              previous.semesterHistory,
            cumulativeGpa:
              typeof profileRes.data?.cumulative_gpa === "number"
                ? profileRes.data.cumulative_gpa
                : computeCumulativeGpa(previous.semesterHistory),
          });
          return appendHistory(merged, "system", "Supabase cloud data synced.");
        });

        if (syllabusRes.data?.source_text) {
          setSyllabusInput(syllabusRes.data.source_text);
        }
        setLoadedCloudUserId(authUser.id);
      } catch {
        if (!cancelled) {
          setStatusLine("Supabase sync no disponible. Running local mode.");
        }
      } finally {
        if (!cancelled) {
          setCloudSyncing(false);
        }
      }
    };

    void loadCloud();
    return () => {
      cancelled = true;
    };
  }, [appendHistory, authUser?.id, hydrated, loadedCloudUserId, supabase]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if (!supabase || !authUser?.id) return;
    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          await supabase.from(TABLE_PROFILE).upsert(
            {
              user_id: authUser.id,
              cumulative_gpa: state.cumulativeGpa,
              semester_history: state.semesterHistory,
              notification_email: state.notificationEmail,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );

          await supabase.from(TABLE_SYLLABI).upsert(
            {
              user_id: authUser.id,
              source_text: state.syllabus.sourceText,
              parsed_json: state.syllabus,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );

          await supabase.from(TABLE_ASSIGNMENTS).delete().eq("user_id", authUser.id);
          if (state.assignments.length > 0) {
            await supabase.from(TABLE_ASSIGNMENTS).insert(
              state.assignments.map((assignment) => ({
                id: assignment.id,
                user_id: authUser.id,
                subject_id: firstOrEmpty(assignment.subjectId),
                title: assignment.title,
                due_at: assignment.dueAt,
                type: assignment.type,
                completed: assignment.completed,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })),
            );
          }
        } catch {
          // fallback local mode
        }
      })();
    }, 850);
    return () => window.clearTimeout(timeout);
  }, [authUser?.id, hydrated, state, supabase]);

  const rightNowLine = useMemo(
    () => getScheduleStatusLine(state.schedule, state.subjects, now),
    [now, state.schedule, state.subjects],
  );
  const graduationCountdown = useMemo(
    () => getGraduationCountdown(new Date("2029-05-31T23:59:59"), now),
    [now],
  );

  const effectiveWeights = useMemo(
    () => getEffectiveWeights(state.syllabus.gradingWeights),
    [state.syllabus.gradingWeights],
  );
  const weightEntries = useMemo(
    () => Object.entries(effectiveWeights),
    [effectiveWeights],
  );

  useEffect(() => {
    if (weightEntries.length === 0) return;
    const first = weightEntries[0][0];
    if (state.selectedScenarioComponent && effectiveWeights[state.selectedScenarioComponent]) {
      return;
    }
    setState((previous) => ({
      ...previous,
      selectedScenarioComponent: first,
    }));
  }, [effectiveWeights, state.selectedScenarioComponent, weightEntries]);

  const currentGrade = useMemo(
    () => computeCurrentGrade(effectiveWeights, state.componentScores),
    [effectiveWeights, state.componentScores],
  );
  const scoreNeeded = useMemo(
    () =>
      computeScoreNeeded(
        90,
        state.selectedScenarioComponent,
        effectiveWeights,
        state.componentScores,
      ),
    [effectiveWeights, state.componentScores, state.selectedScenarioComponent],
  );
  const projectedClassGpa = useMemo(
    () => percentToFourScale(currentGrade),
    [currentGrade],
  );

  const actionPlan = useMemo(
    () => buildSevenDayActionPlan(state.assignments, now),
    [now, state.assignments],
  );
  const calendarWeeks = useMemo(
    () => buildMonthlyCalendar(calendarAnchor, state.assignments),
    [calendarAnchor, state.assignments],
  );

  const seniorBrief = useMemo(
    () =>
      createSeniorPartnerBrief({
        streak: state.streakCount,
        rightNowLine,
        currentGrade,
        cumulativeGpa: state.cumulativeGpa,
        actionItems: actionPlan.length,
        scoreNeeded,
        selectedComponent: state.selectedScenarioComponent,
      }),
    [
      actionPlan.length,
      currentGrade,
      rightNowLine,
      scoreNeeded,
      state.cumulativeGpa,
      state.selectedScenarioComponent,
      state.streakCount,
    ],
  );

  const sortedSchedule = useMemo(() => {
    const dayOrder = new Map(WEEK_DAYS.map((day, index) => [day, index]));
    return [...state.schedule].sort((a, b) => {
      const dayDiff = (dayOrder.get(a.day) ?? 0) - (dayOrder.get(b.day) ?? 0);
      if (dayDiff !== 0) return dayDiff;
      return a.start.localeCompare(b.start);
    });
  }, [state.schedule]);

  const groupedAssignments = useMemo(() => {
    const map = new Map<string, AssignmentItem[]>();
    for (const assignment of state.assignments) {
      const key = assignment.subjectId || "none";
      const existing = map.get(key) ?? [];
      existing.push(assignment);
      map.set(key, existing);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    }
    return map;
  }, [state.assignments]);

  const getSubjectName = (subjectId: string) =>
    state.subjects.find((subject) => subject.id === subjectId)?.name ?? "General";

  const runReminderScan = useCallback(
    async (silent = false) => {
      if (!state.notificationEmail) {
        if (!silent) setStatusLine("Configura un email primero para recordatorios.");
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
            recipientEmail: state.notificationEmail,
            tasks: state.assignments,
            sentReminderKeys: state.sentReminderKeys,
          }),
        });
        const result = (await response.json()) as {
          message?: string;
          sentCount?: number;
          triggeredKeys?: string[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(result.error ?? "Failed reminder scan");
        }
        setState((previous) =>
          appendHistory(
            {
              ...previous,
              sentReminderKeys: [
                ...new Set([
                  ...previous.sentReminderKeys,
                  ...(result.triggeredKeys ?? []),
                ]),
              ],
            },
            "notification",
            `Reminder scan done. Sent: ${result.sentCount ?? 0}.`,
          ),
        );
        if (!silent) setStatusLine(result.message ?? "Reminder scan completed.");
      } catch (error) {
        if (!silent) {
          setStatusLine(
            error instanceof Error
              ? error.message
              : "No se pudo enviar recordatorios.",
          );
        }
      } finally {
        setNotificationLoading(false);
      }
    },
    [appendHistory, state.assignments, state.notificationEmail, state.sentReminderKeys],
  );

  useEffect(() => {
    if (!hydrated || !state.remindersEnabled || !state.notificationEmail) return;
    if (typeof window === "undefined") return;
    const todayKey = buildDateKey(new Date());
    const lastScan = window.localStorage.getItem(DAILY_REMINDER_SCAN_KEY);
    if (lastScan === todayKey) return;
    window.localStorage.setItem(DAILY_REMINDER_SCAN_KEY, todayKey);
    void runReminderScan(true);
  }, [
    hydrated,
    runReminderScan,
    state.notificationEmail,
    state.remindersEnabled,
    state.sentReminderKeys.length,
  ]);

  const sendMagicLink = async () => {
    if (!supabase) {
      setStatusLine("Supabase env missing. Magic Link disabled.");
      return;
    }
    if (!authEmailInput) {
      setStatusLine("Enter your email first.");
      return;
    }
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmailInput,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setStatusLine("Magic Link sent. Revisa tu correo para login cross-device.");
    } catch (error) {
      setStatusLine(error instanceof Error ? error.message : "Magic link failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setStatusLine("Session cerrada.");
  };

  const markDisciplineDone = () => {
    const today = buildDateKey(new Date());
    setState((previous) => {
      if (previous.streakDate === today) return previous;
      const keep = previous.streakDate === yesterdayKey(new Date());
      const streak = keep ? previous.streakCount + 1 : 1;
      return appendHistory(
        {
          ...previous,
          streakDate: today,
          streakCount: streak,
        },
        "discipline",
        `Disciplina marcada para ${today}. Streak: ${streak}.`,
      );
    });
  };

  const addSubject = () => {
    const code = subjectForm.code.trim();
    const name = subjectForm.name.trim();
    if (!code || !name) {
      setStatusLine("Subject code + name son requeridos.");
      return;
    }
    const nextSubject: SubjectItem = {
      id: createId(),
      code,
      name,
      credits: clamp(subjectForm.credits, 1, 8),
    };
    setState((previous) =>
      appendHistory(
        {
          ...previous,
          subjects: [...previous.subjects, nextSubject],
        },
        "subject",
        `Subject creado: ${code} - ${name}.`,
      ),
    );
    setSubjectForm({ code: "", name: "", credits: 3 });
  };

  const updateSubject = (subjectId: string, patch: Partial<SubjectItem>) => {
    setState((previous) => ({
      ...previous,
      subjects: previous.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, ...patch } : subject,
      ),
    }));
  };

  const removeSubject = (subjectId: string) => {
    setState((previous) =>
      appendHistory(
        {
          ...previous,
          subjects: previous.subjects.filter((subject) => subject.id !== subjectId),
          schedule: previous.schedule.filter((block) => block.subjectId !== subjectId),
          assignments: previous.assignments.filter(
            (assignment) => assignment.subjectId !== subjectId,
          ),
        },
        "subject",
        "Subject removido con su schedule + assignments.",
      ),
    );
  };

  const addScheduleBlock = () => {
    if (!scheduleForm.subjectId) {
      setStatusLine("Selecciona subject para crear block.");
      return;
    }
    if (scheduleForm.end <= scheduleForm.start) {
      setStatusLine("End debe ser mayor que start.");
      return;
    }
    const block: ScheduleBlock = {
      id: createId(),
      subjectId: scheduleForm.subjectId,
      day: scheduleForm.day,
      start: scheduleForm.start,
      end: scheduleForm.end,
    };
    setState((previous) =>
      appendHistory(
        {
          ...previous,
          schedule: [...previous.schedule, block],
        },
        "schedule",
        `Schedule block added ${block.day} ${block.start}-${block.end}.`,
      ),
    );
  };

  const removeScheduleBlock = (blockId: string) => {
    setState((previous) => ({
      ...previous,
      schedule: previous.schedule.filter((block) => block.id !== blockId),
    }));
  };

  const addAssignment = () => {
    if (!assignmentForm.title.trim() || !assignmentForm.dueAt) {
      setStatusLine("Assignment title + due datetime requeridos.");
      return;
    }
    const assignment: AssignmentItem = {
      id: createId(),
      subjectId: assignmentForm.subjectId,
      title: assignmentForm.title.trim(),
      dueAt: new Date(assignmentForm.dueAt).toISOString(),
      completed: false,
      type: assignmentForm.type,
      source: "manual",
    };
    setState((previous) =>
      appendHistory(
        {
          ...previous,
          assignments: [...previous.assignments, assignment],
        },
        "assignment",
        `Assignment creado: ${assignment.title}.`,
      ),
    );
    setAssignmentForm({
      subjectId: assignmentForm.subjectId,
      title: "",
      dueAt: "",
      type: "assignment",
    });
  };

  const toggleAssignment = (id: string) => {
    setState((previous) => ({
      ...previous,
      assignments: previous.assignments.map((assignment) =>
        assignment.id === id
          ? { ...assignment, completed: !assignment.completed }
          : assignment,
      ),
    }));
  };

  const removeAssignment = (id: string) => {
    setState((previous) => ({
      ...previous,
      assignments: previous.assignments.filter((assignment) => assignment.id !== id),
    }));
  };

  const parseSyllabusInput = () => {
    const parsed = parseSyllabus(syllabusInput);
    setState((previous) => {
      const existingKeys = new Set(
        previous.assignments.map(
          (assignment) =>
            `${assignment.title.toLowerCase()}::${assignment.dueAt.slice(0, 10)}`,
        ),
      );
      const fromSyllabus: AssignmentItem[] = [];
      for (const important of parsed.importantDates) {
        const title = important.label.length > 90
          ? `${important.label.slice(0, 87)}...`
          : important.label;
        const key = `${title.toLowerCase()}::${important.dueAt.slice(0, 10)}`;
        if (existingKeys.has(key)) continue;
        existingKeys.add(key);
        fromSyllabus.push({
          id: `syllabus-${important.dueAt.slice(0, 10)}-${slugify(title).slice(0, 24)}`,
          subjectId: previous.subjects[0]?.id ?? "",
          title,
          dueAt: important.dueAt,
          completed: false,
          type: important.type,
          source: "syllabus",
        });
      }

      const componentScores = { ...previous.componentScores };
      for (const name of Object.keys(getEffectiveWeights(parsed.gradingWeights))) {
        if (typeof componentScores[name] !== "number") {
          componentScores[name] = 0;
        }
      }

      return appendHistory(
        {
          ...previous,
          syllabus: parsed,
          assignments: [...previous.assignments, ...fromSyllabus],
          componentScores,
        },
        "syllabus",
        `Syllabus parsed. Fechas importadas al Calendar: ${fromSyllabus.length}.`,
      );
    });
    setStatusLine("Syllabus parsed y deadlines auto-synced al Bento Calendar.");
  };

  const askSyllabusAi = async () => {
    const question = questionInput.trim();
    if (!question) return;
    setChatLoading(true);
    setState((previous) => ({
      ...previous,
      chatHistory: [
        ...previous.chatHistory,
        {
          id: createId(),
          role: "user",
          content: question,
          createdAt: new Date().toISOString(),
        },
      ].slice(-60),
    }));
    setQuestionInput("");

    try {
      const response = await fetch("/api/syllabus/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          syllabus: state.syllabus,
        }),
      });
      const payload = (await response.json()) as {
        answer?: string;
        error?: string;
      };
      const answer =
        payload.answer ??
        answerSyllabusQuestionLocal(question, state.syllabus);
      setState((previous) => ({
        ...previous,
        chatHistory: [
          ...previous.chatHistory,
          {
            id: createId(),
            role: "assistant",
            content: answer,
            createdAt: new Date().toISOString(),
          },
        ].slice(-60),
      }));
    } catch {
      const fallback = answerSyllabusQuestionLocal(question, state.syllabus);
      setState((previous) => ({
        ...previous,
        chatHistory: [
          ...previous.chatHistory,
          {
            id: createId(),
            role: "assistant",
            content: fallback,
            createdAt: new Date().toISOString(),
          },
        ].slice(-60),
      }));
    } finally {
      setChatLoading(false);
    }
  };

  const handleSyllabusImage = async (file: File | null) => {
    if (!file) return;
    setOcrLoading(true);
    try {
      const { recognize } = await import("tesseract.js");
      const result = await recognize(file, "eng");
      const extracted = result.data.text?.trim() ?? "";
      if (!extracted) {
        setStatusLine("OCR no extrajo texto legible.");
        return;
      }
      setSyllabusInput((previous) =>
        previous.trim().length > 0 ? `${previous}\n\n${extracted}` : extracted,
      );
      setStatusLine("OCR listo. Revisa texto y parsea.");
    } catch {
      setStatusLine("OCR failed. Usa paste manual del syllabus.");
    } finally {
      setOcrLoading(false);
    }
  };

  const updateSemester = (index: number, patch: { gpa?: number; credits?: number }) => {
    setState((previous) => {
      const semesterHistory = previous.semesterHistory.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        return {
          ...row,
          gpa: patch.gpa ?? row.gpa,
          credits: patch.credits ?? row.credits,
        };
      });
      const cumulative = computeCumulativeGpa(semesterHistory);
      return {
        ...previous,
        semesterHistory,
        cumulativeGpa: cumulative,
      };
    });
  };

  const glass = "rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl";

  return (
    <div className="min-h-screen bg-black pb-24 text-zinc-100">
      <div className="mx-auto w-full max-w-6xl px-4 pt-4">
        <header className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">GPA Standard</p>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <label className="flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-2 text-xs">
            <span className="text-zinc-300">Exam Mode</span>
            <button
              type="button"
              onClick={() =>
                setState((previous) => ({
                  ...previous,
                  examMode: !previous.examMode,
                }))
              }
              className={`relative h-5 w-10 rounded-full ${
                state.examMode ? "bg-orange-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                  state.examMode ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </header>

        {statusLine ? (
          <div
            className="mb-4 rounded-2xl border px-3 py-2 text-xs"
            style={{ borderColor: palette.border, background: palette.accentSoft }}
          >
            {statusLine}
          </div>
        ) : null}

        {activeTab === "home" ? (
          <section className="grid gap-4 md:grid-cols-12">
            <article className={`${glass} md:col-span-4`} style={{ borderColor: palette.border }}>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Daily Status</p>
              <h2 className="mt-2 text-2xl font-bold">Epa, Jesus Bracho!</h2>
              <p className="mt-2 text-sm text-zinc-300">
                <GraduationCap className="mr-2 inline h-4 w-4" />
                Countdown to May 2029: {graduationCountdown}
              </p>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-orange-500/25 bg-orange-500/10 px-3 py-2">
                <span className="text-sm">Discipline Streak</span>
                <span className="flex items-center gap-2 text-xl font-semibold text-orange-300">
                  <Flame className="h-5 w-5" />
                  {state.streakCount}
                </span>
              </div>
              <button
                type="button"
                onClick={markDisciplineDone}
                className="mt-3 w-full rounded-xl border px-3 py-2 text-sm font-medium"
                style={{
                  borderColor: palette.border,
                  color: palette.accent,
                  background: palette.accentSoft,
                }}
              >
                Marcar Gym + Study de hoy
              </button>
            </article>

            <article className={`${glass} md:col-span-4`} style={{ borderColor: palette.border }}>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Right Now Widget</p>
              <p className="mt-2 text-sm font-medium">{rightNowLine}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Sync every minute con Semester Schedule.
              </p>

              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Magic Link Auth</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={authEmailInput}
                    onChange={(event) => setAuthEmailInput(event.target.value)}
                    placeholder="tu-email@domain.com"
                    className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void sendMagicLink()}
                    disabled={authLoading}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs"
                  >
                    <LogIn className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  {authUser?.email
                    ? `Connected: ${authUser.email}`
                    : "No active session. Use Magic Link."}
                </p>
                {authUser ? (
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                ) : null}
              </div>
            </article>

            <article className={`${glass} md:col-span-4`} style={{ borderColor: palette.border }}>
              <div className="mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4" style={{ color: palette.accent }} />
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                  Senior Partner
                </p>
              </div>
              <textarea
                readOnly
                value={seniorBrief}
                className="h-52 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm leading-relaxed"
              />
            </article>

            <article className={`${glass} md:col-span-8`} style={{ borderColor: palette.border }}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                  Bento Calendar
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarAnchor((previous) => {
                        const next = new Date(previous);
                        next.setMonth(previous.getMonth() - 1);
                        return next;
                      })
                    }
                    className="rounded-lg border border-zinc-700 px-2 py-1"
                  >
                    Prev
                  </button>
                  <span>
                    {calendarAnchor.toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarAnchor((previous) => {
                        const next = new Date(previous);
                        next.setMonth(previous.getMonth() + 1);
                        return next;
                      })
                    }
                    className="rounded-lg border border-zinc-700 px-2 py-1"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarWeeks.flat().map((cell) => (
                  <div
                    key={cell.isoDate}
                    className={`min-h-[74px] rounded-xl border p-1 text-xs ${
                      cell.inCurrentMonth
                        ? "border-zinc-700 bg-zinc-950/70"
                        : "border-zinc-900 bg-zinc-950/20 text-zinc-600"
                    } ${cell.isToday ? "ring-1 ring-[#0070f3]" : ""}`}
                  >
                    <p className="text-[10px]">{cell.dayNumber}</p>
                    <div className="mt-1 space-y-1">
                      {cell.assignments.slice(0, 2).map((assignment) => (
                        <p
                          key={assignment.id}
                          className={`truncate rounded px-1 py-0.5 ${
                            assignment.type === "exam"
                              ? "bg-orange-500/20 text-orange-200"
                              : "bg-sky-500/20 text-sky-200"
                          }`}
                        >
                          {assignment.title}
                        </p>
                      ))}
                      {cell.assignments.length > 2 ? (
                        <p className="text-[10px] text-zinc-400">+{cell.assignments.length - 2}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${glass} md:col-span-4`} style={{ borderColor: palette.border }}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                7-Day Action Plan
              </h3>
              <div className="mt-3 space-y-2">
                {actionPlan.length === 0 ? (
                  <p className="text-sm text-zinc-500">No prioridades en próximos 7 días.</p>
                ) : (
                  actionPlan.slice(0, 8).map(({ item, priority, days }) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-2 text-sm"
                    >
                      <p className="font-medium text-zinc-200">{item.title}</p>
                      <p className="text-xs text-zinc-400">
                        {days}d left · {priority} · {item.type.toUpperCase()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "works" ? (
          <section className="grid gap-4 md:grid-cols-12">
            <article className={`${glass} md:col-span-6`} style={{ borderColor: palette.border }}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                Semester Manager
              </h2>
              <div className="mt-3 grid gap-2">
                <input
                  value={subjectForm.code}
                  onChange={(event) =>
                    setSubjectForm((previous) => ({ ...previous, code: event.target.value }))
                  }
                  placeholder="Subject Code (CS1)"
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                />
                <input
                  value={subjectForm.name}
                  onChange={(event) =>
                    setSubjectForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                  placeholder="Subject Name"
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={subjectForm.credits}
                  onChange={(event) =>
                    setSubjectForm((previous) => ({
                      ...previous,
                      credits: Number(event.target.value),
                    }))
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
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
                  Agregar Subject
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {state.subjects.length === 0 ? (
                  <p className="text-sm text-zinc-500">Sin subjects todavía.</p>
                ) : (
                  state.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-sm"
                    >
                      <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                        <input
                          value={subject.code}
                          onChange={(event) =>
                            updateSubject(subject.id, { code: event.target.value })
                          }
                          className="rounded-md border border-zinc-800 bg-black px-2 py-1"
                        />
                        <input
                          value={subject.name}
                          onChange={(event) =>
                            updateSubject(subject.id, { name: event.target.value })
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

              <h3 className="mt-5 text-xs uppercase tracking-[0.14em] text-zinc-400">
                Weekly Schedule
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <select
                  value={scheduleForm.subjectId}
                  onChange={(event) =>
                    setScheduleForm((previous) => ({
                      ...previous,
                      subjectId: event.target.value,
                    }))
                  }
                  className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="">Select subject</option>
                  {state.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
                <select
                  value={scheduleForm.day}
                  onChange={(event) =>
                    setScheduleForm((previous) => ({
                      ...previous,
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
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: palette.border,
                    color: palette.accent,
                    background: palette.accentSoft,
                  }}
                >
                  Add Block
                </button>
                <input
                  type="time"
                  value={scheduleForm.start}
                  onChange={(event) =>
                    setScheduleForm((previous) => ({
                      ...previous,
                      start: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={scheduleForm.end}
                  onChange={(event) =>
                    setScheduleForm((previous) => ({
                      ...previous,
                      end: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-3 space-y-2">
                {sortedSchedule.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm"
                  >
                    <p>
                      {block.day} · {formatTimeLabel(block.start)}-{formatTimeLabel(block.end)} ·{" "}
                      {getSubjectName(block.subjectId)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeScheduleBlock(block.id)}
                      className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${glass} md:col-span-6`} style={{ borderColor: palette.border }}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                Syllabus Manager · Syllabus AI
              </h2>
              <div className="mt-3 space-y-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 px-3 py-3 text-sm text-zinc-300">
                  <Upload className="h-4 w-4" />
                  {ocrLoading ? "Running OCR..." : "Upload Syllabus image"}
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
                    color: palette.accent,
                    background: palette.accentSoft,
                  }}
                >
                  Parse & Sync Deadlines
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-sm">
                <p className="font-medium text-zinc-200">Extracted JSON Preview</p>
                <pre className="mt-2 max-h-44 overflow-auto rounded-lg bg-black p-2 text-xs text-zinc-300">
                  {JSON.stringify(
                    {
                      grading_weights: state.syllabus.gradingWeights,
                      important_dates: state.syllabus.importantDates.slice(0, 8),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div className="mt-3 space-y-2">
                <input
                  value={questionInput}
                  onChange={(event) => setQuestionInput(event.target.value)}
                  placeholder='Ask: "What is the attendance policy?"'
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void askSyllabusAi()}
                  className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm"
                  disabled={chatLoading}
                >
                  {chatLoading ? "Thinking..." : "Ask Syllabus AI"}
                </button>
                <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
                  {state.chatHistory.length === 0 ? (
                    <p className="text-sm text-zinc-500">No chat yet.</p>
                  ) : (
                    state.chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          message.role === "assistant"
                            ? "border border-zinc-700 bg-zinc-900"
                            : "border border-zinc-800 bg-black text-zinc-300"
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                          {message.role}
                        </p>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </article>

            <article className={`${glass} md:col-span-6`} style={{ borderColor: palette.border }}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                GPA Tracker (Global 4.0)
              </h2>
              <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                <p className="text-sm">
                  Cumulative GPA:{" "}
                  <span className="font-semibold text-zinc-100">
                    {state.cumulativeGpa.toFixed(2)} / 4.00
                  </span>
                </p>
                <p className="text-sm text-zinc-400">
                  Current class projection: {projectedClassGpa.toFixed(2)} / 4.00
                </p>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="text-zinc-400">
                      <th className="pb-2">Term</th>
                      <th className="pb-2">GPA</th>
                      <th className="pb-2">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.semesterHistory.map((row, index) => (
                      <tr key={row.term} className="border-t border-zinc-800">
                        <td className="py-2">{row.term}</td>
                        <td className="py-2">
                          <input
                            type="number"
                            min={0}
                            max={4}
                            step={0.01}
                            value={row.gpa}
                            onChange={(event) =>
                              updateSemester(index, {
                                gpa: clamp(Number(event.target.value), 0, 4),
                              })
                            }
                            className="w-24 rounded-md border border-zinc-700 bg-black px-2 py-1"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            min={0}
                            max={24}
                            value={row.credits}
                            onChange={(event) =>
                              updateSemester(index, {
                                credits: clamp(Number(event.target.value), 0, 24),
                              })
                            }
                            className="w-20 rounded-md border border-zinc-700 bg-black px-2 py-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className={`${glass} md:col-span-6`} style={{ borderColor: palette.border }}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                Class Grade Predictor (What-if)
              </h2>
              <div className="mt-3 space-y-3">
                {weightEntries.map(([component, weight]) => (
                  <div key={component} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>
                        {component} ({weight}%)
                      </span>
                      <span>{(state.componentScores[component] ?? 0).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={state.componentScores[component] ?? 0}
                      onChange={(event) =>
                        setState((previous) => ({
                          ...previous,
                          componentScores: {
                            ...previous.componentScores,
                            [component]: Number(event.target.value),
                          },
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-sm">
                <p>Projected class grade: {currentGrade.toFixed(2)}%</p>
                <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
                  <label>What-if component:</label>
                  <select
                    value={state.selectedScenarioComponent}
                    onChange={(event) =>
                      setState((previous) => ({
                        ...previous,
                        selectedScenarioComponent: event.target.value,
                      }))
                    }
                    className="rounded-md border border-zinc-700 bg-black px-2 py-1"
                  >
                    {weightEntries.map(([component]) => (
                      <option key={component} value={component}>
                        {component}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-zinc-300">
                  {scoreNeeded === null
                    ? "No scenario available."
                    : scoreNeeded > 100
                      ? `Need ${scoreNeeded.toFixed(1)}% on ${state.selectedScenarioComponent}. A target is unlikely.`
                      : scoreNeeded <= 0
                        ? "Target A already secured."
                        : `Need ${scoreNeeded.toFixed(1)}% on ${state.selectedScenarioComponent} to keep an A.`}
                </p>
              </div>
            </article>

            <article className={`${glass} md:col-span-7`} style={{ borderColor: palette.border }}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                Assignments + Calendar Sync
              </h2>
              <div className="mt-3 grid gap-2">
                <select
                  value={assignmentForm.subjectId}
                  onChange={(event) =>
                    setAssignmentForm((previous) => ({
                      ...previous,
                      subjectId: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="">General</option>
                  {state.subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
                <input
                  value={assignmentForm.title}
                  onChange={(event) =>
                    setAssignmentForm((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Assignment title"
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                />
                <input
                  type="datetime-local"
                  value={assignmentForm.dueAt}
                  onChange={(event) =>
                    setAssignmentForm((previous) => ({
                      ...previous,
                      dueAt: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                />
                <select
                  value={assignmentForm.type}
                  onChange={(event) =>
                    setAssignmentForm((previous) => ({
                      ...previous,
                      type: event.target.value as AssignmentItem["type"],
                    }))
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                >
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                </select>
                <button
                  type="button"
                  onClick={addAssignment}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: palette.border,
                    color: palette.accent,
                    background: palette.accentSoft,
                  }}
                >
                  Add to Calendar
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {[...groupedAssignments.entries()].map(([subjectId, assignments]) => (
                  <div key={subjectId} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">
                      {getSubjectName(subjectId)}
                    </p>
                    <div className="mt-2 space-y-2">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-start justify-between gap-2 rounded-lg border border-zinc-800 bg-black/70 px-2 py-2"
                        >
                          <button
                            type="button"
                            onClick={() => toggleAssignment(assignment.id)}
                            className={`mt-0.5 rounded-md border px-2 py-1 text-xs ${
                              assignment.completed
                                ? "border-emerald-700 text-emerald-300"
                                : "border-zinc-700 text-zinc-300"
                            }`}
                          >
                            {assignment.completed ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              "Todo"
                            )}
                          </button>
                          <div className="flex-1 text-sm">
                            <p
                              className={
                                assignment.completed
                                  ? "line-through text-zinc-500"
                                  : "text-zinc-100"
                              }
                            >
                              {assignment.title}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {assignment.type.toUpperCase()} ·{" "}
                              {formatDateLabel(assignment.dueAt)} ·{" "}
                              {formatCountdown(assignment.dueAt, now)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAssignment(assignment.id)}
                            className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {state.assignments.length === 0 ? (
                  <p className="text-sm text-zinc-500">No assignments loaded.</p>
                ) : null}
              </div>
            </article>

            <article className={`${glass} md:col-span-5`} style={{ borderColor: palette.border }}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                Notification System (Resend)
              </h2>
              <p className="mt-2 text-xs text-zinc-500">
                Triggers activos: 7 días y 2 días antes del evento.
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    value={state.notificationEmail}
                    onChange={(event) =>
                      setState((previous) => ({
                        ...previous,
                        notificationEmail: event.target.value,
                      }))
                    }
                    placeholder="email para alerts"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={state.remindersEnabled}
                    onChange={(event) =>
                      setState((previous) => ({
                        ...previous,
                        remindersEnabled: event.target.checked,
                      }))
                    }
                  />
                  Enable automatic daily scan
                </label>
                <button
                  type="button"
                  onClick={() => void runReminderScan(false)}
                  disabled={notificationLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm"
                >
                  <Bell className="h-4 w-4" />
                  {notificationLoading ? "Sending..." : "Run Reminder Scan"}
                </button>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-400">
                  Email tone: Senior Partner, professional + direct.
                </div>
              </div>
            </article>
          </section>
        ) : null}

        {activeTab === "history" ? (
          <section className="grid gap-4 md:grid-cols-12">
            <article className={`${glass} md:col-span-8`} style={{ borderColor: palette.border }}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                History Log
              </h2>
              <div className="mt-3 space-y-2">
                {state.history.length === 0 ? (
                  <p className="text-sm text-zinc-500">No events yet.</p>
                ) : (
                  state.history.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm"
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

            <article className={`${glass} md:col-span-4`} style={{ borderColor: palette.border }}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">
                System Status
              </h2>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <p>
                  <Sparkles className="mr-1 inline h-4 w-4" style={{ color: palette.accent }} />
                  Theme: {state.examMode ? "Exam Mode" : "Standard Dark"}
                </p>
                <p>
                  <CalendarDays className="mr-1 inline h-4 w-4" />
                  Assignments: {state.assignments.length}
                </p>
                <p>
                  <BriefcaseBusiness className="mr-1 inline h-4 w-4" />
                  Subjects: {state.subjects.length}
                </p>
                <p>
                  <Bell className="mr-1 inline h-4 w-4" />
                  Reminders: {state.remindersEnabled ? "ON" : "OFF"}
                </p>
                <p>
                  <Send className="mr-1 inline h-4 w-4" />
                  Magic Link user: {authUser?.email ?? "Not signed in"}
                </p>
                <p>
                  <Bot className="mr-1 inline h-4 w-4" />
                  Cloud Sync:{" "}
                  {cloudSyncing
                    ? "syncing..."
                    : supabase
                      ? authUser
                        ? "connected"
                        : "ready (login pending)"
                      : "disabled (missing envs)"}
                </p>
              </div>
            </article>
          </section>
        ) : null}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3">
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
