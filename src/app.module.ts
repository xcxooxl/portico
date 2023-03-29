import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PropertyController } from './controllers/property.controller';
import { PropertyService } from './services/property.service';
import { RecordService } from './services/record.service';
import { MonthRecordSummary, Property, Record } from './models';
import { RabbitMQService } from './services/rabbitMQ.service';
import { MonthReportService } from './services/monthReport.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [`${__dirname}\\models\\*.model.{ts,js}`],
      synchronize: true,
      autoLoadEntities: true,
    }),

    TypeOrmModule.forFeature([Property, Record, MonthRecordSummary]),
    // TypeOrmModule.forFeature([Product, Chain, Price, Store, SubChain, Recipe]),
  ],
  controllers: [PropertyController],
  providers: [
    TypeOrmModule,
    PropertyService,
    RecordService,
    RabbitMQService,
    MonthReportService,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}
