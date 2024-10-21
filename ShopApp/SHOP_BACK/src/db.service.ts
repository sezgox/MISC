import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
/* TODO: AGREGAR TABLA CUENTASBANCARIAS RELACION CON BusinessId y TARJETAS RELACION CON PersonalId */
/* TODO: AGREGAR INFO PAGO EN Orders y DATOS DE CUENTA EN Business */