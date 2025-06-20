import { DataSource } from 'typeorm';
import { AdminUser } from './entities/admin-user.entity';
// Add other entities as needed

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ev_charging',
  entities: [AdminUser],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
