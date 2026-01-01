import { Body, Controller, Get, Patch, Param, Post, Put, Query, Version, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateAddressDTO, CreateCustomerDto, CreateKycDocumentDto, UpdateKycStatus } from './dto/dto';
import { Customer } from './entity/customers.entity';
import { CustomerService } from './customer.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './constants/file.constants';
import { KycDocumentType } from './enums/kycDocumentStatus.enum';

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


    // address Endpoints

    @Post('/addresses')
    async createAddress(@Body() dto : CreateAddressDTO){
        return this.customerService.createAddress(dto)
    }

    @Get(':id/addresses')
    async getAddress(@Param('id') id : string){
        return this.customerService.getAddress(id)
    }


    // KYC docs

    @Post(':id/kyc-documents')
    @UseInterceptors(
    FileInterceptor('file', {
        limits: {
        fileSize: MAX_FILE_SIZE,
        },
        fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(
            new BadRequestException(
                'Only PDF, JPG, and PNG files are allowed',
            ),
            false
            )
        }
        cb(null, true)
        }
    })
    )
    @ApiConsumes('multipart/form-data')
    async uploadKycDocument(
    @Param('id') customerId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateKycDocumentDto,
    ) {
        return this.customerService.uploadKyc(customerId, file, dto);
    }





    @Get(':customerId/kyc-documents/:documentType/download')
    async downloadKycDocument(
    @Param('customerId') customerId: string,
    @Param('documentType') documentType: KycDocumentType,
    ) {
        return this.customerService.getKycDownloadUrl(
            customerId,
            documentType,
        );
    }


    @Patch(':customerId/kyc-documents/:documentType')
    async approveOrRejectKyc(
        @Param('customerId') customerId : string,
        @Param('documentType') documentType : KycDocumentType,
        @Body() dto : UpdateKycStatus
    ){
        return this.customerService.approveOrRejectKyc(customerId , documentType , dto)
    }


    





}
