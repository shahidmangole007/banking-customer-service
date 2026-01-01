import { ApiProperty } from '@nestjs/swagger';
import {IsEmail,IsMobilePhone,IsNotEmpty,IsOptional,IsString,Matches,Length, IsNumber, MinLength, MaxLength, IsEnum,} from 'class-validator';
import { AddressType } from '../enums/addressType.enum';
import { KycDocumentStatus, KycDocumentType } from '../enums/kycDocumentStatus.enum';

export class CreateCustomerDto {

  @ApiProperty({ example: 'Shahid' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Munir', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Mangole' })
  @IsNotEmpty()
  @IsString() 
  lastName: string;

  @ApiProperty({ example: '7748796854' })
  @IsNotEmpty()
  @IsMobilePhone('en-IN', {}, { message: 'Invalid Indian mobile number' })
  mobile: string;

  @ApiProperty({ example: 'ABCDE1234F' })
  @IsNotEmpty()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {message: 'Invalid PAN format'})
  panNumber: string;

  @ApiProperty({example: '1234',description: 'Last 4 digits of Aadhaar only',required: false})
  @IsOptional()
  @Length(4, 4, { message: 'Aadhaar last 4 digits required' })
  aadhaarLast4?: string;
}


export class CreateAddressDTO {

      @ApiProperty({ example: '30bbc232-7781-46ff-87be-645e819e3d0j' })
      @IsNotEmpty()
      @IsString()
      customerId : string;
  
      @ApiProperty({ example: 'PERMANENT  or CURRENT OR OFFICE'  })
      @IsNotEmpty()
      @IsEnum(AddressType, {
        message: 'addressType must be PERMANENT, CURRENT, or OFFICE',
      })
      addressType: AddressType;

      @ApiProperty({ example: 'stree1 near lake '  })
      @IsNotEmpty()
      @IsString()
      line1: string;

      @ApiProperty({ example: 'beside building A' })
      @IsString()
      line2: string;

      @ApiProperty({ example: 'Mumbai'  })
      @IsNotEmpty()
      @IsString()
      city: string;

      @ApiProperty({ example: 'Maharashtra'  })
      @IsNotEmpty()
      @IsString()  
      state: string;

      @ApiProperty({ example: '411001' })
      @IsString()
      @Matches(/^[1-9][0-9]{5}$/, {
        message: 'Pincode must be a valid 6-digit Indian PIN code',
      })
      pincode: string;

      @ApiProperty({ example: 'India'  })
      @IsNotEmpty()
      @IsString()  
      country: string;

}

export class CreateKycDocumentDto {

  @ApiProperty({ enum: ['PAN', 'AADHAAR', 'PHOTO'] })
  @IsEnum(KycDocumentType,{message : "document must PAN or AADHAAR or PHOTO "})
  documentType: KycDocumentType;

}


export class UpdateKycStatus {

  @IsEnum([KycDocumentStatus.VERIFIED,KycDocumentStatus.REJECTED ])
  status : KycDocumentStatus

}



