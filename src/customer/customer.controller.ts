import { Body, Controller, Get, Param, Post, Put, Query, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateCustomerDto } from './dto/dto';
import { Customer } from './entity/customers.entity';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {

    constructor(private readonly customerService : CustomerService){}

    @ApiOperation({ summary: 'Create  a new Customer' })
    @ApiResponse({ status: 201, description: 'Customer registered successfully.' })
    @ApiResponse({ status: 400, description: 'Customer creation Failed' })
    @ApiResponse({ status: 409, description: 'Customer already exists.' })
    // @Throttle({ default: { limit: 3, ttl: 60 } })
    @Version('1')
    @Post()
    customers(@Body() dto :CreateCustomerDto){
        return this.customerService.createCustomer(dto);
    }


    @Get(':id')
    getCustomerById(@Param('id') id : string){
        return this.customerService.getCustomerById(id)
    }


    @Get()
    async searchCustomer( @Query('mobile') mobile?: string,@Query('customerCode') customerCode?: string,) {
        return this.customerService.searchCustomer({ mobile, customerCode });
    }

    @Put(':id/block')
    async blockCustomer(@Param('id') id: string) {
        return this.customerService.blockCustomer(id);
    }

   
    @Put(':id/unblock')
    async unblockCustomer(@Param('id') id: string) {
        return this.customerService.unblockCustomer(id);
    }



}
