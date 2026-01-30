import { NextResponse } from "next/server";

type IncomingBody = {
  message?: {
    parts?: Array<{ type?: string; text?: string }>;
  };
};

function extractPrompt(body: IncomingBody) {
  const parts = body?.message?.parts ?? [];
  return parts
    .filter((p) => (p.type ?? "text") === "text")
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.CUSTOMGPT_API_KEY;
    const projectId = process.env.CUSTOMGPT_AGENT_ID;

    if (!apiKey || !projectId) {
      return NextResponse.json(
        {
          error: "Missing environment variables",
          missing: {
            CUSTOMGPT_API_KEY: !apiKey,
            CUSTOMGPT_AGENT_ID: !projectId,
          },
        },
        { status: 500 }
      );
    }

    let bo
