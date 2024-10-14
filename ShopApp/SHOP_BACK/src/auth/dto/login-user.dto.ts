import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";


export class LoginUserDto{

    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

}