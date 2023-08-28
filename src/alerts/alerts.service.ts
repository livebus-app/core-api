import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AlertsService {
    constructor(private prismaService: PrismaService) { }

    getLastNonExpiredAlert(deviceId: string) {
        return this.prismaService.alert.findFirst({
            where: {
                deviceId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
