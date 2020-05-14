import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {configService} from "./config/config.service";
import {JwtModule} from "@nestjs/jwt";


@Module({
  imports: [
      TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
      UsersModule,
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
