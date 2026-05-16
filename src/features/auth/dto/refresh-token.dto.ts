import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    required: true,
    description: 'Paste the refreshToken value from login or refresh response. Bearer prefix is also accepted.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-refresh-token',
  })
  @IsString()
  refreshToken: string;
}
