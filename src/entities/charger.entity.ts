import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Partner } from './partner.entity';

/**
 * Charger Status Enum
 */
export enum ChargerStatus {
  AVAILABLE = 'AVAILABLE', // Available
  BLOCKED = 'BLOCKED', // Blocked
  CHARGING = 'CHARGING', // Charging
  INOPERATIVE = 'INOPERATIVE', // Inoperative
  REMOVED = 'REMOVED', // Removed
  RESERVED = 'RESERVED', // Reserved
  UNKNOWN = 'UNKNOWN', // Unknown status
}

/**
 * Charger Entity
 * Represents charger devices in the system
 */
@Entity('chargers')
@Index(['partnerId', 'chargerId'], { unique: true })
@Index(['status'])
export class Charger {
  /**
   * Primary key ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Charger ID (business identifier)
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  chargerId: string;

  /**
   * Partner ID
   */
  @Column()
  partnerId: number;

  /**
   * Charger name
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  /**
   * Charger status
   */
  @Column({
    type: 'enum',
    enum: ChargerStatus,
    default: ChargerStatus.UNKNOWN,
  })
  status: ChargerStatus;

  /**
   * Charger location information (JSON format)
   */
  @Column({ type: 'jsonb', nullable: true })
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  /**
   * Charger configuration information (JSON format)
   */
  @Column({ type: 'jsonb', nullable: true })
  configuration: {
    powerRating: number; // Power rating (kW)
    connectorType: string; // Connector type
    voltage: number; // Voltage (V)
    current: number; // Current (A)
  };

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
   * Associated partner
   */
  @ManyToOne(() => Partner, (partner) => partner.chargers)
  @JoinColumn({ name: 'partnerId' })
  partner: Partner;
}
