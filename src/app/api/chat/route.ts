import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.CUSTOMGPT_API_KEY;
    const projectId = process.env.CUSTOMGPT_AGENT_ID;

    if (!apiKey || !projectId) {
      return NextResponse.json(
        {
          error: "Missing env vars",
          missing: {
            CUSTOMGPT_API_KEY: !apiKey,
            CUSTOMGPT_AGENT_ID: !projectId,
          },
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt =
      body?.message?.parts
        ?.filter((p: any) => (p.type ?? "text") === "text")
        ?.map((p: any) => p.text ?? "")
        ?.join("")
        ?.trim() ?? "";

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt found in request body" },
        { status: 400 }
      );
    }

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
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}
