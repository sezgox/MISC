import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import countryNames from "../../client/country/country.enum"


enum UserRoles {
    PERSONAL = 'PERSONAL',
    BUSINESS = 'BUSINESS',
  }

interface PersonalUserDto{
  firstName
  lastName
}

interface BusinessUserDto{
  businessName
  country
}

export class CreateUserDto implements BusinessUserDto, PersonalUserDto{

    @ValidateIf(o => o.role === UserRoles.BUSINESS)
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    businessName: string;

    @ValidateIf(o => o.role === UserRoles.BUSINESS)
    @IsIn(countryNames)
    country: string;
    
    @ValidateIf(o => o.role === UserRoles.PERSONAL)
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    @IsNotEmpty()
    firstName: string;

    @ValidateIf(o => o.role === UserRoles.PERSONAL)
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsEnum(UserRoles, { message: 'Role must be either PERSONAL or BUSINESS' }) // Valida que el role sea uno de los valores del enum
    role: UserRoles;
}

