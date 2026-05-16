import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ required: true, example: 'example' })
  @IsString()
  username: string;

  @ApiProperty({ required: true, minLength: 6, example: 'example' })
  @IsString()
  @MinLength(6)
  password: string;
}
