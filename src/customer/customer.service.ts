import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer, CustomerStatus, KycStatus } from './entity/customers.entity';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/dto';
import * as crypto from 'crypto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class CustomerService {

    constructor(
        @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>
    ) { }

    async createCustomer(dto: CreateCustomerDto) {
        const panHash = crypto
            .createHash('sha256')
            .update(dto.panNumber)
            .digest('hex');


        const existingCustomer = await this.customerRepository.findOne({
            where: [
                { mobile: dto.mobile },
                { panHash: panHash }
            ],
        });

        if (existingCustomer) {
            throw new ConflictException(
                'Customer already exists with same PAN or mobile'
            );
        }

        const customer = this.customerRepository.create({
            customerCode: `CIF-${crypto.randomUUID()}`,
            firstName: dto.firstName,
            middleName: dto.middleName,
            lastName: dto.lastName,
            mobile: dto.mobile,
            panMasked: this.maskPan(dto.panNumber),
            panHash: panHash,
            aadhaarLast4: dto.aadhaarLast4,
            kycStatus: KycStatus.PENDING,
            status: CustomerStatus.ACTIVE,
        });

        try {

            return await this.customerRepository.save(customer);

        } catch (error: any) {
            console.log(error);

            if (error instanceof QueryFailedError && error.cause === '23505') {
                throw new ConflictException(
                    'Duplicate customer detected (PAN or mobile)'
                );
            }

            throw error;
        }
    }


    private maskPan(pan: string): string {
        return pan.replace(/^(.{5}).*(.{1})$/, '$1****$2');
    }

    async getCustomerById(id: string) {
        try {
            const customer = await this.customerRepository.findOne({
                where: { id },
                relations: ['kycDocuments'],
            });

            if (!customer) {
                throw new NotFoundException('Customer not found');
            }

            return customer;

        } catch (error) {

            if (error instanceof EntityNotFoundError) {
                throw new NotFoundException('Customer not found');
            }

            throw error
        }
    }

    async searchCustomer(query: { mobile: string | undefined; customerCode: string | undefined; }) {
        if (!query.mobile && !query.customerCode) {
            throw new BadRequestException('Search parameter required');
        }

        try {
            const customer = await this.customerRepository.find({
                where: {
                    ...(query.mobile && { mobile: query.mobile }),
                    ...(query.customerCode && { customerCode: query.customerCode }),
                },
            });

            if (customer.length === 0) {
                throw new NotFoundException('Customer not found ')
            }

            return customer

        } catch (error) {

            if (error instanceof EntityNotFoundError) {
                throw new NotFoundException('Customer not found');
            }

            throw error
        }
    }

    async blockCustomer(id: string) {
        try {
            const result = await this.customerRepository.update(
                { id, status: CustomerStatus.ACTIVE }, 
                { status: CustomerStatus.BLOCKED }
            );

            if (result.affected === 0) {
                throw new NotFoundException('Customer not found or already blocked');
            }

            return {
                message: 'Customer blocked successfully',
                customerId: id,
            };
        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to block customer'
            );
        }
    }



    async unblockCustomer(id: string) {
        try {
            const result = await this.customerRepository.update(
                { id, status: CustomerStatus.BLOCKED }, 
                { status: CustomerStatus.ACTIVE }
            );

            if (result.affected === 0) {
                throw new NotFoundException('Customer not found or already unblocked');
            }

            return {
                message: 'Customer unblocked successfully',
                customerId: id,
            };
        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to unblock customer'
            );
        }
    }

}
