import { Controller, Post, Query } from '@nestjs/common';
import { PropertyService } from '../services/Property.service';

@Controller('/properties')
export class AppController {
  private propertyService: PropertyService;
  constructor(propertyService: PropertyService) {
    this.propertyService = propertyService;
  }

  @Post()
  async create(@Query() search: { query: string }) {
    try {
      return await this.propertyService.addProperty();
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}
