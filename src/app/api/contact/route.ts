/**
 * Contact form API. Sends form data via Resend.
 *
 * Security: No rate limiting. User input is interpolated into HTML—sanitize before
 * sending if Resend or recipient mail client renders HTML. See CODEBASE_ANALYSIS.md.
 */
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, company, position, phone, email, message } = body;

    // Validate required fields
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: 'Mundus Website <noreply@mundus.com.tr>',
      to: 'hey@mundus.com.tr',
      replyTo: email,
      subject: `Yeni İletişim Talebi: ${firstName} ${lastName}`,
      html: `
        <h2>Yeni İletişim Talebi</h2>
        <p><strong>Ad:</strong> ${firstName}</p>
        <p><strong>Soyad:</strong> ${lastName}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone || 'Belirtilmedi'}</p>
        <p><strong>Şirket:</strong> ${company || 'Belirtilmedi'}</p>
        <p><strong>Pozisyon:</strong> ${position || 'Belirtilmedi'}</p>
        <hr />
        <p><strong>Mesaj:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json(
      { message: 'Mesaj başarıyla gönderildi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilemedi' },
      { status: 500 }
    );
  }
}
