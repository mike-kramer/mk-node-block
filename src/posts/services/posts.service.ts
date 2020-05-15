import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Post} from "../entities/post.entity";
import {Repository, SelectQueryBuilder} from "typeorm";
import {CategoryService} from "./category.service";
import * as moment from "moment";


@Injectable()
export class PostsService {
    constructor(@InjectRepository(Post) private postRepository: Repository<Post>, private categoryService: CategoryService) {
    }

    async list(parameters) {
        let queryBuilder = this.postRepository.createQueryBuilder();
        this.alterQuery(parameters, queryBuilder);

        return await queryBuilder.getManyAndCount();
    }

    async single(id) {
        return await this.postRepository.findOneOrFail(id);
    }

    async count(parameters) {
        let queryBuilder = this.postRepository.createQueryBuilder();
        this.alterQuery(parameters, queryBuilder, true);
    }

    private alterQuery(parameters, queryBuilder: SelectQueryBuilder<Post>, count: boolean = false) {
        if (parameters.page && !count) {
            let offset = (parameters.page - 1) * parameters.perPage;
            queryBuilder.skip(offset).limit(parameters.perPage)
        }
        if (parameters.category) {
            queryBuilder.where("categoryId=:cid", {cid: parameters.category});
        }

        if (parameters.sortBy && ['title', 'created_at'].indexOf(parameters.sortBy) !== -1) {
            let sortDirection = parameters.sortDirection && ["DESC", "ASC"].indexOf(parameters.sortDirection) ? parameters.sortDirection : "ASC";
            queryBuilder.addOrderBy(parameters.sortBy, parameters.sortDirection);
        }
    }

    async createPost(postData) {
        let newPost = new Post();
        return await this.updateDataInDB(postData, newPost);
    }

    async updatePost(postData) {
        let post = await this.postRepository.findOneOrFail(postData.id);
        return await this.updateDataInDB(postData, post);
    }

    private async updateDataInDB(postData, post: Post) {
        let category = await this.categoryService.findOne(postData.categoryId);

        post.text = postData.text;
        post.title = postData.title;
        post.category = category;
        post.createdAt = moment().format("YYYY-MM-DD HH-mm-ss");

        return await this.postRepository.save(postData);
    }
}
