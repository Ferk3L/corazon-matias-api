import { Controller, Post, Body } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly verificationService: VerificationService) {}

  // POST /api/v1/auth/send-code
  @Post('send-code')
  async sendCode(@Body() body: { uid: string; email: string; nombre: string }) {
    await this.verificationService.enviarCodigo(body.uid, body.email, body.nombre);
    return { success: true, message: 'Código enviado al correo' };
  }

  // POST /api/v1/auth/verify-code
  @Post('verify-code')
  async verifyCode(@Body() body: { uid: string; codigo: string }) {
    return this.verificationService.verificarCodigo(body.uid, body.codigo);
  }

  // POST /api/v1/auth/resend-code
  @Post('resend-code')
  async resendCode(@Body() body: { uid: string }) {
    await this.verificationService.reenviarCodigo(body.uid);
    return { success: true, message: 'Código reenviado' };
  }
}