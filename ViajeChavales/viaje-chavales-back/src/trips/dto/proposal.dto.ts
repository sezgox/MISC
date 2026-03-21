import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProposalStatus, ProposalType } from '@prisma/client';

export class AccommodationProposalObjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  place: string;

  @IsInt()
  @Min(1)
  nights: number;

  @IsInt()
  @IsPositive()
  pricePerPersonCents: number;

  @IsOptional()
  @IsUrl()
  referenceLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}

export class TransportProposalObjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsInt()
  @IsPositive()
  pricePerPersonCents: number;

  @IsOptional()
  @IsUrl()
  referenceLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}

export class VisitProposalObjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsDateString()
  scheduledAt: Date;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsInt()
  @IsPositive()
  pricePerPersonCents: number;

  @IsOptional()
  @IsUrl()
  referenceLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}

export class CreateProposalDto {
  @IsEnum(ProposalType)
  type: ProposalType;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => AccommodationProposalObjectDto)
  accommodationItems?: AccommodationProposalObjectDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => TransportProposalObjectDto)
  transportItems?: TransportProposalObjectDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => VisitProposalObjectDto)
  visitItems?: VisitProposalObjectDto[];
}

export class UpdateProposalStatusDto {
  @IsEnum(ProposalStatus)
  status: ProposalStatus;
}
