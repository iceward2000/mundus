/**
 * Server-side contact payload validation and HTML escaping for outbound email bodies.
 */

const MAX = {
  firstName: 80,
  lastName: 120,
  company: 200,
  position: 120,
  phone: 40,
  email: 254,
  message: 8000,
} as const;

/** Pragmatic check: blocks whitespace/control chars and obvious garbage; avoids strict ASCII-only RFC regex. */
export function isValidEmail(email: string): boolean {
  if (email.length < 3 || email.length > MAX.email) return false;
  if (/[\s\r\n\u0000<>"]/.test(email)) return false;
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!domain.includes(".") || domain.length > 253) return false;
  if (local.length > 64) return false;
  return true;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip CR/LF to reduce header-injection risk in email subjects. */
export function sanitizeSubjectFragment(text: string, maxLen: number): string {
  return text.replace(/[\r\n\u0000]/g, " ").trim().slice(0, maxLen);
}

export type ContactFields = {
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  message: string;
};

function asTrimmedString(v: unknown, max: number): string {
  if (v == null) return "";
  const s = String(v).trim();
  return s.length > max ? s.slice(0, max) : s;
}

export function parseContactBody(body: unknown):
  | { ok: true; data: ContactFields }
  | { ok: false; error: string } {
  if (body === null || typeof body !== "object") {
    return { ok: false, error: "Geçersiz istek gövdesi" };
  }

  const o = body as Record<string, unknown>;

  const firstName = asTrimmedString(o.firstName, MAX.firstName);
  const lastName = asTrimmedString(o.lastName, MAX.lastName);
  const company = asTrimmedString(o.company, MAX.company);
  const position = asTrimmedString(o.position, MAX.position);
  const phone = asTrimmedString(o.phone, MAX.phone);
  const emailRaw = String(o.email ?? "").trim();
  const message = asTrimmedString(o.message, MAX.message);

  if (!firstName || !emailRaw || !message) {
    return { ok: false, error: "Gerekli alanlar eksik" };
  }

  if (!isValidEmail(emailRaw)) {
    return { ok: false, error: "Geçersiz e-posta adresi" };
  }

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      company,
      position,
      phone,
      email: emailRaw,
      message,
    },
  };
}
