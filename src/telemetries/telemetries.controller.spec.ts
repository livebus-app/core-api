import { Test, TestingModule } from '@nestjs/testing';
import { TelemetriesController } from './telemetries.controller';
import { TelemetriesService } from './telemetries.service';

describe('TelemetriesController', () => {
  let controller: TelemetriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelemetriesController],
      providers: [TelemetriesService],
    }).compile();

    controller = module.get<TelemetriesController>(TelemetriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
