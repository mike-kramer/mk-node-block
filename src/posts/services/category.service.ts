import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {getConnection, Repository, TreeRepository} from "typeorm";
import {Category} from "../entities/category.entity";
import {NestedSetsHelper} from "./NestedSetsHelper";

@Injectable()
export class CategoryService {
    private helper: NestedSetsHelper;
    constructor(
        @InjectRepository(Category)
                private categoriesRepository: TreeRepository<Category>
    ) {
        this.helper = new NestedSetsHelper({
            connection: getConnection(),
            tableName: "category"
        });
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

    private buildTree(categories) {
        let categoryById = {};
        /* Потомки строго идут за предками при правильном запросе, поэтому можно обойтись простым алгоритмом */
        let tree = [categories[0]];
        for (let c of categories) {
            c.children = [];
            categoryById[c.id] = c;
            if (c.parent) {
                categoryById[c.parent.id].children.push(c);
            }
        }
        return tree;
    }

    async fullTree() {
        let rootCat = await this.checkRootCategory();
        let descendants = await this.categoriesRepository
            .createDescendantsQueryBuilder("category", "catClosure", rootCat)
            .addOrderBy("category.nsleft")
            .leftJoinAndSelect("category.parent", "parent")
            .getMany();
        return this.buildTree(descendants);
    }

    async updateCategory(updateData) {
        let category = await this.categoriesRepository.findOneOrFail(updateData.id);
        category.name = updateData.name;
        return await this.categoriesRepository.save(category);
    }

    async deleteCategory(catId) {
        let category = await this.categoriesRepository.findOneOrFail(catId);
        if (category.name !== 'root') {
            await this.helper.removeNodeByNodeID(category.id);
        }
    }

    async findOne(id: any) {
        return await this.categoriesRepository.findOneOrFail(id);
    }

    async moveCategoryUp(catId) {
        return await this.helper.moveNodeOneStepBackward(catId);
    }

    async moveCategoryDown(catId) {
        return await this.helper.moveNodeOneStepForward(catId);
    }

    async moveInto(catId, toId) {
        return await this.helper.moveNodeAsLastChildByParentNodeID(catId, toId);
    }
}
