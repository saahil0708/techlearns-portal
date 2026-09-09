import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollegesController } from './colleges.controller.js';
import { CollegesService } from './colleges.service.js';

describe('CollegesController', () => {
  let controller: CollegesController;
  let service: CollegesService;

  const mockCollege = {
    id: 'college-1',
    name: 'Tech University',
    code: 'TECH-U',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollegesController],
      providers: [
        {
          provide: CollegesService,
          useValue: {
            create: vi.fn().mockResolvedValue(mockCollege),
            findAll: vi.fn().mockResolvedValue([mockCollege]),
            findOne: vi.fn().mockResolvedValue(mockCollege),
            update: vi.fn().mockResolvedValue(mockCollege),
            delete: vi.fn().mockResolvedValue(mockCollege),
            addMember: vi.fn().mockResolvedValue({ id: 'mem-1', role: Role.STUDENT }),
            getMembers: vi.fn().mockResolvedValue([]),
            removeMember: vi.fn().mockResolvedValue({ id: 'mem-1' }),
          },
        },
      ],
    }).compile();

    controller = module.get<CollegesController>(CollegesController);
    service = module.get<CollegesService>(CollegesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a college', async () => {
    const dto = { name: 'Tech University', code: 'TECH-U' };
    const result = await controller.create(dto);
    expect(result).toEqual(mockCollege);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should get all colleges', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockCollege]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should get one college', async () => {
    const result = await controller.findOne('college-1');
    expect(result).toEqual(mockCollege);
    expect(service.findOne).toHaveBeenCalledWith('college-1');
  });
});
