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

  // Genera código de 6 dígitos y lo manda por email
  async enviarCodigo(uid: string, email: string, nombre: string): Promise<void> {
    const db = this.firebase.getDb();

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
    );

    // Guardar en Firestore
    await db.collection('verification_codes').doc(uid).set({
      uid,
      email,
      codigo,
      expiresAt,
      usado: false,
      createdAt: admin.firestore.Timestamp.now(),
    });

    // Mandar email
    await this.mailService.enviarCodigoVerificacion(email, nombre, codigo);
  }

  // Valida el código y marca la cuenta como verificada
  async verificarCodigo(uid: string, codigo: string): Promise<{ success: boolean; message: string }> {
    const db = this.firebase.getDb();
    const auth = this.firebase.getAuth();

    const ref = db.collection('verification_codes').doc(uid);
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

    // Marcar email como verificado en Firebase Auth
    try {
      await auth.updateUser(uid, { emailVerified: true });
    } catch (error: any) {
      console.warn('No se pudo verificar en Auth:', error.message);
    }

    return { success: true, message: 'Correo verificado correctamente' };
  }

  // Reenviar código
  async reenviarCodigo(uid: string): Promise<void> {
    const db = this.firebase.getDb();
    const doc = await db.collection('verification_codes').doc(uid).get();

    if (!doc.exists) {
      throw new BadRequestException('No se encontró el usuario');
    }

    const data = doc.data() as any;
    await this.enviarCodigo(uid, data.email, data.email.split('@')[0]);
  }
}