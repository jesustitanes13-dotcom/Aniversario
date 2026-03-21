import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ReminderTaskPayload {
  id: string;
  title: string;
  dueAt: string;
  completed: boolean;
  type: "assignment" | "exam";
}

interface ReminderRequestPayload {
  recipientEmail?: string;
  tasks?: ReminderTaskPayload[];
  sentReminderKeys?: string[];
}

const DAY_MS = 1000 * 60 * 60 * 24;
const DAY_MARKS = new Set([2, 7]);

const buildReminderKey = (taskId: string, dayMark: number) => `${taskId}:${dayMark}`;

const composeBody = (taskTitle: string, hoursLeft: number, dayMark: number) =>
  [
    "Senior Partner Alert",
    "",
    `¡Jesús, te faltan ${dayMark} días para: ${taskTitle}!`,
    `Remaining time: approximately ${hoursLeft} hour(s).`,
    "This is a high-priority academic checkpoint.",
    "",
    "Required action:",
    "1) Lock a focused study block today.",
    "2) Prioritize exam-critical tasks before lower-impact tasks.",
    "3) Verify submission logistics before cutoff.",
  ].join("\n");

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      {
        error: "RESEND_API_KEY is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  let payload: ReminderRequestPayload;
  try {
    payload = (await request.json()) as ReminderRequestPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      {
        status: 400,
      },
    );
  }

  const recipientEmail = payload.recipientEmail?.trim();
  const tasks = payload.tasks ?? [];
  const sentReminderKeys = new Set(payload.sentReminderKeys ?? []);

  if (!recipientEmail) {
    return NextResponse.json(
      {
        error: "recipientEmail is required.",
      },
      {
        status: 400,
      },
    );
  }

  const resend = new Resend(resendApiKey);
  const from =
    process.env.RESEND_FROM_EMAIL || "Senior Partner <onboarding@resend.dev>";

  const now = new Date();
  let sentCount = 0;
  const triggeredKeys: string[] = [];
  const skipped: string[] = [];

  for (const task of tasks) {
    if (task.completed) continue;
    const dueDate = new Date(task.dueAt);
    if (Number.isNaN(dueDate.getTime())) continue;
    const msUntilDue = dueDate.getTime() - now.getTime();
    if (msUntilDue <= 0) continue;

    const dayMark = Math.ceil(msUntilDue / DAY_MS);
    if (!DAY_MARKS.has(dayMark)) continue;

    const reminderKey = buildReminderKey(task.id, dayMark);
    if (sentReminderKeys.has(reminderKey)) {
      skipped.push(reminderKey);
      continue;
    }

    const hoursLeft = Math.ceil(msUntilDue / (1000 * 60 * 60));
    const subject = `[URGENT] Academic Deadline: ${task.title} in ${hoursLeft}h`;
    const textBody = composeBody(task.title, hoursLeft, dayMark);

    try {
      await resend.emails.send({
        from,
        to: recipientEmail,
        subject,
        text: textBody,
      });
      sentCount += 1;
      triggeredKeys.push(reminderKey);
    } catch {
      skipped.push(reminderKey);
    }
  }

  return NextResponse.json({
    sentCount,
    triggeredKeys,
    skipped,
    message:
      sentCount > 0
        ? `Reminder scan finished. ${sentCount} email(s) sent.`
        : "Reminder scan finished. No emails due for 7/2-day windows.",
  });
}
