import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { TripsService } from 'src/trips/trips.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ParticipantsService } from './participants.service';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService, private readonly tripsService: TripsService) {}

  @Post()
  async create(@Body() createParticipantDto: CreateParticipantDto, @Req() req: Request, @Res() res: Response) {
    const username = req['user'].sub;
    if(username !== createParticipantDto.userId){
      res.status(401);
      return res.json(new UnauthorizedException('User trying to put a participant is not them'));
    }
    const trip = await this.tripsService.findOne(createParticipantDto.tripId);
    if(trip){
      res.status(201);
      return res.json(await this.participantsService.create(createParticipantDto.tripId, username));
    }else{
      res.status(400);
      return res.json(new BadRequestException('Trip does not exist'));
    }
  }

  @Get()
  async findAll(@Query('tripId') tripId: number, @Res() res: Response) {
    const trip = await this.tripsService.findOne(+tripId);
    if(!trip){
      return res.status(400).json(new BadRequestException('Trip does not exist'));
    }
    return res.json(await this.participantsService.findAll(+tripId));
  }

  @Delete(':tripId')
  async remove(@Param('tripId') tripId: string, @Query('userId') userId: string, @Req() req: Request, @Res() res: Response) {
    const username = req['user'].sub;
    if(username !== userId){
      res.status(401);
      return res.json(new UnauthorizedException('User trying to delete from a trip a participant is not them'));
    }
    const trip = await this.tripsService.findOne(+tripId);
    if(!trip){
      res.status(400);
      return res.json(new BadRequestException('Trip does not exist'));
    }
    return res.json(await this.participantsService.remove(username,+tripId));
  }
}
