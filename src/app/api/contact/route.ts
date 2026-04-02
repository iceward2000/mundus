import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkContactRateLimit, getClientIp } from "@/lib/contactRateLimit";
import {
  escapeHtml,
  parseContactBody,
  sanitizeSubjectFragment,
} from "@/lib/contactValidate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = checkContactRateLimit(ip);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Mesaj gönderilemedi" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = parseContactBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { firstName, lastName, company, position, phone, email, message } =
    parsed.data;

  const subjectFirst = sanitizeSubjectFragment(firstName, 80);
  const subjectLast = sanitizeSubjectFragment(lastName, 120);
  const subject = `Yeni İletişim Talebi: ${subjectFirst} ${subjectLast}`.trim();

  const html = `
        <h2>Yeni İletişim Talebi</h2>
        <p><strong>Ad:</strong> ${escapeHtml(firstName)}</p>
        <p><strong>Soyad:</strong> ${escapeHtml(lastName)}</p>
        <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone || "Belirtilmedi")}</p>
        <p><strong>Şirket:</strong> ${escapeHtml(company || "Belirtilmedi")}</p>
        <p><strong>Pozisyon:</strong> ${escapeHtml(position || "Belirtilmedi")}</p>
        <hr />
        <p><strong>Mesaj:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `;

  try {
    await resend.emails.send({
      from: "Mundus Website <noreply@mundus.com.tr>",
      to: "hey@mundus.com.tr",
      replyTo: email,
      subject,
      html,
    });

    return NextResponse.json(
      { message: "Mesaj başarıyla gönderildi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilemedi" },
      { status: 500 }
    );
  }
}
