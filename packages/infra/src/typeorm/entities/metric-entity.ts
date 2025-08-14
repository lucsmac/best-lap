import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'
import { MetricEntity } from '@best-lap/core';
import { Page } from './page-entity';

@Entity('metrics')
export class Metric implements MetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @PrimaryColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  time!: Date;

  @Column('float')
  score!: number;

  @Column('int')
  response_time!: number;

  @Column('float')
  fcp!: number;

  @Column('float')
  si!: number;

  @Column('float')
  lcp!: number;

  @Column('float')
  tbt!: number;

  @Column('float')
  cls!: number;

  @Column({ type: 'uuid', nullable: false })
  page_id!: string;

  @ManyToOne(() => Page, (page: Page) => page.metrics)
  @JoinColumn({ name: 'page_id' })
  page!: Page;
}