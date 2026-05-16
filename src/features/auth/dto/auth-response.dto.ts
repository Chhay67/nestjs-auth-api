import { ApiProperty } from '@nestjs/swagger';

export class TokenPairDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-access-token',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-refresh-token',
  })
  refreshToken: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: '665f1f7d0f4f3a6a9a111111' })
  id: string;

  @ApiProperty({ example: 'example' })
  username: string;

  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ type: TokenPairDto })
  tokens: TokenPairDto;
}

export class RefreshTokenResponseDto extends TokenPairDto { }

export class UserProfileResponseDto {
  @ApiProperty({ example: '665f1f7d0f4f3a6a9a111111' })
  id: string;

  @ApiProperty({ example: 'example' })
  username: string;

  @ApiProperty({ example: 'example' })
  name: string;
}
