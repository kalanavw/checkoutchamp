export interface Customer {
    id?: string;
    name: string;
    phone: string;
    type: string;
    address?: string;
    email?: string;
    registrationDate: Date;
    createdAt?: Date;
    createdBy?: string;
    modifiedDate?: Date;
    modifiedBy?: string;
}
