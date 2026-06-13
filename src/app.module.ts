import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CashbackModule } from './cashback/cashback.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Cargar variables de entorno desde .env
    ConfigModule.forRoot({ isGlobal: true }),
    // Firebase (global — disponible en todos los módulos)
    FirebaseModule,
    // Módulos de funcionalidades
    ProductsModule,
    OrdersModule,
    CashbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
