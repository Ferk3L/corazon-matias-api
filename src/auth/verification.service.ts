import { Injectable, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { MailService } from '../mail/mail.service';
import * as admin from 'firebase-admin';

@Injectable()
export class VerificationService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly mailService: MailService,
  ) {}

  // Genera código ANTES de crear la cuenta — usa email como key
  async enviarCodigo(uid: string, email: string, nombre: string): Promise<void> {
    const db = this.firebase.getDb();

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 60 * 1000)
    );

    // Usar email sanitizado como ID del documento
    const emailKey = email.replace(/[.#$[\]]/g, '_');
    await db.collection('verification_codes').doc(emailKey).set({
      uid: uid || '',
      email,
      nombre,
      codigo,
      expiresAt,
      usado: false,
      createdAt: admin.firestore.Timestamp.now(),
    });

    await this.mailService.enviarCodigoVerificacion(email, nombre, codigo);
  }

  // Enviar código sin uid (antes de crear cuenta)
  async enviarCodigoPorEmail(email: string, nombre: string): Promise<void> {
    await this.enviarCodigo('', email, nombre);
  }

  // Valida el código por email
  async verificarCodigoPorEmail(email: string, codigo: string): Promise<{ success: boolean; message: string }> {
    const db = this.firebase.getDb();
    const emailKey = email.replace(/[.#$[\]]/g, '_');
    const ref = db.collection('verification_codes').doc(emailKey);
    const doc = await ref.get();

    if (!doc.exists) {
      throw new BadRequestException('No se encontró un código para este usuario');
    }

    const data = doc.data() as any;

    if (data.usado) {
      throw new BadRequestException('Este código ya fue usado');
    }

    if (data.expiresAt.toDate() < new Date()) {
      throw new BadRequestException('El código ha expirado. Solicita uno nuevo.');
    }

    if (data.codigo !== codigo.trim()) {
      throw new BadRequestException('Código incorrecto');
    }

    // Marcar código como usado
    await ref.update({ usado: true });

    return { success: true, message: 'Correo verificado correctamente' };
  }

  // Mantener compatibilidad con uid
  async verificarCodigo(uid: string, codigo: string): Promise<{ success: boolean; message: string }> {
    const db = this.firebase.getDb();
    const auth = this.firebase.getAuth();
    const ref = db.collection('verification_codes').doc(uid);
    const doc = await ref.get();
    if (!doc.exists) throw new BadRequestException('No se encontró un código');
    const data = doc.data() as any;
    if (data.usado) throw new BadRequestException('Este código ya fue usado');
    if (data.expiresAt.toDate() < new Date()) throw new BadRequestException('El código ha expirado');
    if (data.codigo !== codigo.trim()) throw new BadRequestException('Código incorrecto');
    await ref.update({ usado: true });
    try { await auth.updateUser(uid, { emailVerified: true }); } catch {}
    return { success: true, message: 'Correo verificado correctamente' };
  }

  // Reenviar código
  async reenviarCodigo(email: string): Promise<void> {
    const db = this.firebase.getDb();
    const emailKey = email.replace(/[.#$[\]]/g, '_');
    const doc = await db.collection('verification_codes').doc(emailKey).get();
    if (!doc.exists) throw new BadRequestException('No se encontró el código');
    const data = doc.data() as any;
    await this.enviarCodigo('', data.email, data.nombre || data.email.split('@')[0]);
  }
}