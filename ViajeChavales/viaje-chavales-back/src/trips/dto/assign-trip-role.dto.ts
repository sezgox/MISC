import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TripRole } from '@prisma/client';

export class AssignTripRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(TripRole)
  role: TripRole;
}
