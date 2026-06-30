import { IsEmail, IsString, MinLength } from 'class-validator';

export class GatewayLoginDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}

export class GatewayRegisterDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}