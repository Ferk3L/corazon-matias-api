import { IsString, IsNumber, IsOptional, Min, IsEmail } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  product: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(0)
  total: number;

  @IsString()
  @IsOptional()
  clienteUid?: string;

  @IsString()
  @IsOptional()
  clienteNombre?: string;
}

export class UpdateOrderStatusDto {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
