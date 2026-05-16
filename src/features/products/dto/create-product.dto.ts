import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'NestJS Course' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Beginner friendly API development course' })
  @IsString()
  description: string;

  @ApiProperty({ example: 29.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
}
