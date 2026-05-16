import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'example' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'example' })
  @IsString()
  description: string;

  @ApiProperty({ example: 29.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
}
