import {Body, Controller, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
import {PostsService} from "../services/posts.service";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {CategoryService} from "../services/category.service";

@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService, private categoryService: CategoryService) {
    }

    @Get("categories")
    async fullTree() {
        return await this.categoryService.fullTree();
    }

    @Get(":id")
    async singlePost(@Param('id') id) {
        return await this.postsService.single(id);
    }

    @Post(":id/comment")
    async commentPost(@Param("id") id, @Body() commentBody) {
        return await this.postsService.commentPost(id, commentBody);
    }

    @Get()
    async lastPosts(@Query() query) {
        let params = Object.assign({page: 1, perPage: 20, sortBy: "createdAt", sortDirection: "DESC"}, query);
        return this.postsService.list(params);
    }


}