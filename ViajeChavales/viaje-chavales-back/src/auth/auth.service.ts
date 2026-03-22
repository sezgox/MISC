import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { jwtConfig } from 'src/core/consts/jwt-config';
import { PrismaService } from 'src/db.service';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(readonly prisma: PrismaService, readonly jwt: JwtService) {}

    async getUser(loginDto: LoginUserDto) {
        return await this.prisma.user.findUnique({
            where: { username: loginDto.username },
            include: {
                memberships: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    private async getActiveMembership(user: {
        username: string;
        activeGroupId: string | null;
        memberships: { groupId: string; userRole: UserRole }[];
    }) {
        if (!user.memberships.length) {
            return null;
        }

        const activeMembership =
            user.memberships.find((membership) => membership.groupId === user.activeGroupId) ??
            user.memberships[0];

        if (user.activeGroupId !== activeMembership.groupId) {
            await this.prisma.user.update({
                where: { username: user.username },
                data: { activeGroupId: activeMembership.groupId },
            });
        }

        return activeMembership;
    }

    async login(user: {
        username: string;
        activeGroupId: string | null;
        memberships: { groupId: string; userRole: UserRole }[];
    }): Promise<{access_token:string}> {
        const activeMembership = await this.getActiveMembership(user);
        const payload = {
            sub: user.username,
            group: activeMembership?.groupId ?? null,
            role: activeMembership?.userRole ?? null,
        };
        return  {
            access_token: await this.jwt.signAsync(payload, jwtConfig),
        };
    }
}
