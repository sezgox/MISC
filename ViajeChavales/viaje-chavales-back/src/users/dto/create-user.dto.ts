import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";


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
    @MaxLength(15)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    password: string;

    @IsString()
    @IsNotEmpty()
    profilePicture: string;
    
    @IsString()
    @IsNotEmpty()
    groupId: string;

}
