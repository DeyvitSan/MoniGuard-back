import { IsOptional, IsString, MinLength } from 'class-validator';

// PATCH = actualización parcial: por ahora solo se permite editar el
// nombre, así que es el único campo. Si más adelante se permite editar
// más datos, se agregan aquí como opcionales también.
export class GatewayPatchProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string;
}
