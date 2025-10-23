import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { ProviderEntity } from '@best-lap/core'
import { Page } from './page-entity';
import { Channel } from './channel-entity';

@Entity('providers')
export class Provider implements ProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  website!: string;

  @Column('text', { unique: true })
  slug!: string;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Channel, (channel) => channel.provider)
  channels!: Channel[];

  @OneToMany(() => Page, (page) => page.provider)
  pages!: Page[];
}
