import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { TripsService } from 'src/trips/trips.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService, private readonly tripsService: TripsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req: Request, @Res() res: Response, ) {
    const username = req['user'].sub;
    if(username !== createCommentDto.userId){
      res.status(401);
      return res.json(new UnauthorizedException('No puedes crear comentarios para otros usuarios...'));
    }
    const trip = await this.tripsService.findOne(createCommentDto.tripId);
    if(!trip){
      res.status(400);
      return res.json(new BadRequestException('El viaje al que intentas comentar no existe...'));
    }
    const comment = await this.commentsService.create(createCommentDto);
    return res.status(201).json(comment);
  }

  @Get(':tripId')
  async findAll(@Req() req: Request, @Res() res: Response, @Param('tripId') tripId: string) {
    const trip = await this.tripsService.findOne(+tripId);
    if(!trip){
      res.status(400);
      return res.json(new BadRequestException('El viaje no existe...'));
    }else{
      const comments = await this.commentsService.findAll(+tripId);
      return res.json(comments);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response,) {
    const username = req['user'].sub;
    const comment = await this.commentsService.findOne(+id);
    if(!comment || comment.userId !== username){
      res.status(400);
      return res.json(new BadRequestException('No puedes borrar este comentario...'));
    }else{
      return this.commentsService.remove(+id);
    }
  }
}
