import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class OrdersService {
  private collection = 'orders';

  constructor(private readonly firebase: FirebaseService) {}

  async findAll() {
    const db = this.firebase.getDb();
    const snapshot = await db.collection(this.collection)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const db = this.firebase.getDb();
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Pedido ${id} no encontrado`);
    return { id: doc.id, ...doc.data() };
  }

  async findByClient(clienteUid: string) {
    const db = this.firebase.getDb();
    const snapshot = await db.collection(this.collection)
      .where('clienteUid', '==', clienteUid)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getStats() {
    const db = this.firebase.getDb();
    const snapshot = await db.collection(this.collection).get();
    const orders = snapshot.docs.map(d => d.data());
    return {
      total: orders.length,
      pending: orders.filter(o => o['status'] === 'pending').length,
      confirmed: orders.filter(o => o['status'] === 'confirmed').length,
      completed: orders.filter(o => o['status'] === 'completed').length,
      cancelled: orders.filter(o => o['status'] === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o['status'] === 'completed')
        .reduce((sum, o) => sum + (o['total'] || 0), 0),
    };
  }

  async create(dto: CreateOrderDto) {
    const db = this.firebase.getDb();
    const data = {
      ...dto,
      status: 'pending',
      cashbackGenerado: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };
    const ref = await db.collection(this.collection).add(data);
    return { id: ref.id, ...data };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const db = this.firebase.getDb();
    const ref = db.collection(this.collection).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException(`Pedido ${id} no encontrado`);
    await ref.update({
      status: dto.status,
      updatedAt: admin.firestore.Timestamp.now(),
    });
    return { id, ...doc.data(), status: dto.status };
  }
}
