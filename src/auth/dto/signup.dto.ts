import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength } from "class-validator";



export class SignUpDto {
     @ApiProperty({required:true})
     @IsString()
     name: string;

     @ApiProperty({required:true})
     @IsString()
     username: string;

     @ApiProperty({required:true})
     @IsString()
     @MinLength(6)
     @Matches(/^(?=.*[0-9])/, { message: "Password must contain at least one number." })
     password: string;
}