import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMayoreo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMenudeo?: number;

  @IsString()
  image: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMayoreo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMenudeo?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}
