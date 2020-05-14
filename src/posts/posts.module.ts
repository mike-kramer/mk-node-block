import { Module } from '@nestjs/common';
import {CategoryAdminController} from "./controllers/category-admin.controller";
import { CategoryService } from './services/category.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Category} from "./entities/category.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Category
        ])
    ],
    controllers: [CategoryAdminController],
    providers: [CategoryService]
})
export class PostsModule {}
