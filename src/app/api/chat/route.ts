import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.CUSTOMGPT_API_KEY;
    const projectId = process.env.CUSTOMGPT_AGENT_ID;

    if (!apiKey || !projectId) {
      return NextResponse.json(
        { error: "Missing environment variables" },
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
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.customgpt.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: "CustomGPT error", details: data },
        { status: 502 }
      );
    }

    return NextResponse.json(JSON.parse(data));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
