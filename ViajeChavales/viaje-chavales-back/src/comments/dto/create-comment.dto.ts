import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreateCommentDto {

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  tripId: number;
  
  @IsNotEmpty()
  @MaxLength(300)
  comment: string;
}
