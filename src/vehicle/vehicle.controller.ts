import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { DeviceService } from "../device/device.service";

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService,
    private readonly deviceService: DeviceService) { }

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

  @Get(':id/telemetry/history')
  async getTelemetryHistory(@Param('id') id: string) {
    return this.vehicleService.getTelemetryHistory(parseInt(id));
  }

  @Get(':id/devices')
  async getDevices(@Param('id') id: string) {
    return this.deviceService.findAll({
      where: {
        vehicleId: parseInt(id),
      }
    });
  }
}
