import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateGroupDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    id: string;
}
