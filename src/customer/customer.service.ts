import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer, CustomerStatus, KycStatus } from './entity/customers.entity';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';
import { CreateAddressDTO, CreateCustomerDto, CreateKycDocumentDto, UpdateKycStatus } from './dto/dto';
import * as crypto from 'crypto';
import { CustomerAddress } from './entity/customer_addresses.entity';
import { CustomerKycDocument, VerifiedBy } from './entity/customer_kyc_document.entity';
import { KycDocumentStatus, KycDocumentType } from './enums/kycDocumentStatus.enum';
import { CloudService } from 'src/services/cloud-service/cloud-service.service';



@Injectable()
export class CustomerService {



    constructor(
        @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
        @InjectRepository(CustomerAddress) private readonly addressRepository: Repository<CustomerAddress>,
        @InjectRepository(CustomerKycDocument) private readonly kycRepository: Repository<CustomerKycDocument>,
        private readonly cloudService: CloudService
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




    async createAddress(dto: CreateAddressDTO) {
        try {
            const customer = await this.customerRepository.findOne({
                where: { id: dto.customerId },
            });

            if (!customer) {
                throw new NotFoundException('Customer not found');
            }


            const existingAddress = await this.addressRepository.findOne({
                where: {
                    customer: { id: dto.customerId },
                    addressType: dto.addressType,
                },
            });

            if (existingAddress) {
                throw new ConflictException(
                    `Address already exists for type ${dto.addressType}`,
                );
            }

            const address = this.addressRepository.create({
                customer: customer,
                addressType: dto.addressType,
                line1: dto.line1,
                line2: dto.line2,
                city: dto.city,
                state: dto.state,
                country: dto.country,
                pincode: dto.pincode,
            });

            return await this.addressRepository.save(address);

        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }


            throw new InternalServerErrorException(
                'Failed to create customer address',
            );
        }
    }


    async getAddress(customerId: string) {
        try {
            const addresses = await this.addressRepository.find({
                where: {
                    customer: { id: customerId },
                },
            });

            if (!addresses || addresses.length === 0) {
                throw new NotFoundException('Address not found for customer');
            }

            return addresses;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Failed to fetch customer address',
            );
        }
    }


    async uploadKyc(customerId: string, file: Express.Multer.File, dto: CreateKycDocumentDto) {
        try {
            const customer = await this.customerRepository.findOne({
                where: { id: customerId }
            })

            if (!customer) {
                throw new NotFoundException("customer not found")
            }

            const existingDoc = await this.kycRepository.findOne({
                where: {
                    customer: { id: customerId },
                    documentType: dto.documentType
                }
            })

            if (existingDoc) {
                throw new ConflictException(`${dto.documentType} document already uploaded`)
            }

            const documentHash = crypto
                .createHash('sha256')
                .update(file.buffer)
                .digest('hex');

            const objectKey = `kyc/${customerId}/${dto.documentType}-${Date.now()}`

            await this.cloudService.upload(objectKey, file.buffer, file.mimetype)

            const kycDocument = await this.kycRepository.create({
                customer,
                documentType: dto.documentType,
                documentPath: objectKey,
                documentHash,
                mimeType: file.mimetype,
                fileSize: file.size,
                status: KycDocumentStatus.UPLOADED,
            })

            await this.kycRepository.save(kycDocument)

            return {
                message: `${dto.documentType} uploaded successfully`,
                documentId: kycDocument.id,
                status: kycDocument.status,
            }

        } catch (error) {

            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Failed to upload KYC ${dto.documentType}`,
            );


        }
    }




    async getKycDownloadUrl(
        customerId: string,
        documentType: KycDocumentType,
    ) {
        try {

            const doc = await this.kycRepository.findOne({
                where: {
                    customer: { id: customerId },
                    documentType,
                },
            });

            if (!doc) {
                throw new NotFoundException('KYC document not found');
            }


            const signedUrl = await this.cloudService.generateSignedUrl(
                doc.documentPath,
            );

            return {
                documentType,
                downloadUrl: signedUrl,
                expiresInSeconds: 300,
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `Failed to download ${documentType}`,
            );
        }
    }


    async approveOrRejectKyc(customerId: string, documentType: KycDocumentType, dto: UpdateKycStatus) {
        try {
            const doc = await this.kycRepository.findOne({
                where: {
                    customer: { id: customerId },
                    documentType: documentType
                }
            })

            if (!doc) {
                throw new NotFoundException("kyc document not found")
            }

            if (doc.status === KycDocumentStatus.VERIFIED) {
                throw new BadRequestException("document already verified")
            }

            doc.status = dto.status
            doc.verifiedAt = new Date()
            doc.verifiedBy = VerifiedBy.ADMIN

            await this.kycRepository.save(doc)

            return {
                message: `KYC document ${dto.status.toLowerCase()} successfully `,
                documentType: documentType,
                status: dto.status
            }


        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(
                `failed to KYC document ${dto.status.toLowerCase()} `,
            );
        }
    }

}
