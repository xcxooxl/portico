import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Property, Record, RecordType } from '../models';
import { LessThan, MoreThan, QueryRunner, Repository } from 'typeorm';
import { QueueNames, RabbitMQService } from './rabbitMQ.service';
import { AppDataSource } from '../data-source';
import { MonthRecordSummary } from '../models/montlyRecordSummary.model';
import { getPreviousMonth } from '../utils/date';

const MAX_RECORDS_LIMIT = 50;

@Injectable()
export class RecordService {
  private propertyRepo: Repository<Property>;
  private recordRepo: Repository<Record>;
  private rabbitMQ: RabbitMQService;

  constructor(
    @InjectRepository(Property) propertyRepo: Repository<Property>,
    @InjectRepository(Record) recordRepo: Repository<Record>,
    rabbitMQ: RabbitMQService,
  ) {
    this.propertyRepo = propertyRepo;
    this.recordRepo = recordRepo;
    this.rabbitMQ = rabbitMQ;
  }

  async addRecordToFutureProcessing(propertyId: number, amount: number) {
    if (Number.isNaN(amount)) {
      throw new BadRequestException('Amount must be a number.');
    }
    if (Number.isNaN(propertyId)) {
      throw new BadRequestException('Property Id must be a number.');
    }

    const message = JSON.stringify({ propertyId, amount, date: new Date() });

    // check if property exists
    const existingProperty = await this.propertyRepo.exist({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      console.error('Property does not exist.');
      throw new NotFoundException('Property does not exist.');
    }

    console.log('inserting message!!!');
    await this.rabbitMQ.publish(QueueNames.CREATE_RECORDS, message);
  }

  async addRecord(propertyId: number, amount: number, date: Date) {
    if (!AppDataSource.isConnected) await AppDataSource.connect();
    // get a connection and create a new query runner
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      if (Number.isNaN(amount)) {
        throw new Error('Amount must be a number.');
      }

      // check if property exists
      const existingProperty = await queryRunner.manager.findOne(Property, {
        where: { id: propertyId },
      });

      if (!existingProperty) {
        console.error('Property does not exist.');
        // throw new Error('Property does not exist.');
      }

      if (date > new Date()) {
        throw new Error('Are you a time traveller?');
      }
      await queryRunner.startTransaction();

      const reportMonth = new Date(date).getMonth();
      const reportYear = new Date(date).getFullYear();

      let monthRecordSummary = await queryRunner.manager.findOne(
        MonthRecordSummary,
        {
          where: {
            month: reportMonth,
            year: reportYear,
            property: existingProperty,
          },
        },
      );

      if (!monthRecordSummary) {
        monthRecordSummary = await this.createMonthReportSummary(
          reportMonth,
          reportYear,
          queryRunner,
          existingProperty,
        );
      }

      monthRecordSummary.ending_balance += amount;

      const newRecord = queryRunner.manager.create(Record, {
        amount: amount,
        date: date,
        type: amount > 0 ? RecordType.Income : RecordType.Expense,
        property: existingProperty,
      });
      existingProperty.balance += amount;
      try {
        await Promise.all([
          queryRunner.manager.save(existingProperty),
          queryRunner.manager.save(newRecord),
          queryRunner.manager.save(monthRecordSummary),
        ]);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        // cannot notify user that record was not added..
        throw new Error(`Could not add record: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      await queryRunner.release();
    }
  }

  private async createMonthReportSummary(
    reportMonth: number,
    reportYear: number,
    queryRunner: QueryRunner,
    existingProperty: Property,
  ) {
    const { previousMonth, previousYear } = getPreviousMonth(
      reportMonth,
      reportYear,
    );
    const previousMonthRecordSummary = await queryRunner.manager.findOne(
      MonthRecordSummary,
      {
        where: {
          month: previousMonth,
          year: previousYear,
          property: existingProperty,
        },
      },
    );

    const startingBalance = previousMonthRecordSummary
      ? previousMonthRecordSummary.ending_balance
      : 0;

    return queryRunner.manager.create(MonthRecordSummary, {
      month: reportMonth,
      year: reportYear,
      property: existingProperty,
      starting_balance: startingBalance,
      ending_balance: startingBalance,
    });
  }

  getRecords = async (
    propertyId: number,
    type: number,
    order: number,
    limit = 10,
    lastRecordId?: number,
  ) => {
    limit = Math.min(limit, MAX_RECORDS_LIMIT);
    const isAscendingOrder = order === 1;
    const where = {
      type: type,
      property: {
        id: propertyId,
      },
    };

    if (lastRecordId) {
      where['id'] =
        lastRecordId && isAscendingOrder
          ? MoreThan(lastRecordId || 0)
          : LessThan(lastRecordId);
    }

    return this.recordRepo.find({
      where: where,
      order: {
        date: isAscendingOrder ? 'ASC' : 'DESC',
      },
      take: limit,
    });
  };
}
