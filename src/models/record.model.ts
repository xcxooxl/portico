import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.model';

export enum RecordType {
  Expense = 0,
  Income = 1,
}

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'integer' })
  type: RecordType;

  @Column({ type: 'timestamp' })
  date: Date;

  @Index('record_property_id_index', ['property_id', 'date'])
  @JoinColumn({ name: 'property_id' })
  @ManyToOne(() => Property, (property) => property.records)
  property: Property;
}
