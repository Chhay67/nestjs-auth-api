import { IsString, Matches, MinLength } from "class-validator";



export class SignUpDto {
     @IsString()
     name: string;
     @IsString()
     username: string;

     @IsString()
     @MinLength(6)
     @Matches(/^(?=.*[0-9])/, { message: "Password must contain at least one number." })
     password: string;
}