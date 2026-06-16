import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async enviarCodigoVerificacion(email: string, nombre: string, codigo: string): Promise<void> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:500px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:30px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">💖</div>
          <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">Corazón de Matías</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Fábrica de Dulces Artesanales</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#1e40af;font-size:18px;margin:0 0 8px;">¡Hola, ${nombre}! 👋</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Gracias por registrarte. Usa el siguiente código para verificar tu correo electrónico:
          </p>
          <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
            <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px;">Tu código de verificación</p>
            <div style="font-size:42px;font-weight:800;color:white;letter-spacing:12px;font-family:monospace;">${codigo}</div>
            <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:12px 0 0;">⏱️ Válido por 10 minutos</p>
          </div>
          <p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 8px;">Si no solicitaste este código, puedes ignorar este mensaje.</p>
          <p style="color:#888;font-size:13px;line-height:1.5;margin:0;">⚠️ Nunca compartas este código con nadie.</p>
        </div>
        <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#aaa;font-size:12px;margin:0;">© 2025 Fábrica de Dulces Corazón de Matías · Durango, México</p>
        </div>
      </div>
    </body>
    </html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Corazón de Matías <onboarding@resend.dev>',
        to: [email],
        subject: `${codigo} — Tu código de verificación | Corazón de Matías`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error al enviar email: ${JSON.stringify(error)}`);
    }

    this.logger.log(`Código de verificación enviado a ${email}`);
  }
}