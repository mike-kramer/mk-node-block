import {Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Category} from "./category.entity";
import {Post} from "./post.entity";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    authorName: string;
    @Column({nullable: true})
    authorEmail: string;
    @Column("longtext")
    commentText: string;
    @Column("datetime")
    createdAt: Date;

    @ManyToOne(type => Post, post => post.comments, {onDelete: "CASCADE"})
    post: Post;
}