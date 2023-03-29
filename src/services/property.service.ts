import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MonthRecordSummary, Property } from '../models';
import { Repository } from 'typeorm';

@Injectable()
export class PropertyService {
  private readonly propertyRepo: Repository<Property>;
  private monthRecordSummaryRepository: Repository<MonthRecordSummary>;

  constructor(
    @InjectRepository(Property) propertyRepo: Repository<Property>,
    @InjectRepository(MonthRecordSummary)
    monthRecordSummaryRepository: Repository<MonthRecordSummary>,
  ) {
    this.propertyRepo = propertyRepo;
    this.monthRecordSummaryRepository = monthRecordSummaryRepository;
  }

  async addProperty(): Promise<Property> {
    const newProperty = this.propertyRepo.create({
      balance: 0,
    });

    try {
      return await this.propertyRepo.save(newProperty);
    } catch (error) {
      throw new Error(`Could not add property: ${error.message}`);
    }
  }

  async getBalance(propertyId: number): Promise<number> {
    if (Number.isNaN(propertyId)) {
      throw new BadRequestException('Property Id must be a number.');
    }
    try {
      const property = await this.propertyRepo.findOneOrFail({
        where: { id: propertyId },
      });

      return property.balance;
    } catch (error) {
      throw new NotFoundException(`Could not find property: ${error.message}`);
    }
  }
}
