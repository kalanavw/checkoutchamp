
export interface Warehouse {
    id: string; // Changed from optional to required
    name: string;
    code: string;
    description?: string;
    createdAt?: Date;
    createdBy?: string;
    modifiedDate?: Date;
    modifiedBy?: string;
}
