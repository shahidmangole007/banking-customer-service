import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Module({
  providers: [CustomerService]
})
export class CustomerModule {}
