import type { AttributeValue } from "@aws-sdk/client-dynamodb";
export declare function serialize(value: []): AttributeValue.LMember;
export declare function serialize(value: Set<number>): AttributeValue.NSMember;
export declare function serialize(value: Set<string>): AttributeValue.SSMember;
export declare function serialize(value: "boolean"): AttributeValue.BOOLMember;
export declare function serialize(value: "number"): AttributeValue.NMember;
export declare function serialize(value: "string"): AttributeValue.SMember;
export declare function serialize(value: "object"): AttributeValue.MMember;
