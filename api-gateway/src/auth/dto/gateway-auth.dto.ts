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

export class GatewayUpdateNameDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre!: string;
}

export class GatewayUpdatePasswordDto {
  @IsString()
  @MinLength(6, { message: 'La contraseña actual debe tener al menos 6 caracteres' })
  currentPassword!: string;

  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword!: string;
}