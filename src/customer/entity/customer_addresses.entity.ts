import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AddressType } from "../enums/addressType.enum";
import { Customer } from "./customers.entity";



@Entity("customer_addresses")
export class CustomerAddress {

    @PrimaryGeneratedColumn("uuid")
    id: string;


    @OneToOne(() => Customer, { onDelete: "CASCADE" })
    @JoinColumn({ name: "customer_id" })
    customer: Customer;

    @Column() 
    addressType: AddressType;

    @Column({ length: 150 })
    line1: string;

    @Column({ length: 150, nullable: true })
    line2: string;

    @Column({ length: 50 })
    city: string;

    @Column({ length: 50 })
    state: string;

    @Column({ })
    pincode: string;

    @Column({ length: 50 })
    country: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
