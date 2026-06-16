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

  // Convierte email a key válido para Firestore
  private emailToKey(email: string): string {
    // Reemplazar caracteres inválidos para Firestore doc ID
    return email
      .toLowerCase()
      .replace(/\./g, '_dot_')
      .replace(/@/g, '_at_')
      .replace(/[^a-z0-9_]/g, '_');
  }

  async enviarCodigo(uid: string, email: string, nombre: string): Promise<void> {
    if (!email || !email.trim()) {
      throw new BadRequestException('El email es requerido');
    }

    const db = this.firebase.getDb();
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 60 * 1000)
    );

    const emailKey = this.emailToKey(email.trim());

    await db.collection('verification_codes').doc(emailKey).set({
      uid: uid || '',
      email: email.trim(),
      nombre: nombre || email.split('@')[0],
      codigo,
      expiresAt,
      usado: false,
      createdAt: admin.firestore.Timestamp.now(),
    });

    await this.mailService.enviarCodigoVerificacion(email.trim(), nombre || email.split('@')[0], codigo);
  }

  async verificarCodigoPorEmail(email: string, codigo: string): Promise<{ success: boolean; message: string }> {
    if (!email || !codigo) {
      throw new BadRequestException('Email y código son requeridos');
    }

    const db = this.firebase.getDb();
    const emailKey = this.emailToKey(email.trim());
    const ref = db.collection('verification_codes').doc(emailKey);
    const doc = await ref.get();

    if (!doc.exists) {
      throw new BadRequestException('No se encontró un código para este correo');
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

    await ref.update({ usado: true });

    return { success: true, message: 'Correo verificado correctamente' };
  }

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

  async reenviarCodigo(email: string): Promise<void> {
    if (!email) throw new BadRequestException('El email es requerido');
    const db = this.firebase.getDb();
    const emailKey = this.emailToKey(email.trim());
    const doc = await db.collection('verification_codes').doc(emailKey).get();
    if (!doc.exists) throw new BadRequestException('No se encontró el código');
    const data = doc.data() as any;
    await this.enviarCodigo('', data.email, data.nombre || data.email.split('@')[0]);
  }
}