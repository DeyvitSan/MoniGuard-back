import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

// Política de contraseña unificada con el front (AppValidators.password en
// Flutter): mínimo 8 caracteres, al menos una mayúscula, una minúscula y un
// número. Se aplica aquí (no solo en el cliente) porque la validación de
// cliente nunca es suficiente por sí sola.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const PASSWORD_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula y número';

export class GatewayLoginDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  // En login NO se valida complejidad — solo que no venga vacío. Exigir la
  // política nueva aquí rompería el login de cuentas ya existentes con
  // contraseñas creadas bajo la regla antigua.
  @IsString()
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  password!: string;
}

export class GatewayRegisterDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;
}

export class GatewayUpdateNameDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre!: string;
}

export class GatewayUpdatePasswordDto {
  @IsString()
  @MinLength(1, { message: 'La contraseña actual es obligatoria' })
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword!: string;
}