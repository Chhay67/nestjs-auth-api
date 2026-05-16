import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ required: true, example: 'Kim Chhay' })
  @IsString()
  name: string;

  @ApiProperty({ required: true, example: 'kimchhay' })
  @IsString()
  username: string;

  @ApiProperty({ required: true, minLength: 6, example: 'secret1' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number.',
  })
  password: string;
}
