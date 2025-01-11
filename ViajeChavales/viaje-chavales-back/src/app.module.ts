import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentsController } from './comments/comments.controller';
import { CommentsModule } from './comments/comments.module';
import { AuthMiddleware } from './core/middlewares/auth.middleware';
import { PrismaService } from './db.service';
import { FreedaysController } from './freedays/freedays.controller';
import { FreedaysModule } from './freedays/freedays.module';
import { ParticipantsController } from './participants/participants.controller';
import { ParticipantsModule } from './participants/participants.module';
import { TripsController } from './trips/trips.controller';
import { TripsModule } from './trips/trips.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, TripsModule, FreedaysModule, ParticipantsModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthMiddleware)
      .exclude(
        {path: 'users', method:RequestMethod.POST},
      )
      .forRoutes(TripsController, UsersController, FreedaysController, ParticipantsController,CommentsController);
  }
}
