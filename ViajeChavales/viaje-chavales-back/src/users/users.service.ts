import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/db.service';
import { UpdateUserDto } from './dto/update-user.dto';



@Injectable()
export class UsersService {

  constructor(private readonly prisma: PrismaService){}

  private defaultUsers = [
    {
        username: 'PapiPolvaso',
        password: 'papipolvaso10',
        profilePicture: 'https://drive.google.com/thumbnail?id=1zpwc2XGPcraBEqHUKMmQdGX9SFQ9hvKz&sz=w2400'
    },
    {
        username: 'Raxfetaminas',
        password: 'cocaineforbreakfast',
        profilePicture: 'https://drive.google.com/thumbnail?id=1xq7bVmJZHixN4EV_DOkapKM17HAlB_ZV&sz=w2400'
    },
    {
        username: 'Kike',
        password: 'allakyakbar',
        profilePicture: 'https://drive.google.com/thumbnail?id=1bh2OuBxKpN5AtAeEFqvlGQR0Fdg3c2XC&sz=w2400'
    },
    {
        username: 'TodoAlRojo',
        password: 'ludopata123',
        profilePicture: 'https://drive.google.com/thumbnail?id=1ymq-ud1rNliFvVld9lVViSAfG6DEBmbX&sz=w2400'

    },
    {
        username: 'CarlosMasSexo',
        password: 'hijueputa',
        profilePicture: 'https://drive.google.com/thumbnail?id=1ThxOObA12XMAXiMUqhZe_EPfktJHH5Rn&sz=w2400'

    },
    {
        username: 'YoNoVoyPeroObservo',
        password: 'klkmanin2000',
        profilePicture: 'https://drive.google.com/thumbnail?id=1Y405lcsR_F6vetm9DFZLIKxYTAVBfRQS&sz=w2400'
    }
  ];

  async create() {
    this.defaultUsers.map(async (user) => {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: user.username },
      });
      if (!existingUser) {
        const saltOrRounds = 10;
        const password = user.password;
        const hash = await bcrypt.hash(password, saltOrRounds);
        user.password = hash;
        await this.prisma.user.create({
          data: user,
        });
        console.log(`Created user: ${user.username}`);
      }
    })
    return await this.findAll();
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(username: string) {
    return await this.prisma.user.findUnique({where: {username}});
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(username: string): Promise<any> {
    try{
      await this.prisma.user.delete({
        where: { username },
      });
      return Promise.resolve(`User ${username} deleted`);
    }catch{
      return Promise.resolve(`User ${username} not found`);
    }
  }
}
