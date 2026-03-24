import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
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
    const newStart = newFreeDays.startDate.getTime();
    const newEnd = newFreeDays.endDate.getTime();
    const todayTime = today.getTime();

    if (newStart > newEnd || newStart < todayTime) {
      return true;
    }
    for (const freeday of freedaysAvailable) {
      const freeStart = freeday.startDate.getTime();
      const freeEnd = freeday.endDate.getTime();

      if (newStart === freeStart || newEnd === freeEnd) {
        return true;
      } else if (newStart < freeStart && newEnd > freeEnd) {
        return true;
      } else if (newStart > freeStart && newEnd < freeEnd) {
        return true;
      } else if (newStart > freeStart && newStart < freeEnd) {
        return true;
      } else if (newEnd > freeStart && newEnd < freeEnd) {
        return true;
      }
    }
    return false;
  }

  getToday(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  @Post()
  async create(
    @Body() createFreedayDto: CreateFreedayDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<HttpResponse<Freeday>>> {
    createFreedayDto.username = req['user'].sub;
    createFreedayDto.startDate = new Date(createFreedayDto.startDate);
    createFreedayDto.endDate = new Date(createFreedayDto.endDate);

    const freedaysAvailable = await this.freedaysService.findAll(createFreedayDto.username);
    if (freedaysAvailable.length >= 4) {
      return res
        .status(403)
        .json(
          new ForbiddenException(
            'No puedes tener mas de 4 periodos de dias libres. Elimina uno para crear un nuevo.',
          ),
        );
    }
    if (this.unvalidDates(freedaysAvailable, createFreedayDto)) {
      res.status(400);
      return res.json(new BadRequestException('Ya hay otro periodo con esos dias libres en uso'));
    }

    res.status(201);
    return res.json(await this.freedaysService.create(createFreedayDto));
  }

  @Get()
  async findAll(@Query('username') username: string, @Req() req: Request): Promise<HttpResponse<Freeday[]>> {
    const groupId = req['user'].group ?? undefined;
    const fallbackUsername = !groupId && !username ? req['user'].sub : username;

    return await this.freedaysService.findAll(fallbackUsername, groupId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HttpResponse<Freeday>> {
    return await this.freedaysService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFreedayDto: UpdateFreedayDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<HttpResponse<Freeday>>> {
    const freeday = await this.freedaysService.findOne(+id);
    if (!freeday || freeday.username !== req['user'].sub) {
      res.status(401);
      return res.json(new UnauthorizedException('User trying to change a freeday is not them'));
    }

    const allFreedaysAvailable = await this.freedaysService.findAll(freeday.username);
    const freedaysAvailableWithoutNew = allFreedaysAvailable.filter((item) => item.id !== +id);

    if (!updateFreedayDto.startDate) {
      updateFreedayDto.startDate = freeday.startDate;
    }
    if (!updateFreedayDto.endDate) {
      updateFreedayDto.endDate = freeday.endDate;
    }

    updateFreedayDto.startDate = new Date(updateFreedayDto.startDate);
    updateFreedayDto.endDate = new Date(updateFreedayDto.endDate);
    if (this.unvalidDates(freedaysAvailableWithoutNew, updateFreedayDto)) {
      res.status(400);
      return res.json(new BadRequestException('Ya hay otro periodo con esos dias libres en uso'));
    }

    return res.json(await this.freedaysService.update(+id, updateFreedayDto));
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const freeday = await this.freedaysService.findOne(+id);
    if (!freeday || freeday.username !== req['user'].sub) {
      res.status(401);
      return res.json(new UnauthorizedException('User trying to remove a freeday is not them'));
    }

    return res.json(await this.freedaysService.remove(+id));
  }
}
