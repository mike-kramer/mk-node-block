import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository, TreeRepository} from "typeorm";
import {Category} from "../entities/category.entity";

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
                private categoriesRepository: TreeRepository<Category>
    ) {
    }

    private async checkRootCategory() {
        if (await this.categoriesRepository.count() === 0) {
            let rootCategory = new Category();
            rootCategory.name = "root";
            rootCategory.parent = null;
            await this.categoriesRepository.save(rootCategory, {reload: true});
            return rootCategory;
        }
        return await this.categoriesRepository.findOne({parent: null})
    }

    async createCategory(name, parentId) {
        let rootCat = await this.checkRootCategory();
        let parentCategory = parentId === null ? rootCat: await this.categoriesRepository.findOneOrFail(parentId);
        let newCategory = new Category();
        newCategory.name = name;
        newCategory.parent = parentCategory;
        await this.categoriesRepository.save(newCategory);
        return newCategory;
    }

    async fullTree() {
        return await this.categoriesRepository.findTrees();
    }

    async updateCategory(updateData) {
        let category = await this.categoriesRepository.findOneOrFail(updateData.id);
        category.name = updateData.name;
        return await this.categoriesRepository.save(category);
    }
}
