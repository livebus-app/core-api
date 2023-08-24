import { Body, Controller, Get, Post } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async findAll() {
    return this.companyService.findAll();
  }

  @Post()
  async create(@Body() data: any) {
    return this.companyService.create(data);
  }
}
