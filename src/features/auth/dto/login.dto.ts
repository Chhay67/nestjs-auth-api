import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ required: true, example: 'kimchhay' })
  @IsString()
  username: string;

  @ApiProperty({ required: true, minLength: 6, example: 'secret1' })
  @IsString()
  @MinLength(6)
  password: string;
}
