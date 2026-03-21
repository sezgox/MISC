import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req: Request) {
    return this.commentsService.create(req['user'].sub, createCommentDto);
  }

  @Get(':tripId')
  async findAll(@Param('tripId') tripId: string, @Req() req: Request) {
    return this.commentsService.findAll(+tripId, req['user'].sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.commentsService.remove(+id, req['user'].sub);
  }
}
