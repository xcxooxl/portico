import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.model';

@Entity()
export class MonthRecordSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  starting_balance: number;

  @Column({ type: 'float' })
  ending_balance: number;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer' })
  month: number;

  @JoinColumn({ name: 'property_id' })
  @Index('property_report_index', ['property_id', 'year', 'month'])
  @ManyToOne(() => Property)
  property: Property;
}
