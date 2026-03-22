import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db.service';

@Injectable()
export class GroupsService {

  constructor(private prisma: PrismaService) {}

  async create(id: string, name: string) {
    return this.prisma.group.create({data:{id, name}});
  }

  findOne(id: string) {
    return this.prisma.group.findUnique({where: {id}});
  }

  async findInvitePreview(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        members: {
          select: {
            userRole: true,
            user: {
              select: {
                username: true,
                profilePicture: true,
              },
            },
          },
          orderBy: [{ userRole: 'desc' }, { userId: 'asc' }],
        },
      },
    });

    if (!group) {
      return null;
    }

    return {
      id: group.id,
      name: group.name,
      createdAt: group.createdAt,
      members: group.members.map((member) => ({
        username: member.user.username,
        profilePicture: member.user.profilePicture,
        userRole: member.userRole,
      })),
    };
  }

  update(id: number, username: string) {
    return `This action updates a #${id} group`;
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
}
