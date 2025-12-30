import { ApiProperty } from '@nestjs/swagger';
import {IsEmail,IsMobilePhone,IsNotEmpty,IsOptional,IsString,Matches,Length,} from 'class-validator';

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
