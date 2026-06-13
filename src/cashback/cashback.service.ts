import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { AjusteManualDto, GenerarTokenDto, ProcesarQrDto } from './cashback.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class CashbackService {
  private readonly PORCENTAJE = 0.05;
  private readonly BONO_BIENVENIDA = 20;

  constructor(private readonly firebase: FirebaseService) {}

  async getCliente(uid: string) {
    const db = this.firebase.getDb();
    const doc = await db.collection('clientes').doc(uid).get();
    if (!doc.exists) throw new NotFoundException(`Cliente ${uid} no encontrado`);
    return { id: doc.id, ...doc.data() };
  }

  async getTodosLosClientes() {
    const db = this.firebase.getDb();
    const snapshot = await db.collection('clientes').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getHistorial(clienteUid: string) {
    const db = this.firebase.getDb();
    const snapshot = await db.collection('movimientos_cashback')
      .where('clienteUid', '==', clienteUid)
      .orderBy('fecha', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async ajusteManual(dto: AjusteManualDto) {
    const db = this.firebase.getDb();
    const ref = db.collection('clientes').doc(dto.clienteUid);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Cliente no encontrado');
    const cliente = doc.data() as any;
    const nuevoSaldo = Math.max(0, (cliente.saldoCashback || 0) + dto.monto);
    await ref.update({ saldoCashback: nuevoSaldo });
    await db.collection('movimientos_cashback').add({
      clienteUid: dto.clienteUid,
      tipo: 'ajuste_manual',
      monto: dto.monto,
      descripcion: `Ajuste manual: ${dto.nota}`,
      adminNota: dto.nota,
      fecha: admin.firestore.Timestamp.now(),
    });
    return { nuevoSaldo, monto: dto.monto };
  }

  async generarToken(dto: GenerarTokenDto) {
    const db = this.firebase.getDb();
    const monto = Math.round(dto.totalPedido * this.PORCENTAJE * 100) / 100;
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );
    const tokenData = {
      orderId: dto.orderId,
      clienteUid: dto.clienteUid,
      clienteNombre: dto.clienteNombre,
      monto,
      totalPedido: dto.totalPedido,
      usado: false,
      expiresAt,
      createdAt: admin.firestore.Timestamp.now(),
    };
    const ref = await db.collection('cashback_tokens').add(tokenData);
    await db.collection('orders').doc(dto.orderId).update({
      cashbackGenerado: true,
      cashbackTokenId: ref.id,
    });
    const qrUrl = `https://elcorazondematias.web.app/cashback?token=${ref.id}`;
    return { tokenId: ref.id, monto, qrUrl };
  }

  async procesarQr(dto: ProcesarQrDto) {
    const db = this.firebase.getDb();
    const tokenRef = db.collection('cashback_tokens').doc(dto.tokenId);
    const tokenDoc = await tokenRef.get();
    if (!tokenDoc.exists) throw new NotFoundException('QR no válido');
    const token = tokenDoc.data() as any;
    if (token.usado) throw new BadRequestException('Este QR ya fue usado');
    if (token.expiresAt.toDate() < new Date()) throw new BadRequestException('Este QR ha expirado');

    const clienteRef = db.collection('clientes').doc(dto.clienteUid);
    const clienteDoc = await clienteRef.get();
    if (!clienteDoc.exists) throw new NotFoundException('Cliente no encontrado');
    const cliente = clienteDoc.data() as any;

    await tokenRef.update({ usado: true, usadoAt: admin.firestore.Timestamp.now() });
    await clienteRef.update({
      saldoCashback: (cliente.saldoCashback || 0) + token.monto,
      totalCompras: (cliente.totalCompras || 0) + token.totalPedido,
    });
    await db.collection('movimientos_cashback').add({
      clienteUid: dto.clienteUid,
      tipo: 'cashback_qr',
      monto: token.monto,
      descripcion: 'Cashback 5% por compra confirmada',
      pedidoId: token.orderId,
      fecha: admin.firestore.Timestamp.now(),
    });
    return { success: true, monto: token.monto };
  }

  async toggleBloqueo(uid: string, bloquear: boolean, motivo?: string) {
    const db = this.firebase.getDb();
    const ref = db.collection('clientes').doc(uid);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Cliente no encontrado');
    await ref.update({
      bloqueado: bloquear,
      motivoBloqueo: motivo || '',
      fechaBloqueo: bloquear ? admin.firestore.Timestamp.now() : null,
    });
    return { uid, bloqueado: bloquear };
  }

  async eliminarCliente(uid: string) {
    const db = this.firebase.getDb();
    await db.collection('clientes').doc(uid).delete();
    const movSnapshot = await db.collection('movimientos_cashback')
      .where('clienteUid', '==', uid).get();
    const batch = db.batch();
    movSnapshot.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    return { message: `Cliente ${uid} eliminado` };
  }
}
