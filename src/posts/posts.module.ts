import { Module } from '@nestjs/common';
import {CategoryAdminController} from "./controllers/category-admin.controller";
import { CategoryService } from './services/category.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Category} from "./entities/category.entity";
import {Post} from "./entities/post.entity";
import { PostsAdminController } from './controllers/posts-admin.controller';
import { PostsService } from './services/posts.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Category,
            Post
        ])
    ],
    controllers: [CategoryAdminController, PostsAdminController],
    providers: [CategoryService, PostsService]
})
export class PostsModule {}
