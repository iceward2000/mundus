import { NextResponse } from "next/server";

type UnknownRecord = Record<string, unknown>;

const MAX_FIELD_LENGTH = 4000;

function sanitizeValue(value: unknown, max = MAX_FIELD_LENGTH): string | null {
  if (value === null || value === undefined) return null;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}...[truncated]` : text;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
  }

  const payload = body as UnknownRecord;
  const report = {
    reportId: sanitizeValue(payload.reportId, 256),
    scope: sanitizeValue(payload.scope, 64),
    digest: sanitizeValue(payload.digest, 256),
    name: sanitizeValue(payload.name, 256),
    message: sanitizeValue(payload.message),
    stack: sanitizeValue(payload.stack, 12000),
    path: sanitizeValue(payload.path, 512),
    userAgent: sanitizeValue(payload.userAgent, 1024),
    viewport: sanitizeValue(payload.viewport, 64),
    timestamp: sanitizeValue(payload.timestamp, 128),
    receivedAt: new Date().toISOString(),
  };

  console.error("[client-error-report]", report);

  return NextResponse.json({ ok: true });
}
