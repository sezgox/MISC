import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ensureApprovedUser,
  ensureTripParticipantOrPlanner,
  ensureTripPlanning,
  getTripOrThrow,
} from 'src/core/utils/trip-domain';
import { PrismaService } from 'src/db.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(username: string, createCommentDto: CreateCommentDto) {
    await ensureApprovedUser(this.prisma, username);
    const trip = await getTripOrThrow(this.prisma, createCommentDto.tripId);
    ensureTripPlanning(trip);
    ensureTripParticipantOrPlanner(trip, username);

    return this.prisma.comment.create({
      data: {
        tripId: createCommentDto.tripId,
        userId: username,
        comment: createCommentDto.comment,
      },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  async findAll(tripId: number, username: string) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    ensureTripParticipantOrPlanner(trip, username);

    return this.prisma.comment.findMany({
      where: { tripId },
      include: {
        user: {
          select: {
            username: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async remove(id: number, username: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    ensureTripPlanning(comment.trip);

    if (comment.userId !== username) {
      throw new ForbiddenException('Only the comment author can delete it');
    }

    return this.prisma.comment.delete({ where: { id } });
  }
}
