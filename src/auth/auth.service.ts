import { Injectable } from '@nestjs/common';
import {UsersService} from "../users/services/users.service";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,  private jwtService: JwtService) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const usersCount = await this.usersService.usersCount();

        if (usersCount === 0) {
            return this.usersService.makeUser(username, pass);
        }

        const user = await this.usersService.findByName(username);
        if (user && user.checkPassword(pass)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.name, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
