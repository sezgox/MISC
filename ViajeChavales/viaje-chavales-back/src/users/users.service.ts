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
        profilePicture: 'https://media-mad2-1.cdn.whatsapp.net/v/t61.24694-24/417289047_1463790427861641_1498029723449488746_n.jpg?ccb=11-4&oh=01_Q5AaIBXmZAuYd0l6SMX8mcpoWd1UtOre_tIx3G83A5kMA99O&oe=676EB287&_nc_sid=5e03e0&_nc_cat=106'
    },
    {
        username: 'Raxfetaminas',
        password: 'cocaineforbreakfast',
        profilePicture: 'https://c.files.bbci.co.uk/8F13/production/_90172663_thinkstockphotos-537817268.jpg'
    },
    {
        username: 'Kike',
        password: 'allakyakbar',
        profilePicture: 'https://media-mad2-1.cdn.whatsapp.net/v/t61.24694-24/409827818_895248568639848_1590322172954686032_n.jpg?ccb=11-4&oh=01_Q5AaIM1uABAIHxOgBOgyoyL0wP7duCxc_FokQ-hd03Qr7WJB&oe=676EBE10&_nc_sid=5e03e0&_nc_cat=108'
    },
    {
        username: 'TodoAlRojo',
        password: 'ludopata123',
        profilePicture: 'https://media-mad2-1.cdn.whatsapp.net/v/t61.24694-24/417010648_387932997170253_8544245996261314115_n.jpg?ccb=11-4&oh=01_Q5AaIDZA_j9erwPYzcS9Fyj6zqwrBKti4E6kukQdYKrBR57x&oe=676EA051&_nc_sid=5e03e0&_nc_cat=106'

    },
    {
        username: 'CarlosMasSexo',
        password: 'hijueputa',
        profilePicture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'

    },
    {
        username: 'YoNoVoyPeroObservo',
        password: 'klkmanin2000',
        profilePicture: 'https://media-mad2-1.cdn.whatsapp.net/v/t61.24694-24/467907407_915779783854903_6966489117153120458_n.jpg?ccb=11-4&oh=01_Q5AaIAC52EwYFXQZ82g7MyvqAUvG03D_32rQ97sRHfrFAyzI&oe=676E9263&_nc_sid=5e03e0&_nc_cat=105'
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
