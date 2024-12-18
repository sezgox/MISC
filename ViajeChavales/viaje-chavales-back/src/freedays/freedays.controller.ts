import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpResponse } from 'src/core/interfaces/response';
import { CreateFreedayDto } from './dto/create-freeday.dto';
import { UpdateFreedayDto } from './dto/update-freeday.dto';
import { Freeday } from './entities/freeday.entity';
import { FreedaysService } from './freedays.service';

@Controller('freedays')
export class FreedaysController {
  constructor(private readonly freedaysService: FreedaysService) {}

    unvalidDates(freedaysAvailable: Freeday[], newFreeDays: CreateFreedayDto | UpdateFreedayDto): boolean {
      const today = this.getToday();

      if(newFreeDays.startDate > newFreeDays.endDate || newFreeDays.startDate < today){
        return true;
      }
      for(let freeday of freedaysAvailable){
        if(freeday.startDate == newFreeDays.startDate || freeday.endDate == newFreeDays.endDate){
          return true;
        }else if(newFreeDays.startDate < freeday.startDate && newFreeDays.endDate > freeday.endDate){
          return true;
        }else if(newFreeDays.startDate > freeday.startDate && newFreeDays.endDate < freeday.endDate ){
          return true;
        }else if(newFreeDays.startDate > freeday.startDate && newFreeDays.startDate < freeday.endDate){
          return true;
        }else if(newFreeDays.endDate > freeday.startDate && newFreeDays.endDate < freeday.endDate){
          return true;
        }
      }
      return false;
    }

    getToday(): Date{
      const date = new Date();
      date.setHours(0,0,0,0);
      return date;
    }

  @Post()
  async create(@Body() createFreedayDto: CreateFreedayDto, @Req() req: Request, @Res() res: Response): Promise<Response<HttpResponse<Freeday>>> {
    createFreedayDto.username = req['user'].sub;
    createFreedayDto.startDate = new Date(createFreedayDto.startDate);
    createFreedayDto.endDate = new Date(createFreedayDto.endDate);
    
    const freedaysAvailable = await this.freedaysService.findAll(createFreedayDto.username);
    if(this.unvalidDates(freedaysAvailable, createFreedayDto)){
      res.status(400);
      return res.json(new BadRequestException('Dates already in use'));
    }else{
      res.status(201);
      return res.json(await this.freedaysService.create(createFreedayDto));
    }
    
  }

  @Get()
  async findAll(@Query('username') username: string): Promise<HttpResponse<Freeday[]>> {
    return await this.freedaysService.findAll(username);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HttpResponse<Freeday>> {
    return await this.freedaysService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFreedayDto: UpdateFreedayDto, @Req() req: Request, @Res() res: Response): Promise<Response<HttpResponse<Freeday>>> {
    const freeday = await this.freedaysService.findOne(+id);
    if(freeday.username !== req['user'].sub){
      res.status(401);
      return res.json(new UnauthorizedException('User trying to change a freeday is not them'));
    }else{
      const allFreedaysAvailable = await this.freedaysService.findAll(freeday.username);
      const freedaysAvailableWithoutNew = allFreedaysAvailable.filter(freeday => freeday.id != +id);
      if(!updateFreedayDto.startDate) {
        updateFreedayDto.startDate = freeday.startDate;
      }
      if(!updateFreedayDto.endDate) {
        updateFreedayDto.endDate = freeday.endDate;
      }
      updateFreedayDto.startDate = new Date(updateFreedayDto.startDate);
      updateFreedayDto.endDate = new Date(updateFreedayDto.endDate);
      if(this.unvalidDates(freedaysAvailableWithoutNew, updateFreedayDto)){
        res.status(400);
        return res.json(new BadRequestException('Dates already in use'));
      }else{
        return res.json(await this.freedaysService.update(+id, updateFreedayDto));
      }
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const freeday = await this.freedaysService.findOne(+id);
    if(freeday.username !== req['user'].sub){
      res.status(401);
      return res.json(new UnauthorizedException('User trying to remove a freeday is not them'));
    }else{
      return res.json(await this.freedaysService.remove(+id));
    }
  }
}
