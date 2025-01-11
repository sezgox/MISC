import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {

  constructor( private readonly prisma: PrismaService){}

  create(createCommentDto: CreateCommentDto) {
    return this.prisma.comment.create({data: createCommentDto});
  }

  findAll(tripId: number) {
    return this.prisma.comment.findMany({where: {tripId}})
  }

  findOne(id: number) {
    return this.prisma.comment.findUnique({where: {id}})
  }

  remove(id: number) {
    return this.prisma.comment.delete({where: {id}});
  }
}
