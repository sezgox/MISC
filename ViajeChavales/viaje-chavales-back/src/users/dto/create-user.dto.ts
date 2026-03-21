import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
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
