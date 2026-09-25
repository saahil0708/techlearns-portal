import { Test, TestingModule } from '@nestjs/testing';
import { BootcampsController } from './bootcamps.controller.js';
import { BootcampsService } from './bootcamps.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';

describe('BootcampsController', () => {
  let controller: BootcampsController;
  let service: any;

  const mockBootcampsService = {
    createBootcamp: vi.fn(),
    findAll: vi.fn(),
    findBySlug: vi.fn(),
    updateBootcamp: vi.fn(),
    deleteBootcamp: vi.fn(),
    enroll: vi.fn(),
    updateProgress: vi.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'admin@codeplatform.io',
    name: 'Admin User',
    globalRole: Role.SUPER_ADMIN,
    memberships: [],
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BootcampsController],
      providers: [
        {
          provide: BootcampsService,
          useValue: mockBootcampsService,
        },
      ],
    }).compile();

    controller = module.get<BootcampsController>(BootcampsController);
    service = module.get<BootcampsService>(BootcampsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createBootcamp', async () => {
    mockBootcampsService.createBootcamp.mockResolvedValue({ id: 'bc-1', title: 'Test' });
    const dto = { title: 'Test', track: 'GenAI', instructor: 'Instructor', duration: '4w' };

    const res = await controller.create(mockUser as any, dto);
    expect(service.createBootcamp).toHaveBeenCalledWith('user-1', dto, mockUser);
    expect(res).toEqual({ id: 'bc-1', title: 'Test' });
  });

  it('should call findAll', async () => {
    mockBootcampsService.findAll.mockResolvedValue({ items: [], total: 0 });
    const res = await controller.findAll({}, mockUser as any);
    expect(service.findAll).toHaveBeenCalledWith({}, 'user-1');
    expect(res).toEqual({ items: [], total: 0 });
  });

  it('should call enroll', async () => {
    mockBootcampsService.enroll.mockResolvedValue({ message: 'Success' });
    const res = await controller.enroll('bc-1', mockUser as any);
    expect(service.enroll).toHaveBeenCalledWith('bc-1', 'user-1');
    expect(res).toEqual({ message: 'Success' });
  });
});
