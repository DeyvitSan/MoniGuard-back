import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';

export class CreateBitacoraDto {
  @IsString()
  @MinLength(3, { message: 'El destino es requerido' })
  destino!: string;

  @IsNumber()
  destinoLat!: number;

  @IsNumber()
  destinoLng!: number;

  @IsString()
  @MinLength(5, { message: 'El texto debe tener al menos 5 caracteres' })
  texto!: string;

  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @IsOptional()
  @IsNumber()
  humedad?: number;

  @IsOptional()
  @IsNumber()
  precipitacion?: number;
}