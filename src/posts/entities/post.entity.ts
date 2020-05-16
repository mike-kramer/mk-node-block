import {Column, CreateDateColumn, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Category} from "./category.entity";
import {Comment} from "./comment.entity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('longtext')
    text: string;

    @Column({name: "createdAt", type: "datetime"})
    createdAt: Date;

    @ManyToOne(type => Category, category => category.posts, {eager: true})
    @JoinTable()
    category: Category;

    @OneToMany(type => Comment, comment => comment.post, {eager: true})
    @JoinTable()
    comments: Comment[];
}