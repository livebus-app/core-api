import { Controller } from '@nestjs/common';
import { TelemetriesService } from './telemetries.service';

@Controller('telemetries')
export class TelemetriesController {
  constructor(private readonly telemetriesService: TelemetriesService) {}
}
