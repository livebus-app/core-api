import { Test, TestingModule } from '@nestjs/testing';
import { TelemetriesService } from './telemetries.service';

describe('TelemetriesService', () => {
  let service: TelemetriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelemetriesService],
    }).compile();

    service = module.get<TelemetriesService>(TelemetriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
