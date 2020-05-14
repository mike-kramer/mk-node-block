import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../entities/user.entity";
import {Repository} from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    findOne(id: string): Promise<User> {
        return this.usersRepository.findOne(id);
    }

    findByName(name: string): Promise<User> {
        return this.usersRepository.findOne({where: {name}});
    }

    usersCount(): Promise<number> {
        return this.usersRepository.count();
    }

    makeUser(username: string, pass: string): Promise<User> {
        let user = new User();
        user.name = username;
        user.password = bcrypt.hashSync(pass, 12);
        return this.usersRepository.save(user, {reload: true})
    }
}
