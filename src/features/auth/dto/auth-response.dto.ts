import { ApiProperty } from '@nestjs/swagger';

export class TokenPairDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class LoginResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: TokenPairDto })
  tokens: TokenPairDto;
}

export class RefreshTokenResponseDto extends TokenPairDto {}

export class UserProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  name: string;
}
