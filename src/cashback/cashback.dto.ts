import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AjusteManualDto {
  @IsString()
  clienteUid: string;

  @IsNumber()
  monto: number;

  @IsString()
  nota: string;
}

export class GenerarTokenDto {
  @IsString()
  orderId: string;

  @IsString()
  clienteUid: string;

  @IsString()
  clienteNombre: string;

  @IsNumber()
  @Min(0)
  totalPedido: number;
}

export class ProcesarQrDto {
  @IsString()
  tokenId: string;

  @IsString()
  clienteUid: string;
}
