import { IsString, IsNumber, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateBitacoraDto {
  @IsString()
  destino!: string;

  @IsNumber()
  destinoLat!: number;

  @IsNumber()
  destinoLng!: number;

  @IsOptional()
  @IsString()
  texto?: string;

  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @IsOptional()
  @IsNumber()
  humedad?: number;

  @IsOptional()
  @IsNumber()
  precipitacion?: number;

  @IsOptional()
  @IsDateString()
  fechaObservacion?: string;

  @IsOptional()
  @IsIn(['sin_sintomas', 'manchas_leves', 'manchas_extendidas', 'pudricion_visible'])
  estadoMazorca?: string;
}