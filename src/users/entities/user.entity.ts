import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    checkPassword(checkedPassword) {
        return bcrypt.compareSync(checkedPassword, this.password);
    }
}