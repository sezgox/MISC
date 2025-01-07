import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Freeday } from 'src/freedays/entities/freeday.entity';
import { FreedaysService } from 'src/freedays/freedays.service';
import { ParticipantsService } from 'src/participants/participants.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService, private readonly freedaysService: FreedaysService, private readonly participantsService: ParticipantsService) {}

  datesAreAvailable(trip: CreateTripDto | UpdateTripDto, userFreedays: Freeday[]){
    for(let freedays of userFreedays){
      console.log(trip.startDate >= freedays.startDate)
      if(trip.startDate >= freedays.startDate && trip.endDate <= freedays.endDate){
        return true;
      }
    }
    return false
  }

  datesAreValid(trip: CreateTripDto | UpdateTripDto){
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if(trip.startDate < trip.endDate && trip.startDate > today){
      return true;
    }
    return false;
  }

  @Post()
  async create(@Body() createTripDto: CreateTripDto, @Res() res: Response, @Req() req: Request): Promise<Response> {
    const userFreedays = await this.freedaysService.findAll(createTripDto.userId);

    createTripDto.startDate = new Date(createTripDto.startDate);
    createTripDto.endDate = new Date(createTripDto.endDate);
    createTripDto.destination = createTripDto.destination.trimEnd().trimStart();


    if(this.datesAreValid(createTripDto) && this.datesAreAvailable(createTripDto, userFreedays)){
      createTripDto.userId = req['user'].sub;
      const allTrips = await this.tripsService.findAll();
      const userTrips =  allTrips.filter(trip => trip.userId === createTripDto.userId);
      let destinationOnUse = allTrips.find(trip => trip.destination === createTripDto.destination);
      if(destinationOnUse){
        return res.status(400).json(new BadRequestException(`Ya existe un viaje con destino ${createTripDto.destination}.`));
      }else{
        const tripCreated = await this.tripsService.create(createTripDto)
        .then(trip => this.participantsService.create(trip.id, createTripDto.userId));
      return userTrips.length <= 4 ? res.json(tripCreated) : res.status(400).json(new BadRequestException('No puedes tener más de 4 viajes propuestos'));
      }
    }else{
      res.status(400);
      return res.json(new BadRequestException('Fechas inválidas. Solo puedes proponer viajes en tus períodos de días libres'));
    }
  }

  @Get()
  async findAll(@Query('username') username: string) {
    return await this.tripsService.findAll(username);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tripsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto, @Req() req: Request, @Res() res: Response) {
    const trip = await this.tripsService.findOne(+id);
    if(trip.userId !== req['user'].sub){
      res.status(401);
      return res.json(new UnauthorizedException('User trying to change a trip is not them'));
    }else{
      if(!updateTripDto.startDate){
        updateTripDto.startDate = trip.startDate;
      }
      if(!updateTripDto.endDate){
        updateTripDto.endDate = trip.endDate;
      }
      updateTripDto.startDate = new Date(updateTripDto.startDate);
      updateTripDto.endDate = new Date(updateTripDto.endDate);
      const userFreedays = await this.freedaysService.findAll(trip.userId);
      if(this.datesAreValid(updateTripDto) && this.datesAreAvailable(updateTripDto, userFreedays)){
        return res.json(await this.tripsService.update(+id, updateTripDto));
      }else{
        res.status(400);
        return res.json(new BadRequestException('Dates invalid'));
      }
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const trip = await this.tripsService.findOne(+id);
    if(trip.userId !== req['user'].sub){
      res.status(401);
      return res.json(new UnauthorizedException('User trying to change a trip is not them'));
    }else{
      return res.json(await this.tripsService.remove(+id));
    }
  }
}
