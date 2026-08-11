import { plainToInstance } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  validateSync,
} from 'class-validator'

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment

  @IsNotEmpty()
  MONGODB_URI!: string

  @IsNumberString()
  @IsOptional()
  PORT?: string

  @IsNotEmpty()
  CORS_ORIGIN!: string
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validated, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(`Invalid environment variables:\n${errors.toString()}`)
  }

  return validated
}
