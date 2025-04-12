
export interface Customer {
    id: string;  // Changed from optional to required
    name: string;
    phone: string;
    type: string;
    address?: string;
    email?: string;
    registrationDate: Date;
    createdDate?: Date;
    createdBy?: string;
    modifiedDate?: Date;
    modifiedBy?: string;
}
