import { Injectable } from '@nestjs/common';
import {UsersService} from "../users/services/users.service";

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

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
}
