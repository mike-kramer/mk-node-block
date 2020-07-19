import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Post} from "../entities/post.entity";
import {Comment} from "../entities/comment.entity";
import {getConnection, Repository, SelectQueryBuilder} from "typeorm";
import {CategoryService} from "./category.service";
import * as moment from "moment";
import {throwError} from "rxjs";

const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();


@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post) private postRepository: Repository<Post>,
        @InjectRepository(Comment) private commentRepository: Repository<Comment>,
        private categoryService: CategoryService
    ) {
    }

    async list(parameters) {
        let queryBuilder = this.postRepository.createQueryBuilder();
        await this.alterQuery(parameters, queryBuilder);

        return await queryBuilder.getManyAndCount();
    }

    async single(id) {
        return await this.postRepository.findOneOrFail(id);
    }
    async singleUnsanitized(id) {
        let post = await this.postRepository.findOneOrFail(id);
        this.unsanitizeCodeInPosts(post);
        return post;
    }

    async count(parameters) {
        let queryBuilder = this.postRepository.createQueryBuilder();
        await this.alterQuery(parameters, queryBuilder, true);
    }

    private async alterQuery(parameters, queryBuilder: SelectQueryBuilder<Post>, count: boolean = false) {
        queryBuilder.leftJoinAndSelect("Post.category", "category")
        if (parameters.page && !count) {
            let offset = (parameters.page - 1) * parameters.perPage;
            queryBuilder.offset(offset).limit(parseInt(parameters.perPage))
        }
        if (parameters.category) {
            let catRec = await getConnection().query("select * from category where id=?", [parameters.category]);
            if (catRec.length < 1) {
                throwError("category not found");
            } else {
                catRec = catRec[0];
            }
            queryBuilder.andWhere("category.nsleft >= :left", {left: catRec.nsleft});
            queryBuilder.andWhere("category.nsright <= :right", {right: catRec.nsright});
        }

        if (parameters.sortBy && ['title', 'createdAt'].indexOf(parameters.sortBy) !== -1) {
            let sortDirection = parameters.sortDirection && ["DESC", "ASC"].indexOf(parameters.sortDirection) ? parameters.sortDirection : "ASC";
            queryBuilder.addOrderBy(parameters.sortBy, parameters.sortDirection);
        }
    }

    async createPost(postData) {
        let newPost = new Post();
        return await this.updateDataInDB(postData, newPost);
    }

    async updatePost(id, postData) {
        let post = await this.postRepository.findOneOrFail(id);
        return await this.updateDataInDB(postData, post);
    }

    async commentPost(post_id, commentData) {
        let post = await this.postRepository.findOneOrFail(post_id);
        let comment = new Comment();
        comment.authorEmail = commentData.authorEmail;
        comment.authorName = commentData.authorName;
        comment.commentText = commentData.commentText;
        comment.post = post;
        comment.createdAt = new Date();
        return await this.commentRepository.save(comment);
    }

    private async updateDataInDB(postData, post: Post) {
        let category = await this.categoryService.findOne(postData.categoryId);

        this.sanitizeCodeInPosts(postData);

        post.text = postData.text;
        post.excerpt = postData.excerpt;
        post.title = postData.title;
        post.category = category;

        let currentDate = new Date;
        if (!post.id) {
            post.createdAt = currentDate;
        }
        post.updatedAtTimeStamp = Math.floor(Date.now() / 1000);

        return await this.postRepository.save(post);
    }

    async removePost(postId) {
        let post = await this.postRepository.findOneOrFail(postId);
        return await this.postRepository.remove(post);
    }

    private sanitizeCodeInPosts(postData: any) {
        let codeBlocks = [...postData.text.matchAll(/(<code.*?>)([\s\S]*?)<\/code>/gm)];
        for (let cb of codeBlocks) {
            let sanitizedCode = entities.encode(cb[2]);
            postData.text = postData.text.replace(cb[0], `${cb[1]}${sanitizedCode}</code>`);
        }
    }
    private unsanitizeCodeInPosts(postData: any) {
        let codeBlocks = [...postData.text.matchAll(/(<code.*?>)([\s\S]*?)<\/code>/gm)];
        for (let cb of codeBlocks) {
            let sanitizedCode = entities.decode(cb[2]);
            postData.text = postData.text.replace(cb[0], `${cb[1]}${sanitizedCode}</code>`);
        }
    }
}
