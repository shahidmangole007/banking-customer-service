import {Column,CreateDateColumn,Entity,OneToMany,PrimaryGeneratedColumn,UpdateDateColumn,
} from 'typeorm';
import { CustomerKycDocument } from './customer_kyc_document.entity';

export enum KycStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

export enum CustomerStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
}

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    customerCode: string;

    @Column()
    firstName: string;

    @Column({ nullable: true })
    middleName: string;

    @Column()
    lastName: string;

    @Column({ length: 15, unique: true })
    mobile: string;

    @Column({ name: 'pan_masked', length: 20 })
    panMasked: string;

    @Column({ name: 'pan_hash', length: 64, unique: true })
    panHash: string;

    @Column({ length: 4, nullable: true })
    aadhaarLast4: string;

    @Column({
        type: 'enum',
        enum: KycStatus,
        default: KycStatus.PENDING,
    })
    kycStatus: KycStatus;

    @Column({type: 'enum', enum: CustomerStatus,default: CustomerStatus.ACTIVE})
    status: CustomerStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => CustomerKycDocument, (kycDocument) => kycDocument.customer)
    kycDocuments: CustomerKycDocument[];
}
