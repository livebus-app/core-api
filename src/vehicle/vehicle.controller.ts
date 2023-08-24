import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  async create(@Body() data: any) {
    return this.vehicleService.create(data);
  }

  @Get()
  async findAll() {
    return this.vehicleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(parseInt(id));
  }

  @Get(':id/telemetry')
  async getTelemetry(@Param('id') id: string) {
    return this.vehicleService.getTelemetry(parseInt(id));
  }
}
