import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {configService} from "./config/config.service";
import {JwtModule} from "@nestjs/jwt";
import { PostsModule } from './posts/posts.module';


@Module({
  imports: [
      TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
      UsersModule,
      AuthModule,
      PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
