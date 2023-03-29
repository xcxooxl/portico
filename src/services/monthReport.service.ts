import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Property, Record, RecordType } from '../models';
import { Between, Repository } from 'typeorm';
import { RabbitMQService } from './rabbitMQ.service';
import { MonthRecordSummary } from '../models';
import { validateMonthAndYear } from '../utils/date';

@Injectable()
export class MonthReportService {
  private propertyRepo: Repository<Property>;
  private monthRecordSummaryRepository: Repository<MonthRecordSummary>;
  private rabbitMQ: RabbitMQService;
  private recordRepo: Repository<Record>;

  constructor(
    @InjectRepository(Property) propertyRepo: Repository<Property>,
    @InjectRepository(Record) recordRepo: Repository<Record>,
    @InjectRepository(MonthRecordSummary)
    monthRecordSummaryRepository: Repository<MonthRecordSummary>,
    rabbitMQ: RabbitMQService,
  ) {
    this.propertyRepo = propertyRepo;
    this.monthRecordSummaryRepository = monthRecordSummaryRepository;
    this.recordRepo = recordRepo;
    this.rabbitMQ = rabbitMQ;
  }

  // this should probably be also processed by the queue and sent by email or something.
  getMonthReport = async (propertyId: number, month: number, year: number) => {
    validateMonthAndYear(month, year);

    if (Number.isNaN(propertyId)) {
      throw new BadRequestException('Property Id must be a number.');
    }

    const monthRecordSummary = await this.monthRecordSummaryRepository.findOne({
      where: {
        property: { id: propertyId },
      },
    });

    if (!monthRecordSummary) {
      throw new NotFoundException(
        `Could not find month record summary for property ${propertyId} for month ${month} and year ${year}`,
      );
    }

    const records = await this.recordRepo.find({
      where: {
        date: Between(new Date(year, month, 1), new Date(year, month + 1, 0)),
      },
    });

    const rows = [];
    let startingBalance = monthRecordSummary.starting_balance;
    for (const record of records) {
      startingBalance += record.amount;

      rows.push({
        id: record.id,
        type: record.type === RecordType.Income ? 'Income' : 'Expense',
        amount: Math.abs(record.amount),
        balanceAfterRecord: startingBalance,
      });
    }

    //should use DTO here and clean up the data
    return {
      ...monthRecordSummary,
      rows,
    };
  };
}
