import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateGroupDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(15)
    name: string;

    id: string;
}
