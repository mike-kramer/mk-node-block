import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Category} from "./category.entity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('longtext')
    text: string;

    @Column("datetime")
    createdAt: string;

    @ManyToOne(type => Category, user => user.posts)
    category: Category;
}