import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Property } from '../models';
import { Repository } from 'typeorm';

@Injectable()
export class PropertyService {
  private readonly propertyRepo: Repository<Property>;

  constructor(@InjectRepository(Property) propertyRepo: Repository<Property>) {
    this.propertyRepo = propertyRepo;
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
}
