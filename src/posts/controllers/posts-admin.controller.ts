import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {PostsService} from "../services/posts.service";

@Controller('posts-admin')
export class PostsAdminController {
    constructor(private postsService: PostsService) {
    }

    @Get("list")
    async postList(@Query() query) {
        let parameters = Object.assign({page: 1, perPage: 20}, query)
        return await this.postsService.list(parameters);
    }

    @Get(":id")
    async singlePost(@Param("id") id) {
        return await this.postsService.single(id);
    }

    @Post()
    async newPost(@Body() postData) {
        return this.postsService.createPost(postData)
    }
}
