import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Property, Record, RecordType } from '../models';
import { Repository } from 'typeorm';

@Injectable()
export class RecordService {
  private propertyRepo: Repository<Property>;
  private recordRepo: Repository<Record>;

  constructor(
    @InjectRepository(Property) propertyRepo: Repository<Property>,
    @InjectRepository(Record) recordRepo: Repository<Record>,
  ) {
    this.propertyRepo = propertyRepo;
    this.recordRepo = recordRepo;
  }

  async addRecord(propertyId: number, amount: number): Promise<Record> {
    if (Number.isNaN(amount)) {
      throw new Error('Amount must be a number.');
    }

    // check if property exists
    const existingProperty = await this.propertyRepo.findOne({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      throw new Error('Property does not exist.');
    }

    const newRecord = this.recordRepo.create({
      amount: amount,
      date: new Date(),
      type: amount > 0 ? RecordType.Income : RecordType.Expense,
      property: existingProperty,
    });

    try {
      return await this.recordRepo.save(newRecord);
    } catch (error) {
      throw new Error(`Could not add record: ${error.message}`);
    }
  }
}
