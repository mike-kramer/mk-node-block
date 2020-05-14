import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {CategoryService} from "../services/category.service";

@Controller('category-admin')
export class CategoryAdminController {
    constructor(private categoryService: CategoryService) {
    }

    @UseGuards(JwtAuthGuard)
    @Post("create")
    async createCategory(@Body() body) {
        return await this.categoryService.createCategory(body.name, body.parentId);
    }

    @UseGuards(JwtAuthGuard)
    @Get("full-tree")
    async fullTree() {
        return await this.categoryService.fullTree();
    }

    @UseGuards(JwtAuthGuard)
    @Post("update")
    async updateCategory(@Body() body) {
        return await this.categoryService.updateCategory(body);
    }
}
