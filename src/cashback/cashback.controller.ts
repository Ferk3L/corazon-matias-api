import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CashbackService } from './cashback.service';
import { AjusteManualDto, GenerarTokenDto, ProcesarQrDto } from './cashback.dto';

@Controller('cashback')
export class CashbackController {
  constructor(private readonly cashbackService: CashbackService) {}

  // GET /api/v1/cashback/clientes
  @Get('clientes')
  getTodosLosClientes() {
    return this.cashbackService.getTodosLosClientes();
  }

  // GET /api/v1/cashback/clientes/:uid
  @Get('clientes/:uid')
  getCliente(@Param('uid') uid: string) {
    return this.cashbackService.getCliente(uid);
  }

  // GET /api/v1/cashback/historial/:uid
  @Get('historial/:uid')
  getHistorial(@Param('uid') uid: string) {
    return this.cashbackService.getHistorial(uid);
  }

  // POST /api/v1/cashback/ajuste
  @Post('ajuste')
  ajusteManual(@Body() dto: AjusteManualDto) {
    return this.cashbackService.ajusteManual(dto);
  }

  // POST /api/v1/cashback/generar-token
  @Post('generar-token')
  generarToken(@Body() dto: GenerarTokenDto) {
    return this.cashbackService.generarToken(dto);
  }

  // POST /api/v1/cashback/procesar-qr
  @Post('procesar-qr')
  procesarQr(@Body() dto: ProcesarQrDto) {
    return this.cashbackService.procesarQr(dto);
  }

  // PATCH /api/v1/cashback/clientes/:uid/bloqueo
  @Patch('clientes/:uid/bloqueo')
  toggleBloqueo(
    @Param('uid') uid: string,
    @Body() body: { bloquear: boolean; motivo?: string }
  ) {
    return this.cashbackService.toggleBloqueo(uid, body.bloquear, body.motivo);
  }

  // DELETE /api/v1/cashback/clientes/:uid
  @Delete('clientes/:uid')
  eliminarCliente(@Param('uid') uid: string) {
    return this.cashbackService.eliminarCliente(uid);
  }
}
