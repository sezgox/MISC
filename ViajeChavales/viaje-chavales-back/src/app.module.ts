import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CommentsController } from './comments/comments.controller';
import { CommentsModule } from './comments/comments.module';
import { AuthMiddleware } from './core/middlewares/auth.middleware';
import { WsAuthMiddleware } from './core/middlewares/ws-auth.middleware';
import { PrismaService } from './db.service';
import { FreedaysController } from './freedays/freedays.controller';
import { FreedaysModule } from './freedays/freedays.module';
import { GroupsModule } from './groups/groups.module';
import { ParticipantsController } from './participants/participants.controller';
import { ParticipantsModule } from './participants/participants.module';
import { TripsController } from './trips/trips.controller';
import { TripsModule } from './trips/trips.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    TripsModule, 
    FreedaysModule, 
    ParticipantsModule, 
    CommentsModule, 
    GroupsModule, 
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Middleware para rutas HTTP
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'users', method: RequestMethod.POST },
        { path: 'groups', method: RequestMethod.POST },
      )
      .forRoutes(
        TripsController, 
        UsersController, 
        FreedaysController, 
        ParticipantsController,
        CommentsController
      );
    
    // Middleware para WebSockets
    consumer
      .apply(WsAuthMiddleware)
      .forRoutes({
        path: 'chat', 
        method: RequestMethod.ALL
      });
  }
}