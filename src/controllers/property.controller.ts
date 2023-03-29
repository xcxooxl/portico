import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PropertyService } from '../services/property.service';
import { RecordService } from '../services/record.service';
import { RabbitMQService } from '../services/rabbitMQ.service';
import { MonthReportService } from '../services/monthReport.service';
import { validateMonthAndYear } from '../utils/date';

type CreateRecordPayload = { propertyId: number; amount: number };

@Controller('/properties')
export class PropertyController {
  private propertyService: PropertyService;
  private recordService: RecordService;
  private rabbitMQ: RabbitMQService;
  private monthReportService: MonthReportService;

  constructor(
    propertyService: PropertyService,
    recordService: RecordService,
    monthReportService: MonthReportService,
    rabbitMQ: RabbitMQService,
  ) {
    this.propertyService = propertyService;
    this.monthReportService = monthReportService;
    this.recordService = recordService;
    this.rabbitMQ = rabbitMQ;
  }

  @Post()
  async create() {
    try {
      return await this.propertyService.addProperty();
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  @Get(':id/records')
  @Get()
  async getRecords(
    @Param('id') propertyId: number,
    @Query('type') type: number,
    @Query('order') order: number,
    @Query('limit') limit?: number,
    @Query('lastRecordId') lastRecordId?: number,
  ) {
    try {
      return await this.recordService.getRecords(
        propertyId,
        type,
        order,
        limit,
        lastRecordId,
      );
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  @Get(':id/balance')
  @Get()
  async getBalance(@Param('id') propertyId: number) {
    try {
      const balance = await this.propertyService.getBalance(propertyId);
      return { balance };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @Post(':id/records')
  async createRecord(
    @Param('id') propertyId: number,
    @Body() body: CreateRecordPayload,
  ) {
    try {
      const { amount } = body;
      // I would like to keep it simpler and not allow the user to specify the date
      await this.recordService.addRecordToFutureProcessing(propertyId, amount);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  @Get(':id/month-report')
  async getMonthReport(
    @Param('id') propertyId: number,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    validateMonthAndYear(month, year);

    try {
      return await this.monthReportService.getMonthReport(
        propertyId,
        month,
        year,
      );
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
