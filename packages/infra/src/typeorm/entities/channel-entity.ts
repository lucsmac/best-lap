import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { ChannelEntity } from '@best-lap/core'
import { Page } from './page-entity';

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
  active!: boolean;

  @Column('bool')
  is_reference!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Page, (page) => page.channel)
  pages!: Page[];
}