export declare class Enable2faDto {
    secret: string;
    token: string;
    recoveryCodes: string[];
}
export declare class Verify2faDto {
    challengeToken?: string;
    code: string;
}
export declare class Disable2faDto {
    token: string;
}
