import { Controller, Get, Query } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/products')
  async get(@Query() search: { query: string }) {
    return 'hello';
  }
}
