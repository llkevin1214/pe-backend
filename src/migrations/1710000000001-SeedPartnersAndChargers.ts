import { MigrationInterface, QueryRunner } from 'typeorm';
import { Partner, PartnerStatus } from '../entities/partner.entity';
import { Charger, ChargerStatus } from '../entities/charger.entity';
import { In } from 'typeorm';

export class SeedPartnersAndChargers1710000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create partner repository
    const partnerRepository = queryRunner.manager.getRepository(Partner);
    const chargerRepository = queryRunner.manager.getRepository(Charger);

    // Insert partners using TypeORM entities
    const partnerA = partnerRepository.create({
      name: 'Partner A',
      email: 'partnerA@example.com',
      description: 'Partner A description',
      apiKey: 'api-key-partner-a',
      status: PartnerStatus.ACTIVE,
      maxChargers: 100,
      settings: { timezone: 'UTC' },
    });

    const partnerB = partnerRepository.create({
      name: 'Partner B',
      email: 'partnerB@example.com',
      description: 'partnerB description',
      apiKey: 'api-key-partner-b',
      status: PartnerStatus.ACTIVE,
      maxChargers: 200,
      settings: { timezone: 'Asia/Shanghai' },
    });

    const savedPartnerA = await partnerRepository.save(partnerA);
    const savedPartnerB = await partnerRepository.save(partnerB);

    // Insert chargers using TypeORM entities
    const chargerA1 = chargerRepository.create({
      chargerId: 'CHARGER_A1',
      partnerId: savedPartnerA.id,
      name: 'Charger A1',
      status: ChargerStatus.AVAILABLE,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York',
      },
      configuration: {
        powerRating: 50,
        connectorType: 'CCS',
        voltage: 400,
        current: 125,
      },
    });

    const chargerA2 = chargerRepository.create({
      chargerId: 'CHARGER_A2',
      partnerId: savedPartnerA.id,
      name: 'Charger A2',
      status: ChargerStatus.CHARGING,
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
        address: 'Los Angeles',
      },
      configuration: {
        powerRating: 60,
        connectorType: 'CHAdeMO',
        voltage: 450,
        current: 150,
      },
    });

    const chargerB1 = chargerRepository.create({
      chargerId: 'CHARGER_B1',
      partnerId: savedPartnerB.id,
      name: 'Charger B1',
      status: ChargerStatus.BLOCKED,
      location: {
        latitude: 31.2304,
        longitude: 121.4737,
        address: 'Shanghai',
      },
      configuration: {
        powerRating: 40,
        connectorType: 'Type2',
        voltage: 380,
        current: 100,
      },
    });

    await chargerRepository.save([chargerA1, chargerA2, chargerB1]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const chargerRepository = queryRunner.manager.getRepository(Charger);
    const partnerRepository = queryRunner.manager.getRepository(Partner);

    // Delete chargers
    await chargerRepository.delete({
      chargerId: In(['CHARGER_A1', 'CHARGER_A2', 'CHARGER_B1']),
    });

    // Delete partners
    await partnerRepository.delete({
      email: In(['partnerA@example.com', 'partnerB@example.com']),
    });
  }
}
