import { IsNotEmpty, IsString, MinLength } from "class-validator";


export class CreateUserDto {
/*
    username String @id
    password String
    profilePicture String
    trips Trip[]
    comments Comment[]
    freeDays FreeDays[]
    participates Participant[]
    group Group @relation(fields: [groupId], references: [id])
    groupId String
*/

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    @IsNotEmpty()
    profilePicture: string;
    
    @IsString()
    @IsNotEmpty()
    groupId: string;

}
