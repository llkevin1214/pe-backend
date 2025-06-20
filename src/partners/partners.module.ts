import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from '../entities/partner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Partner])],
  providers: [],
  exports: [],
})
export class PartnersModule {}
