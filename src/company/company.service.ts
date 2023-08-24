import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.company.findMany();
  }

  create(data: any) {
    return this.prismaService.company.create({
      data,
    });
  }
}
