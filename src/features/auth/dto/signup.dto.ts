import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({ required: true, example: 'example' })
  @IsString()
  name: string;

  @ApiProperty({ required: true, example: 'example' })
  @IsString()
  username: string;

  @ApiProperty({ required: true, minLength: 6, example: 'example' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number.',
  })
  password: string;
}
