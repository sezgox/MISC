import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateTripDto {

    userId: string;

    @IsNotEmpty()
    @IsString()
    destination: string;

    @IsPositive()
    @IsOptional()
    @IsInt()
    duration?: number;

    @IsPositive()
    @IsOptional()
    @IsInt()
    price?: number;

    @IsNotEmpty()
    @IsDateString()
    startDate: Date;
    @IsNotEmpty()
    @IsDateString()
    endDate: Date;
}
