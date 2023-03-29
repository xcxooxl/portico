import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppService } from './services/app.service';
import { AppController } from './controllers/app.controller';

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
    // TypeOrmModule.forFeature([Product, Chain, Price, Store, SubChain, Recipe]),
  ],
  controllers: [AppController],
  providers: [TypeOrmModule, AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}
