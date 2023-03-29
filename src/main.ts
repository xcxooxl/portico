import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(8000);
  // const product = new Product();
  const connection = AppDataSource.manager.connection;
  ``;
  await connection.query('CREATE EXTENSION IF NOT EXISTS "vector"');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS embeddings (
      product_id VARCHAR(32) PRIMARY KEY,
      embeddings vector
    )
  `);

  // product.id = '1234';
  // product.name = 'teast';
  // product.description = 'test';
  // product.manufacturerName = 'test';
  // product.manufacturerCountry = 'test';
  // product.unitQty = 'test';
  // product.unitOfMeasure = 'test';
  // product.unitOfMeasurePrice = 'test';
  // product.itemStatus = 'test';
  // product.allowDiscount = 'test';
  // product.translatedText = 'test';
  // product.nameSearch = 'test';
  // product.image = 'test';
  // console.log('Haha22');
  // console.log('Haha22');
  // await AppDataSource.manager.save(product);
  // console.log('Haha');
}
bootstrap();
