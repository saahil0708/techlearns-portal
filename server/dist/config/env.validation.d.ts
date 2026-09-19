export declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    TOTP_ENCRYPTION_KEY?: string;
    TOTP_PREVIOUS_ENCRYPTION_KEYS?: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD?: string;
    JUDGE_QUEUE_NAME: string;
    JUDGE_IMAGE?: string;
}
export declare function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables;
