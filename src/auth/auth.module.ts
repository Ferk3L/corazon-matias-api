import { Controller, Post, Body } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly verificationService: VerificationService) {}

  // POST /api/v1/auth/send-code
  // Puede usarse ANTES de crear cuenta (sin uid) o después (con uid)
  @Post('send-code')
  async sendCode(@Body() body: { uid?: string; email: string; nombre: string }) {
    await this.verificationService.enviarCodigo(body.uid || '', body.email, body.nombre);
    return { success: true, message: 'Código enviado al correo' };
  }

  // POST /api/v1/auth/verify-code-email
  // Verificar código usando email como identificador
  @Post('verify-code-email')
  async verifyCodeByEmail(@Body() body: { email: string; codigo: string }) {
    return this.verificationService.verificarCodigoPorEmail(body.email, body.codigo);
  }

  // POST /api/v1/auth/verify-code (compatibilidad con uid)
  @Post('verify-code')
  async verifyCode(@Body() body: { uid: string; codigo: string }) {
    return this.verificationService.verificarCodigo(body.uid, body.codigo);
  }

  // POST /api/v1/auth/resend-code
  @Post('resend-code')
  async resendCode(@Body() body: { email: string }) {
    await this.verificationService.reenviarCodigo(body.email);
    return { success: true, message: 'Código reenviado' };
  }
}