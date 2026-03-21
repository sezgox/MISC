import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ParticipantsService } from './participants.service';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  async create(@Body() createParticipantDto: CreateParticipantDto, @Req() req: Request) {
    if (req['user'].sub !== createParticipantDto.userId) {
      throw new BadRequestException('Users can only join trips for themselves');
    }

    return this.participantsService.create(createParticipantDto.tripId, req['user'].sub);
  }

  @Get()
  async findAll(@Query('tripId') tripId: string) {
    return this.participantsService.findAll(+tripId);
  }

  @Delete(':tripId')
  async remove(@Param('tripId') tripId: string, @Query('userId') userId: string, @Req() req: Request) {
    if (req['user'].sub !== userId) {
      throw new BadRequestException('Users can only leave trips for themselves');
    }

    return this.participantsService.remove(req['user'].sub, +tripId);
  }
}
