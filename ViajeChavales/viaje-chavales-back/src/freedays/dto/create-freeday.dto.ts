import { IsDateString, IsNotEmpty } from "class-validator";

export class CreateFreedayDto {
    @IsNotEmpty()
    @IsDateString()
    startDate: Date;
    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

    username: string;
}
