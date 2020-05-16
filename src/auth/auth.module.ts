import {Global, Module} from '@nestjs/common';
import { AuthService } from './auth.service';
import {PassportModule} from "@nestjs/passport";
import {LocalStrategy} from "./local.strategy";
import {JwtModule} from "@nestjs/jwt";
import {configService} from "../config/config.service";
import {JwtAuthGuard} from "./jwt-auth.guard";
import {JwtStrategy} from "./jwt.strategy";

@Global()
@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: configService.getValue("JWT_SECRET")
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtAuthGuard, JwtStrategy],
    exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
