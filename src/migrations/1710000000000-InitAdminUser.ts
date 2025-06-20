import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class InitAdminUser1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const username = 'admin';
    const password = 'ABcd1234!'; // You can change the initial password
    const hashed = await bcrypt.hash(password, 10);

    await queryRunner.query(
      `INSERT INTO admin_users (username, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now())`,
      [username, hashed, 'admin'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM admin_users WHERE username = $1`, [
      'admin',
    ]);
  }
}
