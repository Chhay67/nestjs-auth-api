import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength,  } from "class-validator";



export class LoginDto{
     @ApiProperty({required:true})
     @IsString()
     username: string;

     @ApiProperty({required:true})
     @IsString()
     @MinLength(6)
     password : string;
}