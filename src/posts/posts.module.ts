import { Module } from '@nestjs/common';
import {CategoryAdminController} from "./controllers/category-admin.controller";
import { CategoryService } from './services/category.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Category} from "./entities/category.entity";
import {Post} from "./entities/post.entity";
import { PostsAdminController } from './controllers/posts-admin.controller';
import { PostsService } from './services/posts.service';
import {PostsController} from "./controllers/posts.controller";
import {FileUploaderController} from "./controllers/file-uploader.controller";
import {Comment} from "./entities/comment.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Category,
            Post,
            Comment
        ])
    ],
    controllers: [CategoryAdminController, PostsAdminController, PostsController, FileUploaderController],
    providers: [CategoryService, PostsService]
})
export class PostsModule {}
