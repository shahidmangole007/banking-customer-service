import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entity/customers.entity';
import { CustomerKycDocument } from './entity/customer_kyc_document.entity';
import { CustomerAddress } from './entity/customer_addresses.entity';
import { CloudService } from 'src/services/cloud-service/cloud-service.service';

@Module({
  providers: [CustomerService, CloudService],
  imports : [TypeOrmModule.forFeature([Customer , CustomerKycDocument , CustomerAddress])],
  exports : [CustomerService]
  

})
export class CustomerModule {}
