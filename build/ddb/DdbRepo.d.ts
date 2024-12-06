import { DynamoDB } from "@aws-sdk/client-dynamodb";
export declare class DdbRepo {
    tableName: string;
    constructor(tableName: string);
    getById<T>(id: string | number): Promise<T | undefined>;
    getByIds<T>(...ids: (string | number)[]): Promise<T[]>;
    deleteById(id: string | number): Promise<boolean>;
    save<T>(value: T): Promise<boolean>;
    static testConnection(client?: DynamoDB): Promise<boolean>;
    protected static getClient(): DynamoDB;
    /** ensures the table exists ... DEBUG / TEST ONLY */
    static for(tableName: string): Promise<DdbRepo>;
}
