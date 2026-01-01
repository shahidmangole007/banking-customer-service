import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,CreateDateColumn,UpdateDateColumn,Index,} from 'typeorm';
import { Customer } from './customers.entity';
import { KycDocumentStatus, KycDocumentType } from '../enums/kycDocumentStatus.enum';

export enum VerifiedBy {
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
  USER = 'USER',
}

@Entity('customer_kyc_documents')
@Index(['customer', 'documentType'], { unique: true }) 
export class CustomerKycDocument {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, customer => customer.kycDocuments, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: KycDocumentType,
  })
  documentType: KycDocumentType; 

  @Column({ name: 'document_path' })
  documentPath: string; 

  @Column({ name: 'document_hash', length: 64 })
  documentHash: string; 

  @Column({ name: 'mime_type' })
  mimeType: string; 

  @Column({ name: 'file_size' })
  fileSize: number; 

  @Column({ type: 'enum', enum: KycDocumentStatus, default: KycDocumentStatus.UPLOADED})
  status: KycDocumentStatus; 

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'verified_by', type: 'enum', enum: VerifiedBy, nullable: true})
  verifiedBy: VerifiedBy;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
