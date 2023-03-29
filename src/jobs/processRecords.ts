import { QueueNames, RabbitMQService } from '../services/rabbitMQ.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RecordService } from '../services/record.service';

const startProcessingRecords = async () => {
  const app = await NestFactory.create(AppModule);
  const recordService = app.get(RecordService);
  const rabbitMQ = app.get(RabbitMQService);

  await rabbitMQ.consume(QueueNames.CREATE_RECORDS, async (msg) => {
    console.log('Processing message: ', msg);
    const recordData = JSON.parse(msg);
    try {
      await recordService.addRecord(
        recordData.propertyId,
        recordData.amount,
        recordData.date,
      );
    } catch (e) {
      console.error('Error processing message: ', msg);
      console.error(e);
    }
  });
};
startProcessingRecords();
