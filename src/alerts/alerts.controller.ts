import { Controller, Get, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { Alert } from '@prisma/client';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getNonExpiredAlerts(@Query('vehicle_id') vehicleId: string): Promise<Alert[]> {
    return this.alertsService.getLastNonExpiredAlert(parseInt(vehicleId));
  }
}
