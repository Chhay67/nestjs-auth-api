import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: '665f25a50f4f3a6a9a222222' })
  id: string;

  @ApiProperty({ example: 'example' })
  name: string;

  @ApiProperty({ example: 'example' })
  description: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: '2026-05-16T04:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-16T04:00:00.000Z' })
  updatedAt: Date;
}
