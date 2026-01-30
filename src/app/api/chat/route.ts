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

  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const prompt = extractPrompt(body);
  if (!prompt) {
    return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.customgpt.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const raw = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: "CustomGPT request failed", status: res.status, body: raw },
        { status: 502 }
      );
    }

    try {
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({ ok: true, raw });
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "fetch failed",
        name: err?.name,
        message: err?.message,
        cause: err?.cause ? String(err.cause) : undefined,
      },
      { status: 500 }
    );
  }
}
