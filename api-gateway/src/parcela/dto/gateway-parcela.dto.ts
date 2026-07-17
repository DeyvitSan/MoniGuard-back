// api-gateway/src/parcela/dto/gateway-parcela.dto.ts
import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';

export class CreateParcelaDto {
  @IsString()
  @MinLength(3, { message: 'El nombre de la parcela es requerido' })
  nombre!: string;

  @IsString()
  @MinLength(3, { message: 'La ubicación es requerida' })
  ubicacion!: string;

  @IsNumber()
  hectareas!: number;

  @IsOptional()
  @IsString()
  cultivo?: string;

  @IsOptional()
  @IsNumber()
  destinoLat?: number;

  @IsOptional()
  @IsNumber()
  destinoLng?: number;
}