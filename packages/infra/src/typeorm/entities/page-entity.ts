import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { PageEntity } from '@best-lap/core'
import { Channel } from './channel-entity';
import { Metric } from './metric-entity';

@Entity('pages')
export class Page implements PageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  path!: string;

  @Column({ type: 'uuid', nullable: false })
  channel_id!: string;

  @ManyToOne(() => Channel, (channel: Channel) => channel.pages)
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Metric, (metric) => metric.page)
  metrics!: Metric[];
}
