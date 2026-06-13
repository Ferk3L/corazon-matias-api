import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'Corazón de Matías API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        products: '/api/v1/products',
        orders: '/api/v1/orders',
        cashback: '/api/v1/cashback',
      }
    };
  }
}
