import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Charger } from './charger.entity';

/**
 * Partner Status Enum
 */
export enum PartnerStatus {
  ACTIVE = 'ACTIVE', // Active
  INACTIVE = 'INACTIVE', // Inactive
  SUSPENDED = 'SUSPENDED', // Suspended
}

/**
 * Partner Entity
 * Represents partners in the system responsible for managing charger devices
 */
@Entity('partners')
@Index(['apiKey'], { unique: true })
export class Partner {
  /**
   * Primary key ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Partner name
   */
  @Column({ length: 100 })
  name: string;

  /**
   * Partner email
   */
  @Column({ length: 255, unique: true })
  email: string;

  /**
   * Partner description
   */
  @Column({ length: 500 })
  description: string;

  /**
   * API Key (for authentication)
   */
  @Column({ length: 64, unique: true })
  apiKey: string;

  /**
   * Partner status
   */
  @Column({
    type: 'enum',
    enum: PartnerStatus,
    default: PartnerStatus.ACTIVE,
  })
  status: PartnerStatus;

  /**
   * Maximum allowed number of chargers
   */
  @Column({ type: 'int', default: 100000 })
  maxChargers: number;

  /**
   * Partner settings (JSON format)
   */
  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  /**
   * Creation time
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Update time
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Associated charger list
   */
  @OneToMany(() => Charger, (charger) => charger.partner)
  chargers: Charger[];
}
