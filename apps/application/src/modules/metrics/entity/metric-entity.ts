import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'
import { MetricEntity } from './metric-entity.interface';
import { Channel } from '../../channel/entity/channel-entity';

@Entity()
export class Metrics implements MetricEntity {    
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
  responseTime!: number;

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

  @Column({ nullable: false })
  channel_id!: string;

  @ManyToOne(() => Channel, (channel: Channel) => channel.metrics)
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;
}