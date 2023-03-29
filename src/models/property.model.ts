import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Record } from './record.model';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  balance: number;

  @OneToMany(() => Record, (record) => record.property)
  records: Record[];
}
