import {Body, Controller, Delete, Get, Param, Post, Query, UseGuards} from '@nestjs/common';
import {PostsService} from "../services/posts.service";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";

@Controller('posts-admin')
export class PostsAdminController {
    constructor(private postsService: PostsService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get("list")
    async postList(@Query() query) {
        let parameters = Object.assign({page: 1, perPage: 20}, query)
        return await this.postsService.list(parameters);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async singlePost(@Param("id") id) {
        return await this.postsService.singleUnsanitized(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async newPost(@Body() postData) {
        return this.postsService.createPost(postData)
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id")
    async updateSinglePost(@Param("id") id, @Body() postData) {
        return await this.postsService.updatePost(id, postData);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async removePost(@Param("id") id) {
        return await this.postsService.removePost(id);
    }
}
