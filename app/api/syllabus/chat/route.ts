import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  answerSyllabusQuestionLocal,
  type ParsedSyllabus,
} from "@/app/lib/academicEngine";

interface ChatPayload {
  question?: string;
  syllabus?: ParsedSyllabus;
}

export async function POST(request: Request) {
  let payload: ChatPayload;
  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const question = payload.question?.trim();
  const syllabus = payload.syllabus;
  if (!question || !syllabus) {
    return NextResponse.json(
      { error: "question and syllabus are required." },
      { status: 400 },
    );
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({
      answer: answerSyllabusQuestionLocal(question, syllabus),
      mode: "local",
    });
  }

  try {
    const client = new OpenAI({ apiKey: openaiKey });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are Syllabus AI. Answer strictly based on the provided syllabus context. If unknown, say that it is not in the syllabus.",
        },
        {
          role: "user",
          content: `Question: ${question}\n\nSyllabus Context:\n${syllabus.sourceText}`,
        },
      ],
    });

    const answer = response.output_text?.trim();
    return NextResponse.json({
      answer:
        answer && answer.length > 0
          ? answer
          : answerSyllabusQuestionLocal(question, syllabus),
      mode: "openai",
    });
  } catch {
    return NextResponse.json({
      answer: answerSyllabusQuestionLocal(question, syllabus),
      mode: "fallback",
    });
  }
}
