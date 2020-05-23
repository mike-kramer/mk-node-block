import {Body, Controller, Delete, Get, Param, Post, UseGuards} from '@nestjs/common';
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

    @UseGuards(JwtAuthGuard)
    @Post("move/:id/:direction")
    async moveCat(@Param("id") id, @Param("direction") direction) {
        if (direction === 'up') {
            return await this.categoryService.moveCategoryUp(id);
        }
        return await this.categoryService.moveCategoryDown(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post("move-into/:id/:to")
    async moveCatInto(@Param("id") id, @Param("to") to) {
        return await this.categoryService.moveInto(id, to);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    async deleteCategory(@Param('id') id) {
        return await this.categoryService.deleteCategory(id);
    }


}
