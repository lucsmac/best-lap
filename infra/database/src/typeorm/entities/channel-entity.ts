import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ChannelEntity } from '@best-lap/core'
import { Metric } from './metric-entity';

@Entity()
export class Channel implements ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  domain!: string;

  @Column('text', { unique: true })
  internal_link!: string;

  @Column('text')
  theme!: string;

  @Column('bool')
  is_reference!: boolean;

  @OneToMany(() => Metric, (metric) => metric.channel)
  metrics!: Metric[];
}