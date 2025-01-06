import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateParticipantDto {
    @IsNotEmpty()
    @IsNumber()
    tripId: number;

    @IsNotEmpty()
    @IsString()
    userId: string;
}
