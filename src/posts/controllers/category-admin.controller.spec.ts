import { Test, TestingModule } from '@nestjs/testing';
import { CategoryAdminController } from './category-admin.controller';

describe('CategoryAdmin Controller', () => {
  let controller: CategoryAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryAdminController],
    }).compile();

    controller = module.get<CategoryAdminController>(CategoryAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
