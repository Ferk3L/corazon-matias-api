import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class ProductsService {
  private collection = 'products';

  constructor(private readonly firebase: FirebaseService) {}

  async findAll(onlyAvailable = false) {
    const db = this.firebase.getDb();
    let query: admin.firestore.Query = db.collection(this.collection);
    if (onlyAvailable) {
      query = query.where('available', '==', true);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findFeatured() {
    const db = this.firebase.getDb();
    const snapshot = await db.collection(this.collection)
      .where('available', '==', true)
      .where('featured', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const db = this.firebase.getDb();
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) throw new NotFoundException(`Producto ${id} no encontrado`);
    return { id: doc.id, ...doc.data() };
  }

  async create(dto: CreateProductDto) {
    const db = this.firebase.getDb();
    const data = {
      ...dto,
      available: dto.available ?? true,
      featured: dto.featured ?? false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };
    const ref = await db.collection(this.collection).add(data);
    return { id: ref.id, ...data };
  }

  async update(id: string, dto: UpdateProductDto) {
    const db = this.firebase.getDb();
    const ref = db.collection(this.collection).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException(`Producto ${id} no encontrado`);
    const data = { ...dto, updatedAt: admin.firestore.Timestamp.now() };
    await ref.update(data);
    return { id, ...doc.data(), ...data };
  }

  async remove(id: string) {
    const db = this.firebase.getDb();
    const ref = db.collection(this.collection).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException(`Producto ${id} no encontrado`);
    await ref.delete();
    return { message: `Producto ${id} eliminado correctamente` };
  }
}
