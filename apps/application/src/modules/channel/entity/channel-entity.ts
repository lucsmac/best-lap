import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Metrics } from './metrics';
import { ChannelEntity } from './channel-entity.interface';

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

  @OneToMany(() => Metrics, (metric) => metric.channel)
  metrics!: Metrics[];
}