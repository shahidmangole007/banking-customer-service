import { Entity, PrimaryGeneratedColumn,Column, ManyToOne, CreateDateColumn, UpdateDateColumn,} from 'typeorm';
import { Customer } from './customers.entity';
import { KycDocumentStatus, KycDocumentType } from '../enums/kycDocumentStatus.enum';

export enum verifiedBy {
    ADMIN = 'ADMIN',
    SYSTEM = 'SYSTEM',
    USER_ID = 'USER_ID',
}

@Entity('customer_kyc_document')
export class CustomerKycDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;



    @ManyToOne(()=> Customer , (customer)=>customer.kycDocuments , { onDelete : "CASCADE"} )
    customer : Customer

    @Column({
        type: 'enum',
        enum: KycDocumentType,
    })
    documentType: KycDocumentType;

    @Column({ name: 'document_path' })
    documentPath: string; // MinIO / S3 object key

    @Column({ name: 'document_hash' })
    documentHash: string; // SHA-256 / similar

    @Column({ type: 'enum',enum: KycDocumentStatus, default: KycDocumentStatus.UPLOADED})
    status: KycDocumentStatus;

    @Column({ name: 'verified_at', nullable: true })
    verifiedAt: Date;

    @Column({ name: 'verified_by', type: 'enum', enum: verifiedBy, nullable: true})
    verifiedBy: verifiedBy;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
