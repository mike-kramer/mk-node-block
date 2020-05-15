import { Test, TestingModule } from '@nestjs/testing';
import { PostsAdminController } from './posts-admin.controller';

describe('PostsAdmin Controller', () => {
  let controller: PostsAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsAdminController],
    }).compile();

    controller = module.get<PostsAdminController>(PostsAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
