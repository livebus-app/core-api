import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AlertsService {
    constructor(private prismaService: PrismaService) { }

    getLastNonExpiredAlert(deviceId: number) {
        return this.prismaService.alert.findMany({
            where: {
                Device: {
                    vehicleId: deviceId,
                },
                expiredAt: {
                    gt: new Date(),
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
